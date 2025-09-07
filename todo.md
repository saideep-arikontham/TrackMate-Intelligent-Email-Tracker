# TrackMate MVP Implementation Plan

## Backend (FastAPI)
1. **main.py** - FastAPI application setup with CORS and routes
2. **auth.py** - Google OAuth authentication endpoints
3. **gmail_service.py** - Gmail API integration for fetching emails
4. **models.py** - Pydantic models for API requests/responses
5. **database.py** - SQLite database setup for job tracking

## Frontend (React)
1. **App.jsx** - Main application with authentication state
2. **LoginPage.jsx** - Google OAuth login component
3. **Dashboard.jsx** - Main dashboard with three components
4. **EmailList.jsx** - Component for displaying email lists
5. **JobTracker.jsx** - Kanban-style job application tracker
6. **ThemeProvider.jsx** - Dark/light mode context

## Features Implementation Priority
- ✅ Google OAuth login system
- ✅ Gmail API integration (unread emails, labeled emails)
- ✅ Dashboard with three main components
- ✅ Job application kanban tracker
- ✅ Dark/light mode toggle
- ✅ Responsive UI with error handling

## Simplified Approach
- Use SQLite for job tracking (no external database setup needed)
- Mock Gmail API responses for demo (with real API structure)
- Local storage for authentication state
- Simple drag-and-drop for job tracker