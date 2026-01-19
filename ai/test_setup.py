"""
Setup Verification Script
Run this to verify all dependencies are installed correctly.
"""

import sys

print(f"Python version: {sys.version}")
print("-" * 60)

packages = [
    ("fastapi", "FastAPI"),
    ("uvicorn", "Uvicorn"),
    ("numpy", "NumPy"),
    ("rasterio", "Rasterio"),
    ("sklearn", "Scikit-learn"),
    ("pydantic", "Pydantic"),
    ("pytest", "Pytest"),
    ("httpx", "HTTPX"),
    ("dotenv", "Python-dotenv")
]

all_installed = True

for module_name, display_name in packages:
    try:
        module = __import__(module_name)
        version = getattr(module, "__version__", "unknown")
        print(f"✅ {display_name}: {version}")
    except ImportError:
        print(f"❌ {display_name}: not installed")
        all_installed = False

print("-" * 60)

if all_installed:
    print("\n🎉 Setup verification complete! All packages installed.")
    print("\nNext steps:")
    print("1. Run: python test_data/generate_sample.py")
    print("2. Run: uvicorn app.main:app --reload --port 8000")
else:
    print("\n⚠️  Some packages are missing. Run: pip install -r requirements.txt")
    sys.exit(1)
