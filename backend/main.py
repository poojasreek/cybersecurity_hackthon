from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

app = FastAPI(title="SAFE-CITY AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mocked DB
firs = []
sos_alerts = []

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class FIRRequest(BaseModel):
    crimeType: str
    location: str
    description: str
    severity: str

class SOSRequest(BaseModel):
    location: str
    type: str

@app.get("/")
def read_root():
    return {"message": "Welcome to SAFE-CITY AI API"}

@app.post("/auth/login")
def login(req: LoginRequest):
    # Simulated auth logic based on role
    if req.email and req.password:
        return {"token": "fake-jwt-token", "role": req.role, "email": req.email, "message": "Login successful"}
    raise HTTPException(status_code=400, detail="Invalid credentials")

@app.get("/api/firs")
def get_firs():
    return {"data": firs, "message": "FIRs retrieved successfully"}

@app.post("/api/firs")
def create_fir(fir: FIRRequest):
    new_fir = {
        "id": f"FIR-{int(time.time())}",
        "crimeType": fir.crimeType,
        "location": fir.location,
        "description": fir.description,
        "severity": fir.severity,
        "status": "Open",
        "date": "2026-04-03", # mocked date
    }
    firs.append(new_fir)
    return {"data": new_fir, "message": "FIR created successfully"}

@app.post("/api/sos")
def trigger_sos(sos: SOSRequest):
    new_sos = {
        "id": int(time.time()),
        "type": sos.type,
        "location": sos.location,
        "status": "active"
    }
    sos_alerts.append(new_sos)
    return {"data": new_sos, "message": "SOS alert triggered!"}

@app.get("/api/sos")
def get_sos():
    return {"data": sos_alerts, "message": "SOS alerts retrieved"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
