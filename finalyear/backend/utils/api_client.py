import httpx
from typing import Dict, Any

async def make_api_request(
    method: str,
    url: str,
    headers: Dict[str, str] = None,
    params: Dict[str, str] = None,
    body: Any = None,
    timeout: int = 30
) -> httpx.Response:
    print(f"\nMaking {method} request to {url}")  # Debug
    print(f"Headers: {headers}")  # Debug
    print(f"Params: {params}")  # Debug
    print(f"Body: {body}")  # Debug
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=url,
                headers=headers or {},
                params=params or {},
                json=body if body else None,
                timeout=timeout
            )
            
            print(f"Response status: {response.status_code}")  # Debug
            print(f"Response headers: {response.headers}")  # Debug
            print(f"Response body (first 500 chars): {response.text[:500]}")  # Debug
            
            return response
    except Exception as e:
        print(f"Request failed: {str(e)}")  # Debug
        raise