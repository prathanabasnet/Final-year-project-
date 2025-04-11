# security_tests/__init__.py
from .sql_injection import test_sql_injection

__all__ = ["test_sql_injection"]