from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Optional
import uuid

from .models import (
    LoginRequest, LoginResponse, User, Email, JobApplication, 
    JobStatus, CreateJobRequest, UpdateJobRequest, EmailFilter
)
from .auth import verify_token, create_access_token
from .gmail_service import GmailService
from .config import settings
from .google_oauth import build_auth_url, exchange_code_for_tokens, get_userinfo

app = FastAPI(title="TrackMate API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Initialize database
def init_db():
    conn = sqlite3.connect('trackmate.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            google_id TEXT UNIQUE,
            email TEXT,
            name TEXT,
            picture_url TEXT,
            access_token TEXT,
            refresh_token TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Job applications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_applications (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            company_name TEXT,
            position_title TEXT,
            status TEXT,
            application_date DATE,
            salary_range TEXT,
            location TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        conn = sqlite3.connect('trackmate.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_data = cursor.fetchone()
        conn.close()
        
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
            
        return User(
            id=user_data[0],
            google_id=user_data[1],
            email=user_data[2],
            name=user_data[3],
            picture_url=user_data[4]
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# Authentication routes
@app.get("/api/auth/google/url")
async def google_auth_url(request: Request):
    """Return the Google OAuth2 authorization URL for the frontend to redirect to."""
    # Optional: include a CSRF state you manage via cookie/session
    state = str(uuid.uuid4())
    auth_url = build_auth_url(state)
    return {"authUrl": auth_url, "state": state}


@app.post("/api/auth/google/login", response_model=LoginResponse)
async def google_login(request: LoginRequest):
    """Exchange OAuth2 code for tokens, persist user, and return app JWT."""
    try:
        creds = exchange_code_for_tokens(request.code)

        # Extract profile info from Google using the OAuth access token
        id_info = get_userinfo(creds.token)

        google_id = id_info.get("sub") or ""
        email = id_info.get("email") or ""
        name = id_info.get("name") or (email.split("@")[0] if email else "User")
        picture = id_info.get("picture") or "https://via.placeholder.com/150"

        # Upsert user
        user_id = str(uuid.uuid4())
        conn = sqlite3.connect('trackmate.db')
        cursor = conn.cursor()
        # Try to find existing by google_id or email
        if google_id:
            cursor.execute("SELECT id FROM users WHERE google_id = ?", (google_id,))
            row = cursor.fetchone()
            if row:
                user_id = row[0]
        elif email:
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                user_id = row[0]

        cursor.execute(
            '''
            INSERT OR REPLACE INTO users (id, google_id, email, name, picture_url, access_token, refresh_token)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                user_id,
                google_id,
                email,
                name,
                picture,
                creds.token,
                creds.refresh_token,
            ),
        )
        conn.commit()
        conn.close()

        # Create app JWT
        access_token = create_access_token({"sub": user_id})

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=User(id=user_id, google_id=google_id or "", email=email or "user@example.com", name=name, picture_url=picture),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/auth/google/callback")
async def google_callback(code: Optional[str] = None, state: Optional[str] = None, format: Optional[str] = None):
    """OAuth2 callback endpoint. Exchanges code and returns app token + user.

    - If `format=json`, returns JSON body (handy for Swagger).
    - Otherwise, redirects to the frontend with `#token=...` fragment.
    """
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    login_resp: LoginResponse = await google_login(LoginRequest(code=code))

    if format == "json":
        return login_resp.model_dump(by_alias=True)

    # Redirect to frontend with the token in the URL hash
    redirect_url = f"{settings.FRONTEND_APP_URL}/auth/callback#token={login_resp.access_token}"
    return RedirectResponse(url=redirect_url)

@app.get("/api/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Email routes
@app.get("/api/emails/unread", response_model=List[Email])
async def get_unread_emails(current_user: User = Depends(get_current_user)):
    """Get unread emails from last 24 hours"""
    # Load user's OAuth creds
    conn = sqlite3.connect('trackmate.db')
    cursor = conn.cursor()
    cursor.execute("SELECT access_token, refresh_token FROM users WHERE id = ?", (current_user.id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="User credentials not found")

    access_token, refresh_token = row
    from google.oauth2.credentials import Credentials
    creds = Credentials(token=access_token, refresh_token=refresh_token, client_id=settings.GOOGLE_CLIENT_ID, client_secret=settings.GOOGLE_CLIENT_SECRET, token_uri="https://oauth2.googleapis.com/token")
    gmail_service = GmailService(creds)
    return [e.model_dump(by_alias=True) for e in gmail_service.get_unread_emails_24h()]

@app.get("/api/emails/requires-attention", response_model=List[Email])
async def get_requires_attention_emails(current_user: User = Depends(get_current_user)):
    """Get emails with 'Requires Attention' label"""
    conn = sqlite3.connect('trackmate.db')
    cursor = conn.cursor()
    cursor.execute("SELECT access_token, refresh_token FROM users WHERE id = ?", (current_user.id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="User credentials not found")

    access_token, refresh_token = row
    from google.oauth2.credentials import Credentials
    creds = Credentials(token=access_token, refresh_token=refresh_token, client_id=settings.GOOGLE_CLIENT_ID, client_secret=settings.GOOGLE_CLIENT_SECRET, token_uri="https://oauth2.googleapis.com/token")
    gmail_service = GmailService(creds)
    return [e.model_dump(by_alias=True) for e in gmail_service.get_requires_attention_emails()]

@app.get("/api/emails/{email_id}")
async def get_email_details(email_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed email content"""
    conn = sqlite3.connect('trackmate.db')
    cursor = conn.cursor()
    cursor.execute("SELECT access_token, refresh_token FROM users WHERE id = ?", (current_user.id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="User credentials not found")

    access_token, refresh_token = row
    from google.oauth2.credentials import Credentials
    creds = Credentials(token=access_token, refresh_token=refresh_token, client_id=settings.GOOGLE_CLIENT_ID, client_secret=settings.GOOGLE_CLIENT_SECRET, token_uri="https://oauth2.googleapis.com/token")
    gmail_service = GmailService(creds)
    return gmail_service.get_email_by_id(email_id)

# Job application routes
@app.get("/api/jobs", response_model=List[JobApplication])
async def get_job_applications(current_user: User = Depends(get_current_user)):
    """Get all job applications for current user"""
    conn = sqlite3.connect('trackmate.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM job_applications WHERE user_id = ? ORDER BY created_at DESC", (current_user.id,))
    jobs = cursor.fetchall()
    conn.close()
    
    return [
        JobApplication(
            id=job[0],
            user_id=job[1],
            company_name=job[2],
            position_title=job[3],
            status=JobStatus(job[4]),
            application_date=job[5],
            salary_range=job[6],
            location=job[7],
            notes=job[8]
        ) for job in jobs
    ]

@app.post("/api/jobs", response_model=JobApplication)
async def create_job_application(
    request: CreateJobRequest, 
    current_user: User = Depends(get_current_user)
):
    """Create new job application"""
    job_id = str(uuid.uuid4())
    
    conn = sqlite3.connect('trackmate.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO job_applications 
        (id, user_id, company_name, position_title, status, application_date, salary_range, location, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (job_id, current_user.id, request.company_name, request.position_title,
          request.status.value, request.application_date, request.salary_range,
          request.location, request.notes))
    conn.commit()
    conn.close()
    
    return JobApplication(
        id=job_id,
        user_id=current_user.id,
        company_name=request.company_name,
        position_title=request.position_title,
        status=request.status,
        application_date=request.application_date,
        salary_range=request.salary_range,
        location=request.location,
        notes=request.notes
    )

@app.put("/api/jobs/{job_id}", response_model=JobApplication)
async def update_job_application(
    job_id: str,
    request: UpdateJobRequest,
    current_user: User = Depends(get_current_user)
):
    """Update job application"""
    conn = sqlite3.connect('trackmate.db')
    cursor = conn.cursor()
    
    # Build update query dynamically
    updates = []
    values = []
    
    if request.status is not None:
        updates.append("status = ?")
        values.append(request.status.value)
    if request.company_name is not None:
        updates.append("company_name = ?")
        values.append(request.company_name)
    if request.position_title is not None:
        updates.append("position_title = ?")
        values.append(request.position_title)
    if request.salary_range is not None:
        updates.append("salary_range = ?")
        values.append(request.salary_range)
    if request.location is not None:
        updates.append("location = ?")
        values.append(request.location)
    if request.notes is not None:
        updates.append("notes = ?")
        values.append(request.notes)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.extend([job_id, current_user.id])
    query = f"UPDATE job_applications SET {', '.join(updates)} WHERE id = ? AND user_id = ?"
    
    cursor.execute(query, values)
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Job application not found")
    
    # Get updated job
    cursor.execute("SELECT * FROM job_applications WHERE id = ?", (job_id,))
    job = cursor.fetchone()
    conn.close()
    
    return JobApplication(
        id=job[0],
        user_id=job[1],
        company_name=job[2],
        position_title=job[3],
        status=JobStatus(job[4]),
        application_date=job[5],
        salary_range=job[6],
        location=job[7],
        notes=job[8]
    )

@app.delete("/api/jobs/{job_id}")
async def delete_job_application(job_id: str, current_user: User = Depends(get_current_user)):
    """Delete job application"""
    conn = sqlite3.connect('trackmate.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM job_applications WHERE id = ? AND user_id = ?", (job_id, current_user.id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Job application not found")
    
    conn.commit()
    conn.close()
    return {"message": "Job application deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
