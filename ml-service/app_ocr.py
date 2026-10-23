"""
SkyWings Computer Vision (OCR) - FastAPI Service
Extracts text from Passport/ID images.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import pytesseract
from PIL import Image
import io
import re

app = FastAPI(title="SkyWings OCR Service")

class OCRResponse(BaseModel):
    raw_text: str
    extracted_data: dict

@app.post("/scan-document", response_model=OCRResponse)
async def scan_document(file: UploadFile = File(...)):
    try:
        # 1. Read the uploaded image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # 2. Extract text using Tesseract
        raw_text = pytesseract.image_to_string(image, config='--psm 6')
        
        # 3. Extract specific fields using Regex
        data = {
            "name": None,
            "dob": None,
            "document_number": None
        }
        
        # Regex for Date of Birth
        dob_match = re.search(r'\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})\b', raw_text)
        if dob_match:
            data["dob"] = dob_match.group(1)
            
        # Regex for Passport Number
        doc_match = re.search(r'\b([A-Z]{1,2}\d{6,8})\b', raw_text)
        if doc_match:
            data["document_number"] = doc_match.group(1)
            
        # 4. Extract Name (Improved Logic to avoid grabbing the next line)
        name_match = re.search(r'Name:\s*([A-Za-z\s]+)', raw_text, re.IGNORECASE)
        if name_match:
            name = name_match.group(1)
            # Clean up if it accidentally grabbed the next field word
            for stop_word in ['DOB', 'Date', 'Passport', 'Nationality']:
                if stop_word in name:
                    name = name.split(stop_word)[0]
            data["name"] = name.strip()
        else:
            # Fallback if "Name:" is not found
            name_lines = [line for line in raw_text.split('\n') if line.isupper() and len(line) > 5 and 'REPUBLIC' not in line]
            if name_lines:
                data["name"] = name_lines[0].strip()

        return OCRResponse(
            raw_text=raw_text,
            extracted_data=data
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Processing failed: {str(e)}")

@app.get("/health")
def health():
    return {"status": "ok", "service": "ocr"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
