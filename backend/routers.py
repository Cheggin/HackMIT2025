from fastapi import APIRouter, HTTPException, status
from typing import List
from models import (
    User, UserCreate, UserUpdate, 
    Project, ProjectCreate, ProjectUpdate, 
    BaseResponse, HealthResponse, EchoResponse
)
from database import db_service
from datetime import datetime

# Create router instances
api_router = APIRouter(prefix="/api", tags=["API"])
users_router = APIRouter(prefix="/api/users", tags=["Users"])
projects_router = APIRouter(prefix="/api/projects", tags=["Projects"])
# User Routes

@api_router.get("/agent-query")
async def agent_query(limit: int = 100) -> List[dict[str, any]]:
    result = await db_service.agent_query(limit)
    return result

@users_router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    # Check if user already exists
    existing_user = await db_service.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    user_data = {
        "email": user.email,
        "name": user.name,
        "created_at": datetime.now().isoformat()
    }
    
    new_user = await db_service.create_user(user_data)
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    return new_user

@users_router.get("/", response_model=List[User])
async def get_users():
    users = await db_service.get_all_users()
    return users

@users_router.get("/{user_id}", response_model=User)
async def get_user(user_id: int):
    user = await db_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@users_router.put("/{user_id}", response_model=User)
async def update_user(user_id: int, user_update: UserUpdate):
    # Check if user exists
    existing_user = await db_service.get_user(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if email is being updated and if it's already taken
    if user_update.email and user_update.email != existing_user["email"]:
        email_user = await db_service.get_user_by_email(user_update.email)
        if email_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
    
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if not update_data:
        return existing_user
    
    updated_user = await db_service.update_user(user_id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )
    
    return updated_user

@users_router.delete("/{user_id}", response_model=BaseResponse)
async def delete_user(user_id: int):
    # Check if user exists
    existing_user = await db_service.get_user(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    success = await db_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
    
    return BaseResponse(success=True, message="User deleted successfully")

# Project Routes
@projects_router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate):
    # Verify owner exists
    owner = await db_service.get_user(project.owner_id)
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner not found"
        )
    
    project_data = {
        "title": project.title,
        "description": project.description,
        "owner_id": project.owner_id,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    new_project = await db_service.create_project(project_data)
    if not new_project:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project"
        )
    
    return new_project

@projects_router.get("/", response_model=List[Project])
async def get_projects():
    projects = await db_service.get_all_projects()
    return projects

@projects_router.get("/{project_id}", response_model=Project)
async def get_project(project_id: int):
    project = await db_service.get_project(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project

@projects_router.get("/user/{user_id}", response_model=List[Project])
async def get_user_projects(user_id: int):
    # Verify user exists
    user = await db_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    projects = await db_service.get_user_projects(user_id)
    return projects

@projects_router.put("/{project_id}", response_model=Project)
async def update_project(project_id: int, project_update: ProjectUpdate):
    # Check if project exists
    existing_project = await db_service.get_project(project_id)
    if not existing_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    update_data = {k: v for k, v in project_update.dict().items() if v is not None}
    if not update_data:
        return existing_project
    
    update_data["updated_at"] = datetime.now().isoformat()
    
    updated_project = await db_service.update_project(project_id, update_data)
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update project"
        )
    
    return updated_project

@projects_router.delete("/{project_id}", response_model=BaseResponse)
async def delete_project(project_id: int):
    # Check if project exists
    existing_project = await db_service.get_project(project_id)
    if not existing_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    success = await db_service.delete_project(project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project"
        )
    
    return BaseResponse(success=True, message="Project deleted successfully")