from pydantic import BaseModel
from typing import Optional, Dict, List
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# SQLAlchemy models for database
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class TestResultDB(Base):
    __tablename__ = "test_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)  # Link to the user who ran the test
    test_name = Column(String)
    api_type = Column(String)  # REST, SOAP, GraphQL
    url = Column(String)
    vulnerable = Column(Boolean)
    confidence = Column(Float)
    description = Column(String)
    payload = Column(String, nullable=True)
    recommendation = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models for request/response validation
class APITestRequest(BaseModel):
    api_type: str  # "REST", "SOAP", "GraphQL"
    url: str
    method: str = "GET"
    headers: Dict[str, str] = {}
    params: Dict[str, str] = {}
    body: Optional[str] = None
    auth: Optional[Dict[str, str]] = None
    tests: List[str] = ["sql", "xss", "ssrf", "rate_limit"]

class TestResult(BaseModel):
    test_name: str
    vulnerable: bool
    confidence: float
    description: str
    payload: Optional[str] = None
    recommendation: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models to Pydantic

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ProtectedResponse(BaseModel):
    message: str
    username: str