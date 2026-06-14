from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AnalyzeRequest(BaseModel):
    sentence: str

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