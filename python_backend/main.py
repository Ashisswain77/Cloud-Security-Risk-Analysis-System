from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scanner import scan_ec2, scan_s3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    accessKey: str
    secretKey: str
    region: str
    scanDepth: str = "Basic"

@app.get("/")
def home():
    return {"message":"Shadow IT Detection API"}

@app.post("/scan")
def run_scan(req: ScanRequest):
    try:
        ec2 = scan_ec2(req.accessKey, req.secretKey, req.region)
        s3 = scan_s3(req.accessKey, req.secretKey, req.region)

        return {
            "results": ec2 + s3
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
