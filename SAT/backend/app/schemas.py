from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    sentence: str