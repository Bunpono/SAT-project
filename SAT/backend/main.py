from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Syntactic Analysis API is running"}