"""
ai_models.py — Issue Verification using Groq API

Algorithm design:
  - Step 1: Fake Image Detection (local/fast PIL stddev check)
  - Step 2: Vision Reasoning using Groq Llama 3 Vision
"""
import os
import io
import json
import base64
import logging
from groq import Groq
from PIL import Image, ImageStat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq AI
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
        logger.info("Successfully initialized Groq API client.")
    except Exception as e:
        logger.error(f"Failed to initialize Groq API: {e}")
        client = None
else:
    logger.warning("GROQ_API_KEY environment variable not found. Vision reasoning will fail.")
    client = None


# ----------------------------------------------------------------
# Fake Image Detection  (purely statistical, no ML model needed)
# ----------------------------------------------------------------

def detect_fake_image(image: Image.Image) -> tuple[bool, float]:
    """
    Real photos have natural per-channel noise.
    Purely synthetic/AI-generated flat images have very low stddev.
    Returns (is_fake: bool, confidence: float)
    """
    try:
        stat = ImageStat.Stat(image)
        avg_std = sum(stat.stddev) / len(stat.stddev)

        if avg_std < 12.0:
            confidence = round(min(0.9, 0.65 + (12.0 - avg_std) / 12.0), 2)
            logger.info(f"[FakeDetect] avg_std={avg_std:.2f} → FAKE  (conf={confidence})")
            return True, confidence

        logger.info(f"[FakeDetect] avg_std={avg_std:.2f} → real  (conf=0.1)")
        return False, 0.10

    except Exception as e:
        logger.error(f"[FakeDetect] Error: {e}")
        return False, 0.0


# ----------------------------------------------------------------
# Main Vision Comparison using Groq
# ----------------------------------------------------------------

def encode_image_to_base64(image: Image.Image) -> str:
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def verify_issue_resolution(before_image: Image.Image, after_image: Image.Image) -> dict:
    """
    Compares before/after civic repair images using Groq Llama 3 Vision.
    """
    if not client:
        logger.error("Groq client is not initialized (Missing API Key).")
        return {
            "issue_type": "unknown",
            "resolved": False,
            "confidence": 0.0,
            "error": "GROQ_API_KEY not configured. Please add it to your .env file."
        }

    prompt = """
    You are a civic issue verification AI. You will receive two images:
    - Image 1: The "BEFORE" photo (showing the original civic complaint).
    - Image 2: The "AFTER" photo (submitted as proof of resolution).

    Your task is to carefully analyze both images and produce a structured JSON response.

    INSTRUCTIONS FOR YOUR ANALYSIS:
    
    Step 1 — Identify the issue in the BEFORE image:
    Look at the first image carefully. Identify the specific civic issue (e.g., pothole, garbage dump, broken streetlight, water leak, damaged road, waterlogging, fallen tree, etc.).
    
    Step 2 — Analyze the AFTER image:
    Look at the second image. Determine whether the specific issue you identified in the BEFORE image has been fixed/resolved.
    
    Step 3 — Compare and decide:
    - If the issue from the BEFORE image is clearly fixed in the AFTER image → resolved = true
    - If the AFTER image still shows the same issue, or the scene looks unchanged → resolved = false
    - IMPORTANT: If a pothole is filled (even if the patch looks rough), consider it resolved. Partial but functional repairs count as resolved.
    
    OUTPUT FORMAT — Return ONLY a valid JSON object with these keys:
    {
        "issue_type": "<short label like 'pothole', 'garbage', 'water_leak', 'broken_streetlight', 'waterlogging', 'unknown'>",
        "resolved": <true or false>,
        "confidence": <float 0.0 to 1.0>,
        "message": "<structured explanation as described below>"
    }

    MESSAGE FORMAT RULES — The 'message' field MUST follow this exact structure:
    
    Line 1: "BEFORE Image: <describe the specific issue visible in the before image, e.g. 'A large pothole approximately 2 feet wide on the road surface' or 'Garbage scattered across the sidewalk'>."
    
    Line 2: "AFTER Image: <describe what the after image shows, e.g. 'The pothole has been filled with asphalt' or 'The area still shows garbage scattered in the same location'>."
    
    Line 3 (if resolved=true): "VERDICT: The issue has been resolved. <brief reason, e.g. 'The pothole has been patched and the road surface is restored.'>."
    Line 3 (if resolved=false): "VERDICT: The issue is NOT resolved. The <issue from before image> is still visible in the after image. <specific explanation of what hasn't changed or what is still wrong>."

    Do NOT output anything other than the JSON object.
    """

    try:
        logger.info("Sending images to Groq API for reasoning...")
        
        before_b64 = encode_image_to_base64(before_image)
        after_b64 = encode_image_to_base64(after_image)
        
        response = client.chat.completions.create(
            model='meta-llama/llama-4-scout-17b-16e-instruct',
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{before_b64}"}
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{after_b64}"}
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        result_text = response.choices[0].message.content.strip()
        logger.info(f"[Groq Output]: {result_text}")
        
        result_json = json.loads(result_text)
        
        return {
            "issue_type": str(result_json.get("issue_type", "unknown")),
            "resolved": bool(result_json.get("resolved", False)),
            "confidence": float(result_json.get("confidence", 0.0)),
            "message": str(result_json.get("message", "No explanation provided."))
        }

    except Exception as e:
        logger.error(f"[Vision] Groq Analysis Error: {e}")
        return {
            "issue_type": "unknown",
            "resolved": False,
            "confidence": 0.0,
            "message": f"API Analysis failed: {str(e)}"
        }
