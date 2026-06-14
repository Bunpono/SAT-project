from fastapi import FastAPI
from app.schemas import AnalyzeRequest
from app.model import load_model

app = FastAPI()

@app.get("/")
def root():
    return {
        "message": "Syntactic Analysis API is running"
    }

@app.get("/load-model")
def load_hf_model():

    load_model()

    return {
        "status": "model loaded"
    }

@app.post("/analyze")
def analyze(data: AnalyzeRequest):

    return {
        "sentence": data.sentence,
        "status": "received"
    }