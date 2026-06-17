from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io
from fpdf import FPDF
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "water_classifier.h5")

try:
    model = load_model(MODEL_PATH, compile=False)
except TypeError:
    from tensorflow.keras.layers import InputLayer
    model = load_model(MODEL_PATH, compile=False)

# Class labels
CLASS_LABELS = ["Not Safe to Drink", "Safe to Drink"]

# Water Safety and Sanitation Suggestions
SUGGESTIONS = {
    "en": {
        "water_safety": [
            "Boil water before drinking if unsure about safety.",
            "Use water purification tablets or filters if boiling isn't possible.",
            "Store drinking water in clean, covered containers to prevent contamination.",
            "Avoid drinking water from unknown or untreated sources like ponds or rivers.",
            "Check for any changes in water color, smell, or taste before consuming.",
            "Regularly clean and maintain wells and water storage tanks."
        ],
        "sanitation": [
            "Wash hands with soap before handling food or drinking water.",
            "Always use clean utensils and cups for drinking water.",
            "Dispose of waste properly to prevent contamination of water sources.",
            "Build and use toilets instead of open defecation to keep water sources clean.",
            "Keep livestock away from water sources to avoid contamination.",
            "Educate community members about the importance of hygiene and clean drinking water."
        ]
    },
    "te": {
        "water_safety": [
            "నీటి భద్రతపై అనిశ్చితంగా ఉంటే, నీటిని మరిగించి తాగండి.",
            "నీటిని మరిగించడం సాధ్యమయ్యేలా లేకపోతే, నీటి శుద్ధి మాత్రలు లేదా ఫిల్టర్లు ఉపయోగించండి.",
            "నీటిని శుభ్రంగా మరియు మూసివేసిన పాత్రల్లో నిల్వ చేయండి.",
            "ఆరులు, చెరువులు వంటి తెలియని లేదా శుద్ధి చేయని నీటి వనరులను తాగడానికి ఉపయోగించకండి.",
            "నీటి రంగు, వాసన లేదా రుచిలో మార్పులు ఉన్నాయా అని పరీక్షించండి.",
            "బావులు మరియు నీటి నిల్వ ట్యాంకులను క్రమం తప్పకుండా శుభ్రం చేసి నిర్వహించండి."
        ],
        "sanitation": [
            "ఆహారం లేదా తాగునీటిని ముట్టుకోవడానికి ముందు చేతులు సబ్బుతో కడుక్కోవాలి.",
            "తాగునీటికి ఎల్లప్పుడూ శుభ్రమైన పాత్రలు మరియు గ్లాసులను ఉపయోగించండి.",
            "నీటి వనరులు కలుషితం కాకుండా చెత్తను సరిగ్గా పరిగొట్టండి.",
            "నీటి వనరులను శుభ్రంగా ఉంచడానికి బహిరంగ మలసంస్కరణకు బదులుగా మరుగుదొడ్లను నిర్మించండి మరియు ఉపయోగించండి.",
            "పశువులను నీటి వనరుల నుండి దూరంగా ఉంచండి.",
            "హైజీన్ మరియు శుభ్రమైన తాగునీటి ప్రాముఖ్యత గురించి సముదాయ సభ్యులను అవగాహన కల్పించండి."
        ]
    }
}

@app.route('/')
def home():
    return jsonify({"message": "Flask server is running!"})

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        file = request.files['file']
        img = Image.open(io.BytesIO(file.read())).resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)
        predicted_label = CLASS_LABELS[int(np.argmax(prediction))]

        return jsonify({
            "prediction": predicted_label,
            "suggestions": SUGGESTIONS
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download-report', methods=['GET'])
def download_report():
    try:
        result = request.args.get('result', 'Unknown')

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=16)
        pdf.cell(200, 10, "Drinking Water Analysis Report", ln=True, align='C')
        pdf.ln(10)
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, f"Result: {result}", ln=True)

        pdf_folder = "static"
        os.makedirs(pdf_folder, exist_ok=True)

        pdf_path = os.path.join(pdf_folder, "report.pdf")
        pdf.output(pdf_path)

        return send_file(pdf_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
