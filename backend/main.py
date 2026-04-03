from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import datetime

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SAFE-CITY AI Backend", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class LoginRequest(BaseModel):
    email: str = None
    password: str
    role: str
    officer_name: Optional[str] = None
    branch_name: Optional[str] = None

class TwoFactorRequest(BaseModel):
    email: Optional[str]
    code: str
    role: str

class FIRCreate(BaseModel):
    crimeType: str
    location: str
    description: str
    severity: str
    officer: str
    branch: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class SOSCreate(BaseModel):
    type: str
    location: str
    lat: float
    lng: float

@app.get("/")
def read_root():
    return {"message": "Welcome to SAFE-CITY AI Secure API", "db_status": "Connected"}

@app.post("/auth/login")
def login(req: LoginRequest):
    # Simulated auth — in a real app, check req.password hash in DB
    if not req.password:
        raise HTTPException(status_code=400, detail="Password required")
    
    # For police role, they must provide officer and branch details
    if req.role == 'police':
        if not req.officer_name or not req.branch_name:
            raise HTTPException(status_code=400, detail="Police identity details required")
        
    return {
        "status": "success",
        "message": "Step 1 complete. MFA required.",
        "needs_2fa": True if req.role == 'police' else False,
        "user_temp": {
            "name": req.officer_name or req.email,
            "role": req.role
        }
    }

@app.post("/auth/verify-2fa")
def verify_2fa(req: TwoFactorRequest):
    # Google Authenticator code is always 6 digits
    if len(req.code) != 6:
        raise HTTPException(status_code=400, detail="Invalid code format")
    
    # Simple hardcoded check for the demo, should ideally use pyotp.TOTP(secret).verify(code)
    if req.code == "123456": # Standard mock code
       return {
           "token": "secure-jwt-token-hash",
           "role": req.role,
           "message": "MFA verified. Welcome Officer."
       }
    
    raise HTTPException(status_code=401, detail="Authentication code mismatch")

@app.post("/api/firs")
def create_fir(fir: FIRCreate, db: Session = Depends(get_db)):
    db_fir = models.FIR(
        fir_id=f"FIR-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
        crime_type=fir.crimeType,
        location=fir.location,
        description=fir.description,
        severity=fir.severity,
        officer_name=fir.officer,
        branch_name=fir.branch,
        lat=fir.lat,
        lng=fir.lng,
        status="Open",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(db_fir)
    db.commit()
    db.refresh(db_fir)
    return {"status": "success", "data": db_fir}

@app.get("/api/firs")
def get_firs(db: Session = Depends(get_db)):
    firs = db.query(models.FIR).order_by(models.FIR.timestamp.desc()).all()
    return {"data": firs}

@app.post("/api/sos")
def trigger_sos(sos: SOSCreate, db: Session = Depends(get_db)):
    db_sos = models.SOSAlert(
        type=sos.type,
        location=sos.location,
        lat=sos.lat,
        lng=sos.lng,
        status="active"
    )
    db.add(db_sos)
    db.commit()
    db.refresh(db_sos)
    return {"status": "success", "data": db_sos}

@app.get("/api/sos")
def get_sos(db: Session = Depends(get_db)):
    alerts = db.query(models.SOSAlert).all()
    return {"data": alerts}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
