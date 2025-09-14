from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# Base response model
class BaseResponse(BaseModel):
    success: bool
    message: str

# Graph models 
class GraphBase(BaseModel): 
    type: str
    title: str
    sql_query: str

class GraphCreate(GraphBase):
    pass

class Graph(GraphBase):
    id: int
    created_at: datetime
    update_at: datetime

class AgentQueryResponse(BaseModel):
    events: List[dict[str, Any]]

# User models
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Project models
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    owner_id: int

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# API Response models
class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime
    database_connected: bool

class EchoResponse(BaseModel):
    received_data: dict
    message: str
