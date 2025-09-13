from supabase import create_client, Client
from config import settings
from typing import Optional, List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseClient:
    client: Optional[Client] = None

    def __init__(self):
        self.client: Optional[Client] = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client with configuration"""
        try:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                logger.warning("Supabase credentials not found. Using mock client.")
                self.client = None
                return
            
            self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            self.client = None
    
    def is_connected(self) -> bool:
        """Check if Supabase client is connected"""
        return self.client is not None

# Global Supabase client instance
supabase_client = SupabaseClient()

class DatabaseService:
    """Service class for database operations using Supabase"""
    client: Optional[Client] = None
    
    def __init__(self):
        self.client = supabase_client.client

    async def agent_query(self, limit: int) -> List[Dict[str, Any]]:
        """Query for the top limit events in the database by time descending"""
        if not self.client:
            return "Error: Supabase client not available"
        try:
            result = self.client.table("events")\
                .select("*")\
                .order("time", desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error(f"Error querying database: {e}")
            return "Error: Failed to query database"

# Global database service instance
db_service = DatabaseService()
