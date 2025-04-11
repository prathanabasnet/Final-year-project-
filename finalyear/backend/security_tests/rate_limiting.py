# backend/security_tests/rate_limiting.py
from typing import List
from models import TestResult, APITestRequest
from utils.api_client import make_api_request
import asyncio

async def test_rate_limiting(test_request: APITestRequest) -> TestResult:
    try:
        # Send 100 requests concurrently
        tasks = []
        for _ in range(100):
            tasks.append(make_api_request(
                method=test_request.method,
                url=test_request.url,
                headers=test_request.headers,
                params=test_request.params,
                body=test_request.body
            ))
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Check for 429 (Too Many Requests) responses
        rate_limited = any(
            isinstance(resp, httpx.Response) and resp.status_code == 429
            for resp in responses
        )
        
        if rate_limited:
            return TestResult(
                test_name="Rate Limiting",
                vulnerable=False,
                confidence=1.0,
                description="Rate limiting is properly implemented (received 429 responses)",
                recommendation="Maintain current rate limiting configuration"
            )
        
        return TestResult(
            test_name="Rate Limiting",
            vulnerable=True,
            confidence=0.9,
            description="No rate limiting detected (no 429 responses)",
            recommendation="Implement rate limiting to prevent brute force attacks"
        )
    except Exception as e:
        return TestResult(
            test_name="Rate Limiting",
            vulnerable=False,
            confidence=0.0,
            description=f"Test failed: {str(e)}",
            recommendation="Check request format and server availability"
        )