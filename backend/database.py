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
            
            # Use the correct Supabase client initialization
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

    async def agent_query(self, limit: int) -> list[dict[str, any]]:
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
            logger.error(f"Database connection test failed: {e}")
            return False
    
    # User operations
    async def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        if not self.client:
            logger.error("Supabase client not available")
            return None
        
        try:
            result = self.client.table("users").insert(user_data).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    async def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        if not self.client:
            return None
        
        try:
            result = self.client.table("users").select("*").eq("id", user_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        if not self.client:
            return None
        
        try:
            result = self.client.table("users").select("*").eq("email", email).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            return None
    
    async def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all users"""
        if not self.client:
            return []
        
        try:
            result = self.client.table("users").select("*").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            return []
    
    async def update_user(self, user_id: int, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user"""
        if not self.client:
            return None
        
        try:
            result = self.client.table("users").update(user_data).eq("id", user_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            return None
    
    async def delete_user(self, user_id: int) -> bool:
        """Delete user"""
        if not self.client:
            return False
        
        try:
            result = self.client.table("users").delete().eq("id", user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            return False
    
    # Project operations
    async def create_project(self, project_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new project"""
        if not self.client:
            return None
        
        try:
            result = self.client.table("projects").insert(project_data).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating project: {e}")
            return None
    
    async def get_project(self, project_id: int) -> Optional[Dict[str, Any]]:
        """Get project by ID"""
        if not self.client:
            return None
        
        try:
            result = self.client.table("projects").select("*").eq("id", project_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting project {project_id}: {e}")
            return None
    
    async def get_all_projects(self) -> List[Dict[str, Any]]:
        """Get all projects"""
        if not self.client:
            return []
        
        try:
            result = self.client.table("projects").select("*").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting all projects: {e}")
            return []
    
    async def get_user_projects(self, user_id: int) -> List[Dict[str, Any]]:
        """Get projects by user ID"""
        if not self.client:
            return []
        
        try:
            result = self.client.table("projects").select("*").eq("owner_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting projects for user {user_id}: {e}")
            return []
    
    async def update_project(self, project_id: int, project_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update project"""
        if not self.client:
            return None
        
        try:
            result = self.client.table("projects").update(project_data).eq("id", project_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating project {project_id}: {e}")
            return None
    
    async def delete_project(self, project_id: int) -> bool:
        """Delete project"""
        if not self.client:
            return False
        
        try:
            result = self.client.table("projects").delete().eq("id", project_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting project {project_id}: {e}")
            return False
        
    # Graph operations
    async def create_graph(self, graph_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new graph configuration"""
        if not self.client:
            logger.error("Supabase client not available")
            return None
        try:
            result = self.client.table("graphs").insert(graph_data).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating graph: {e}")
            return None

    async def get_graph(self, graph_id: int) -> Optional[Dict[str, Any]]:
        """Get graph by ID"""
        if not self.client:
            return None
        try:
            result = self.client.table("graphs").select("*").eq("id", graph_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting graph {graph_id}: {e}")
            return None

    async def get_all_graphs(self) -> List[Dict[str, Any]]:
        """Get all graphs"""
        if not self.client:
            return []
        try:
            result = self.client.table("graphs").select("*").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting all graphs: {e}")
            return []
        
    async def update_graph(self, graph_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a graph by ID"""
        if not self.client:
            return None
        try:
            result = self.client.table("graphs").update(update_data).eq("id", graph_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating graph {graph_id}: {e}")
            return None

    async def delete_graph(self, graph_id: int) -> bool:
        """Delete a graph by ID"""
        if not self.client:
            return False
        try:
            result = self.client.table("graphs").delete().eq("id", graph_id).execute()
            return bool(result.data)  # True if rows were deleted
        except Exception as e:
            logger.error(f"Error deleting graph {graph_id}: {e}")
            return False



# Global database service instance
db_service = DatabaseService()
