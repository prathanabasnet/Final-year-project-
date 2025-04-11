# backend/security_tests/scanner.py
from typing import List
from models import APITestRequest, TestResult
from .sql_injection import test_sql_injection
from .xss import test_xss
from .ssrf import test_ssrf
from .rate_limiting import test_rate_limiting
from .soap_tests import test_soap_sql_injection, test_soap_xss, test_soap_ssrf, test_soap_xxe
from .graphql_tests import test_graphql_introspection, test_graphql_sql_injection, test_graphql_xss, test_graphql_dos

class APISecurityScanner:
    def __init__(self):
        self.available_tests = {
            "REST": {
                "sql": test_sql_injection,
                "xss": test_xss,
                "ssrf": test_ssrf,
                "rate_limit": test_rate_limiting
            },
            "SOAP": {
                "sql": test_soap_sql_injection,
                "xss": test_soap_xss,
                "ssrf": test_soap_ssrf,
                "xxe": test_soap_xxe,
                "rate_limit": test_rate_limiting
            },
            "GraphQL": {
                "introspection": test_graphql_introspection,
                "sql": test_graphql_sql_injection,
                "xss": test_graphql_xss,
                "dos": test_graphql_dos,
                "rate_limit": test_rate_limiting
            }
        }
    
    async def run_tests(self, test_request: APITestRequest) -> List[TestResult]:
        """Run all configured security tests against the API request"""
        results = []
        api_type = test_request.api_type
        
        if api_type not in self.available_tests:
            return [TestResult(
                test_name="API Type",
                vulnerable=False,
                confidence=0.0,
                description=f"Unsupported API type: {api_type}",
                recommendation="Use REST, SOAP, or GraphQL"
            )]
        
        tests_to_run = self.available_tests[api_type]
        
        for test_name in test_request.tests:
            if test_name in tests_to_run:
                test_func = tests_to_run[test_name]
                try:
                    result = await test_func(test_request)
                    results.append(result)
                except Exception as e:
                    results.append(TestResult(
                        test_name=test_name,
                        vulnerable=False,
                        confidence=0.0,
                        description=f"Test failed: {str(e)}",
                        recommendation="Check test implementation"
                    ))
        
        return results