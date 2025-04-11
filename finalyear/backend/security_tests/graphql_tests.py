# backend/security_tests/graphql_tests.py
from typing import List
from models import TestResult, APITestRequest
from utils.api_client import make_api_request
from .custom_payloads import GRAPHQL_PAYLOADS

async def test_graphql_introspection(test_request: APITestRequest) -> TestResult:
    payload = GRAPHQL_PAYLOADS["introspection"]
    try:
        response = await make_api_request(
            method="POST",
            url=test_request.url,
            headers=test_request.headers,
            body={"query": payload}
        )
        if "__schema" in response.text:
            return TestResult(
                test_name="GraphQL Introspection",
                vulnerable=True,
                confidence=0.9,
                description="GraphQL introspection is enabled",
                payload=payload,
                recommendation="Disable introspection in production"
            )
    except Exception as e:
        return TestResult(
            test_name="GraphQL Introspection",
            vulnerable=False,
            confidence=0.0,
            description=f"Test failed: {str(e)}",
            recommendation="Check GraphQL endpoint"
        )
    
    return TestResult(
        test_name="GraphQL Introspection",
        vulnerable=False,
        confidence=0.0,
        description="Introspection is disabled",
        recommendation="Continue to disable introspection"
    )

async def test_graphql_sql_injection(test_request: APITestRequest) -> TestResult:
    payload = GRAPHQL_PAYLOADS["sql_injection"]
    try:
        response = await make_api_request(
            method="POST",
            url=test_request.url,
            headers=test_request.headers,
            body={"query": payload}
        )
        if "sql" in response.text.lower() or "error" in response.text.lower():
            return TestResult(
                test_name="SQL Injection (GraphQL)",
                vulnerable=True,
                confidence=0.8,
                description="SQL Injection vulnerability detected in GraphQL query",
                payload=payload,
                recommendation="Sanitize GraphQL inputs and use parameterized queries"
            )
    except Exception as e:
        return TestResult(
            test_name="SQL Injection (GraphQL)",
            vulnerable=False,
            confidence=0.0,
            description=f"Test failed: {str(e)}",
            recommendation="Check GraphQL endpoint"
        )
    
    return TestResult(
        test_name="SQL Injection (GraphQL)",
        vulnerable=False,
        confidence=0.0,
        description="No SQL Injection vulnerabilities detected",
        recommendation="Continue to sanitize inputs"
    )

async def test_graphql_xss(test_request: APITestRequest) -> TestResult:
    payload = GRAPHQL_PAYLOADS["xss"]
    try:
        response = await make_api_request(
            method="POST",
            url=test_request.url,
            headers=test_request.headers,
            body={"query": payload}
        )
        if "<script>" in response.text:
            return TestResult(
                test_name="XSS (GraphQL)",
                vulnerable=True,
                confidence=0.8,
                description="XSS vulnerability detected in GraphQL query",
                payload=payload,
                recommendation="Sanitize GraphQL inputs and implement CSP"
            )
    except Exception as e:
        return TestResult(
            test_name="XSS (GraphQL)",
            vulnerable=False,
            confidence=0.0,
            description=f"Test failed: {str(e)}",
            recommendation="Check GraphQL endpoint"
        )
    
    return TestResult(
        test_name="XSS (GraphQL)",
        vulnerable=False,
        confidence=0.0,
        description="No XSS vulnerabilities detected",
        recommendation="Continue to sanitize inputs"
    )

async def test_graphql_dos(test_request: APITestRequest) -> TestResult:
    # Test for DoS with a deeply nested query
    dos_payload = """
        query {
            user(id: "1") {
                friends(first: 1) {
                    friends(first: 1) {
                        friends(first: 1) {
                            friends(first: 1) {
                                name
                            }
                        }
                    }
                }
            }
        }
    """
    try:
        response = await make_api_request(
            method="POST",
            url=test_request.url,
            headers=test_request.headers,
            body={"query": dos_payload}
        )
        if response.status_code == 200 and "data" in response.text:
            return TestResult(
                test_name="GraphQL DoS",
                vulnerable=True,
                confidence=0.7,
                description="GraphQL endpoint is vulnerable to DoS via nested queries",
                payload=dos_payload,
                recommendation="Implement query depth limiting and cost analysis"
            )
    except Exception as e:
        return TestResult(
            test_name="GraphQL DoS",
            vulnerable=False,
            confidence=0.0,
            description=f"Test failed: {str(e)}",
            recommendation="Check GraphQL endpoint"
        )
    
    return TestResult(
        test_name="GraphQL DoS",
        vulnerable=False,
        confidence=0.0,
        description="No DoS vulnerabilities detected",
        recommendation="Continue to implement query limits"
    )