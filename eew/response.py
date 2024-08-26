from typing import Union
from datetime import datetime


def generate_response(code: int, error: bool, message: str, data: Union[dict, list]) -> tuple[dict, int]:
    time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    return {
        "time": time,
        "message": message,
        "status": code,
        "error": error,
        "data": data
    }
