# backend/security_tests/xss.py
from typing import List
from models import TestResult, APITestRequest
from utils.api_client import make_api_request
from .custom_payloads import get_payloads

async def test_xss(test_request: APITestRequest) -> TestResult:
    if test_request.api_type != "REST":
        return TestResult(
            test_name="XSS (REST)",
            vulnerable=False,
            confidence=0.0,
            description="XSS test only available for REST APIs in this module",
            recommendation="N/A"
        )
    
    payloads = get_payloads("xss", "REST")
    for payload in payloads:
        modified_params = {**test_request.params, "test": payload}
        try:
            response = await make_api_request(
                method=test_request.method,
                url=test_request.url,
                headers=test_request.headers,
                params=modified_params,
                body=test_request.body
            )
            if payload in response.text:
                return TestResult(
                    test_name="XSS (REST)",
                    vulnerable=True,
                    confidence=0.8,
                    description=f"XSS vulnerability detected with payload: {payload}",
                    payload=payload,
                    recommendation="Implement input sanitization and CSP headers"
                )
        except Exception as e:
            return TestResult(
                test_name="XSS (REST)",
                vulnerable=False,
                confidence=0.0,
                description=f"Test failed: {str(e)}",
                recommendation="Check request format"
            )
    
    return TestResult(
        test_name="XSS (REST)",
        vulnerable=False,
        confidence=0.0,
        description="No XSS vulnerabilities detected",
        recommendation="Regularly test with updated payloads"
    )