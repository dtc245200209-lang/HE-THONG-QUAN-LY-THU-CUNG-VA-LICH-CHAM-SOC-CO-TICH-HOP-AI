import inspect
from typing import Callable, Dict, Any, List

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}

    def register(self, name: str, func: Callable):
        self._tools[name] = func

    def get_tool(self, name: str) -> Callable:
        return self._tools.get(name)

    def get_all_tool_schemas(self) -> List[Dict[str, Any]]:
        schemas = []
        for name, func in self._tools.items():
            doc = inspect.getdoc(func) or ""
            schemas.append({
                "type": "function",
                "function": {
                    "name": name,
                    "description": doc,
                    # Real implementation should parse signature or use Pydantic models
                    "parameters": {
                        "type": "object",
                        "properties": {},
                    }
                }
            })
        return schemas

tool_registry = ToolRegistry()

# Define tools
def get_pet_summary(pet_id: str):
    """Retrieve summary information of a specific pet."""
    # Mock implementation
    return {"pet_id": pet_id, "name": "Milo", "species": "Dog", "breed": "Golden Retriever"}

def get_current_care_status(pet_id: str):
    """Get the current care session status of a pet."""
    return {"pet_id": pet_id, "status": "IN_PROGRESS", "current_step": "Grooming"}

def get_upcoming_appointments(pet_id: str = None, user_id: str = None):
    """Get upcoming appointments for a pet or user."""
    return [{"date": "2026-10-01", "service": "Vaccination", "status": "CONFIRMED"}]

tool_registry.register("get_pet_summary", get_pet_summary)
tool_registry.register("get_current_care_status", get_current_care_status)
tool_registry.register("get_upcoming_appointments", get_upcoming_appointments)
