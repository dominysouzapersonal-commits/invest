"""Standalone diagnostic script to test imports and startup."""
import sys
print(f"Python {sys.version}")
print("Testing imports...")

try:
    from app.config import get_settings
    print("  config: OK")
except Exception as e:
    print(f"  config: FAIL - {e}")

try:
    from app.database import connect_db, get_db
    print("  database: OK")
except Exception as e:
    print(f"  database: FAIL - {e}")

try:
    from app.utils.auth import hash_password, create_access_token
    print("  auth: OK")
except Exception as e:
    print(f"  auth: FAIL - {e}")

try:
    from app.routers import auth, assets, analysis, portfolio, compare, watchlist
    print("  routers: OK")
except Exception as e:
    print(f"  routers: FAIL - {e}")

try:
    from app.main import app
    print("  main: OK")
except Exception as e:
    print(f"  main: FAIL - {e}")

print("All imports successful!" if "app" in dir() else "Some imports failed.")
