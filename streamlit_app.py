import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image
import os

st.set_page_config(
    page_title="Drinking Water Detection",
    page_icon="💧",
    layout="wide"
)

st.title("💧 Drinking Water Quality Detection")
st.write("Upload a water image to determine whether it is safe to drink.")

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "water_classifier.h5"
)

@st.cache_resource
def load_water_model():
    return tf.keras.models.load_model(MODEL_PATH, compile=False)

model = load_water_model()

CLASS_LABELS = [
    "Not Safe to Drink",
    "Safe to Drink"
]

uploaded_file = st.file_uploader(
    "Upload Water Image",
    type=["jpg", "jpeg", "png"]
)

if uploaded_file is not None:

    image = Image.open(uploaded_file)

    col1, col2 = st.columns(2)

    with col1:
        st.image(image, caption="Uploaded Image", use_container_width=True)

    img = image.resize((224, 224))
    img_array = np.array(img) / 255.0

    if len(img_array.shape) == 2:
        img_array = np.stack((img_array,) * 3, axis=-1)

    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)

    predicted_class = CLASS_LABELS[np.argmax(prediction)]
    confidence = float(np.max(prediction)) * 100

    with col2:

        st.subheader("Prediction Result")

        if predicted_class == "Safe to Drink":
            st.success(f"✅ {predicted_class}")
        else:
            st.error(f"⚠️ {predicted_class}")

        st.metric("Confidence", f"{confidence:.2f}%")

        st.markdown("---")

        if predicted_class == "Safe to Drink":

            st.markdown("""
### Recommendations
- Store water in clean containers
- Keep containers covered
- Use clean utensils
- Regularly clean storage tanks
""")

        else:

            st.markdown("""
### Recommendations
- Boil water before drinking
- Use purification tablets
- Use water filters
- Avoid untreated water sources
- Check for unusual smell, color or taste
""")