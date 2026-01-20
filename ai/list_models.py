"""List available Gemini models"""
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Available Gemini Models:")
print("=" * 60)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✓ {model.name}")
        print(f"  Description: {model.description[:80]}...")
        print(f"  Methods: {', '.join(model.supported_generation_methods)}")
        print()
