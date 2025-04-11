# backend/security_tests/soap_tests.py
from typing import List
from models import TestResult, APITestRequest
from utils.api_client import make_api_request
from .custom_payloads import get_payloads

async def test_soap_sql_injection(test_request: APITestRequest) -> TestResult:
    payloads = get_payloads("sql", "SOAP")
    for payload in payloads:
        # Inject payload into SOAP body
        soap_body = test_request.body or "<soap:Envelope><soap:Body></soap:Body></soap:Envelope>"
        modified_body = soap_body.replace("</soap:Body>", f"<test>{payload}</test></soap:Body>")
        
        try:
            response = await make_api_request(
                method=test_request.method,
                url=test_request.url,
                headers=test_request.headers,
                body=modified_body
            )
            if "sql" in response.text.lower() or "error" in response.text.lower():
                return TestResult(
                    test_name="SQL Injection (SOAP)",
                    vulnerable=True,
                    confidence=0.8,
                    description=f"SQL Injection vulnerability detected with payload: {payload}",
                    payload=payload,
                    recommendation="Use parameterized queries and validate XML input"
                )
        except Exception as e:
            return TestResult(
                test_name="SQL Injection (SOAP)",
                vulnerable=False,
                confidence=0.0,
                description=f"Test failed: {str(e)}",
                recommendation="Check SOAP request format"
            )
    
    return TestResult(
        test_name="SQL Injection (SOAP)",
        vulnerable=False,
        confidence=0.0,
        description="No SQL Injection vulnerabilities detected",
        recommendation="Continue to validate and sanitize inputs"
    )

async def test_soap_xss(test_request: APITestRequest) -> TestResult:
    payloads = get_payloads("xss", "SOAP")
    for payload in payloads:
        soap_body = test_request.body or "<soap:Envelope><soap:Body></soap:Body></soap:Envelope>"
        modified_body = soap_body.replace("</soap:Body>", f"<test>{payload}</test></soap:Body>")
        
        try:
            response = await make_api_request(
                method=test_request.method,
                url=test_request.url,
                headers=test_request.headers,
                body=modified_body
            )
            if payload in response.text:
                return TestResult(
                    test_name="XSS (SOAP)",
                    vulnerable=True,
                    confidence=0.8,
                    description=f"XSS vulnerability detected with payload: {payload}",
                    payload=payload,
                    recommendation="Sanitize XML input and implement Content Security Policy"
                )
        except Exception as e:
            return TestResult(
                test_name="XSS (SOAP)",
                vulnerable=False,
                confidence=0.0,
                description=f"Test failed: {str(e)}",
                recommendation="Check SOAP request format"
            )
    
    return TestResult(
        test_name="XSS (SOAP)",
        vulnerable=False,
        confidence=0.0,
        description="No XSS vulnerabilities detected",
        recommendation="Continue to sanitize inputs"
    )

async def test_soap_ssrf(test_request: APITestRequest) -> TestResult:
    payloads = get_payloads("ssrf", "SOAP")
    for payload in payloads:
        soap_body = test_request.body or "<soap:Envelope><soap:Body></soap:Body></soap:Envelope>"
        modified_body = soap_body.replace("</soap:Body>", f"<test>{payload}</test></soap:Body>")
        
        try:
            response = await make_api_request(
                method=test_request.method,
                url=test_request.url,
                headers=test_request.headers,
                body=modified_body
            )
            if "metadata" in response.text.lower() or "localhost" in response.text.lower():
                return TestResult(
                    test_name="SSRF (SOAP)",
                    vulnerable=True,
                    confidence=0.8,
                    description=f"SSRF vulnerability detected with payload: {payload}",
                    payload=payload,
                    recommendation="Restrict outbound connections and validate URLs in XML"
                )
        except Exception as e:
            return TestResult(
                test_name="SSRF (SOAP)",
                vulnerable=False,
                confidence=0.0,
                description=f"Test failed: {str(e)}",
                recommendation="Check SOAP request format"
            )
    
    return TestResult(
        test_name="SSRF (SOAP)",
        vulnerable=False,
        confidence=0.0,
        description="No SSRF vulnerabilities detected",
        recommendation="Continue to validate URLs"
    )

async def test_soap_xxe(test_request: APITestRequest) -> TestResult:
    xxe_payload = """<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
    <soap:Envelope><soap:Body><test>&xxe;</test></soap:Body></soap:Envelope>"""
    
    try:
        response = await make_api_request(
            method=test_request.method,
            url=test_request.url,
            headers=test_request.headers,
            body=xxe_payload
        )
        if "root:" in response.text:  # Check for /etc/passwd content
            return TestResult(
                test_name="XXE (SOAP)",
                vulnerable=True,
                confidence=0.9,
                description="XXE vulnerability detected",
                payload=xxe_payload,
                recommendation="Disable external entity processing in XML parser"
            )
    except Exception as e:
        return TestResult(
            test_name="XXE (SOAP)",
            vulnerable=False,
            confidence=0.0,
            description=f"Test failed: {str(e)}",
            recommendation="Check SOAP request format"
        )
    
    return TestResult(
        test_name="XXE (SOAP)",
        vulnerable=False,
        confidence=0.0,
        description="No XXE vulnerabilities detected",
        recommendation="Ensure external entity processing is disabled"
    )