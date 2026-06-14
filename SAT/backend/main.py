from fastapi import FastAPI
from app.schemas import AnalyzeRequest

app = FastAPI()

@app.get("/")
def root():
    return {
        "message": "Syntactic Analysis API is running"
    }

@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    return {
        "sentence": data.sentence,
        "status": "received"
    }