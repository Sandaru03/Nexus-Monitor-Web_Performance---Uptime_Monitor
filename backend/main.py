from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from database import init_db, get_latest_status, get_history
from monitor import async_monitor_task

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB
    init_db()
    # Start the background monitoring task
    task = asyncio.create_task(async_monitor_task())
    yield
    # Cleanup task on exit
    task.cancel()

app = FastAPI(title="Web Performance & Uptime Monitor API", lifespan=lifespan)

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
def read_status():
    """Returns the current status of all monitored sites."""
    return get_latest_status()

@app.get("/api/history/{url:path}")
def read_history(url: str):
    """Returns historical response times for a specific URL."""
    return get_history(url, limit=100)
