from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

class JobStatus(str, Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class User(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    id: str
    google_id: str
    email: EmailStr
    name: str
    picture_url: str

class LoginRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    code: str

class LoginResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    access_token: str
    token_type: str
    user: User

class Email(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    id: str
    thread_id: str
    subject: str
    sender: str
    date: datetime
    snippet: str
    labels: List[str]
    is_unread: bool
    has_attachments: bool

class EmailFilter(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    time_range: Optional[str] = "24h"
    labels: Optional[List[str]] = None
    is_unread: Optional[bool] = None
    query: Optional[str] = None

class JobApplication(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    id: str
    user_id: str
    company_name: str
    position_title: str
    status: JobStatus
    application_date: date
    salary_range: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class CreateJobRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    company_name: str
    position_title: str
    status: JobStatus = JobStatus.APPLIED
    application_date: date
    salary_range: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class UpdateJobRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    company_name: Optional[str] = None
    position_title: Optional[str] = None
    status: Optional[JobStatus] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class ApiResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None
