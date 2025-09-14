from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Dict, Any
from models import (
    AgentQueryResponse, 
    Graph, GraphCreate, 
    BaseResponse, HealthResponse, EchoResponse
)
from database import db_service
from datetime import datetime
import logging
import base64
from generate_financial_reports import run_graph_management_agent
import os

logger = logging.getLogger(__name__)

# Create router instances
api_router = APIRouter(prefix="/api", tags=["API"])
graphs_router = APIRouter(prefix="/api/graphs", tags=["Graphs"])

# API Routes
@api_router.get("/hello")
async def hello_world():
    return {"message": "Hello from FastAPI!"}

@api_router.post("/echo", response_model=EchoResponse)
async def echo_data(data: dict):
    return EchoResponse(
        received_data=data,
        message="Data received successfully"
    )

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    db_connected = await db_service.test_connection()
    return HealthResponse(
        status="healthy",
        message="API is running",
        timestamp=datetime.now(),
        database_connected=db_connected
    )

@api_router.get("/agent-query")
async def agent_query(limit: int = 100) -> AgentQueryResponse:
    result = await db_service.agent_query(limit)
    return AgentQueryResponse(events=result)

# Graph Routes
@graphs_router.get("/", response_model=List[Graph])
async def get_graphs():
    graphs = await db_service.get_all_graphs()
    return graphs

@graphs_router.get("/{graph_id}", response_model=Graph)
async def get_graph(graph_id: str):
    graph = await db_service.get_graph(graph_id)
    if not graph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Graph not found"
        )
    return graph

@graphs_router.post("/", response_model=Graph, status_code=status.HTTP_201_CREATED)
async def create_graph(graph: GraphCreate):
    graph_data = {
        "type": graph.type,
        "title": graph.title,
        "sql_query": graph.sql_query,
        "extra": graph.extra
    }
    new_graph = await db_service.create_graph(graph_data)
    if not new_graph:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create graph"
        )
    return new_graph

@graphs_router.put("/{graph_id}", response_model=Graph)
async def update_graph(graph_id: str, graph_update: GraphCreate):
    existing_graph = await db_service.get_graph(graph_id)
    if not existing_graph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Graph not found"
        )

    update_data = {k: v for k, v in graph_update.dict().items() if v is not None}

    updated_graph = await db_service.update_graph(graph_id, update_data)
    if not updated_graph:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update graph"
        )
    return updated_graph

@graphs_router.delete("/{graph_id}", response_model=BaseResponse)
async def delete_graph(graph_id: str):
    existing_graph = await db_service.get_graph(graph_id)
    if not existing_graph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Graph not found"
        )

    success = await db_service.delete_graph(graph_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete graph"
        )

    return BaseResponse(success=True, message="Graph deleted successfully")


@api_router.post("/generate-report")
async def generate_report(files: List[UploadFile] = File(...)):
    # Encode screenshots
    encoded_screenshots = []
    for f in files:
        content = await f.read()
        encoded_screenshots.append({
            "filename": f.filename,
            "content_base64": base64.b64encode(content).decode("utf-8")
        })

    # Call the agent (which will fetch recent financial data internally)
    pdf_path_or_url = run_graph_management_agent(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        images=encoded_screenshots
    )

    return {
        "success": True,
        "message": "Financial report generated successfully",
        "report_url": pdf_path_or_url
    }
    


