"""
SkyWings Computer Vision (OCR) - FastAPI Service
Uses PassportEye (MRZ) with data cleaning and image format conversion.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from passporteye import read_mrz
from PIL import Image
import io
import re
import os

app = FastAPI(title="SkyWings OCR Service")

class OCRResponse(BaseModel):
    raw_text: str
    extracted_data: dict

@app.post("/scan-document", response_model=OCRResponse)
async def scan_document(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # 🚨 FIX: Convert RGBA/P (PNG with transparency) to RGB for JPEG saving
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
            
        temp_path = "/tmp/temp_passport.jpg"
        image.save(temp_path, format="JPEG")
        
        mrz = read_mrz(temp_path)
        
        data = {
            "name": None,
            "dob": None,
            "document_number": None
        }
        
        raw_text = ""
        
        if mrz:
            mrz_data = mrz.to_dict()
            raw_text = mrz_data.get('raw_text', '')
            
            # --- 1. Clean Name ---
            surname = mrz_data.get('surname', '').replace('<', ' ').strip()
            names = mrz_data.get('names', '').replace('<', ' ').strip()
            
            # Combine name
            full_name = f"{surname} {names}".strip()
            
            # Remove trailing 'K's (caused by OCR misreading '<')
            # And remove extra spaces
            full_name = re.sub(r'K+$', '', full_name).strip()
            full_name = re.sub(r'\s+', ' ', full_name) # replace multiple spaces with single space
            
            data["name"] = full_name
            
            # --- 2. Clean DOB ---
            dob = mrz_data.get('date_of_birth', '')
            if len(dob) == 6:
                data["dob"] = f"{dob[4:6]}/{dob[2:4]}/19{dob[0:2]}" 
                
            # --- 3. Clean Document Number ---
            doc_num = mrz_data.get('number', '')
            # Remove any trailing '<' or non-alphanumeric characters
            doc_num = re.sub(r'[^A-Z0-9]', '', doc_num.upper())
            data["document_number"] = doc_num
            
        else:
            raw_text = "MRZ not found in image. Please use a clear image."
            
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

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
