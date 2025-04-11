# backend/security_tests/ssrf.py
from typing import List
from models import TestResult, APITestRequest
from utils.api_client import make_api_request
from .custom_payloads import get_payloads

async def test_ssrf(test_request: APITestRequest) -> TestResult:
    if test_request.api_type != "REST":
        return TestResult(
            test_name="SSRF (REST)",
            vulnerable=False,
            confidence=0.0,
            description="SSRF test only available for REST APIs in this module",
            recommendation="N/A"
        )
    
    payloads = get_payloads("ssrf", "REST")
    for payload in payloads:
        modified_params = {**test_request.params, "url": payload}
        try:
            response = await make_api_request(
                method=test_request.method,
                url=test_request.url,
                headers=test_request.headers,
                params=modified_params,
                body=test_request.body
            )
            if "metadata" in response.text.lower() or "localhost" in response.text.lower():
                return TestResult(
                    test_name="SSRF (REST)",
                    vulnerable=True,
                    confidence=0.8,
                    description=f"SSRF vulnerability detected with payload: {payload}",
                    payload=payload,
                    recommendation="Restrict outbound connections and validate URLs"
                )
        except Exception as e:
            return TestResult(
                test_name="SSRF (REST)",
                vulnerable=False,
                confidence=0.0,
                description=f"Test failed: {str(e)}",
                recommendation="Check request format"
            )
    
    return TestResult(
        test_name="SSRF (REST)",
        vulnerable=False,
        confidence=0.0,
        description="No SSRF vulnerabilities detected",
        recommendation="Monitor for internal service exposure"
    )