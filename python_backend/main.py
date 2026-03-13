from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scanner import scan_ec2, scan_s3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message":"Shadow IT Detection API"}

@app.get("/scan")
def run_scan():

    ec2 = scan_ec2()
    s3 = scan_s3()

    return {
        "results": ec2 + s3
    }
