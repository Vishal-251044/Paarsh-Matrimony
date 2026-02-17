from bson import ObjectId
from datetime import datetime
from typing import Any, Dict, List, Union

def convert_objectid_to_str(data: Any) -> Any:
    """Recursively convert ObjectId to string in MongoDB documents"""
    if isinstance(data, ObjectId):
        return str(data)
    elif isinstance(data, datetime):
        return data.isoformat()
    elif isinstance(data, dict):
        return {key: convert_objectid_to_str(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_objectid_to_str(item) for item in data]
    elif isinstance(data, tuple):
        return tuple(convert_objectid_to_str(item) for item in data)
    else:
        return data

def serialize_document(doc: Union[Dict, List]) -> Union[Dict, List]:
    """Serialize MongoDB document for JSON response"""
    return convert_objectid_to_str(doc)