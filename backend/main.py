from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import api_router, graphs_router
import uvicorn

# Create FastAPI instance
app = FastAPI(
    title="HackMIT 2025 Backend API",
    description="Backend API for HackMIT 2025 project",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router)
app.include_router(graphs_router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to HackMIT 2025 Backend API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
