from fastapi import FastAPI
from app.schemas import AnalyzeRequest
from app.model import load_model, predict_s_expression
from app.parser import s_expression_to_tree

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
    result = predict_s_expression(data.sentence)
    tree = s_expression_to_tree(result)

    return {
    "sentence": data.sentence,
    "s_expression": result
}