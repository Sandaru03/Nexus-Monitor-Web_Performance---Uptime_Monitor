from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from database import init_db, get_latest_status, get_history, add_target, remove_target
from monitor import async_monitor_task, check_url
from pydantic import BaseModel

class TargetSite(BaseModel):
    url: str

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

@app.post("/api/targets")
def api_add_target(target: TargetSite):
    """Add a new website to monitor."""
    add_target(target.url)
    # Trigger an immediate check so the site appears instantly in the UI
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, check_url, target.url)
    return {"message": "Site added"}

@app.delete("/api/targets/{url:path}")
def api_delete_target(url: str):
    """Remove a website from monitoring."""
    remove_target(url)
    return {"message": "Site removed"}

@app.get("/api/status")
def read_status():
    """Returns the current status of all monitored sites."""
    return get_latest_status()

@app.get("/api/history/{url:path}")
def read_history(url: str):
    """Returns historical response times for a specific URL."""
    return get_history(url, limit=100)
