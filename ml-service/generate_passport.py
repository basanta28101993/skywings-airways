from PIL import Image, ImageDraw, ImageFont
import os

def create_fake_passport():
    # Create a white image (like a scanned document)
    img = Image.new('RGB', (800, 500), color='white')
    d = ImageDraw.Draw(img)
    
    # Try to load a default font
    try:
        # Mac Arial path (adjust if needed, fallback to default)
        font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 40)
        font_small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 25)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw Fake Passport Text
    d.text((50, 50), "REPUBLIC OF SKYWINGS", fill='black', font=font_large)
    d.text((50, 120), "PASSPORT", fill='black', font=font_large)
    
    d.text((50, 200), "Name: JOHN DOE", fill='black', font=font_small)
    d.text((50, 250), "DOB: 15/08/1990", fill='black', font=font_small)
    d.text((50, 300), "Passport No: A1234567", fill='black', font=font_small)
    d.text((50, 350), "Nationality: SKYWINGIAN", fill='black', font=font_small)
    
    d.text((50, 420), "P<SKWDOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<", fill='black', font=font_small)

    # Save to the Next.js public folder so we can access it easily
    output_path = "../apps/web/public/sample-passport.png"
    img.save(output_path)
    print(f"✅ Fake Passport generated at: {output_path}")

if __name__ == "__main__":
    create_fake_passport()
