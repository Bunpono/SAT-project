from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AnalyzeRequest(BaseModel):
    sentence: str = Field(min_length=1, max_length=5000)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=8, max_length=72)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=72)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ErrorReportRequest(BaseModel):
    sentence: str = Field(min_length=1, max_length=5000)
    description: str = Field(min_length=1, max_length=5000)
    analysis_result: dict | None = None


class ErrorReportStatusRequest(BaseModel):
    status: Literal["open", "reviewing", "resolved"]
