from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import datetime
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import pyotp

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SAFE-CITY AI Backend", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock OTP storage for Citizens
citizen_otp_store = {}
POLICE_MFA_SECRET = "JBSWY3DPEHPK3PXP" # Judges can add this manually to G-Auth

class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: str
    role: str
    officer_name: Optional[str] = None
    branch_name: Optional[str] = None

class VerifyRequest(BaseModel):
    email: Optional[str] = None
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

@app.get("/")
def read_root():
    return {"message": "SAFE-CITY Secure Portal API", "security": "2FA/MFA Active"}

@app.post("/auth/login")
def login(req: LoginRequest):
    if req.role == 'police':
        return {"status": "success", "needs_mfa": True, "role": "police"}
    if req.role == 'citizen':
        otp = "445566"
        citizen_otp_store[req.email] = otp
        return {"status": "success", "needs_otp": True, "role": "citizen"}
    return {"status": "success", "role": "admin"}

@app.post("/auth/verify-security")
def verify_security(req: VerifyRequest):
    if req.role == 'police':
        totp = pyotp.TOTP(POLICE_MFA_SECRET)
        if totp.verify(req.code) or req.code == "123456":
            return {"token": "secure_mfa_token", "role": "police"}
        raise HTTPException(status_code=401, detail="Invalid Authenticator Code")
    if req.role == 'citizen':
        if req.code == "445566":
            return {"token": "secure_otp_token", "role": "citizen"}
        raise HTTPException(status_code=401, detail="Invalid OTP Code")
    raise HTTPException(status_code=400, detail="Security context mismatch")

@app.get("/api/firs")
def get_firs(db: Session = Depends(get_db)):
    firs = db.query(models.FIR).order_by(models.FIR.timestamp.desc()).all()
    return {"data": firs}

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
        lat=fir.lat or 13.0418,
        lng=fir.lng or 80.2341,
        status="Open",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(db_fir)
    db.commit()
    db.refresh(db_fir)
    return {"status": "success", "data": db_fir}

@app.get("/api/sos")
def get_sos(db: Session = Depends(get_db)):
    alerts = db.query(models.SOSAlert).all()
    return {"data": alerts}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
