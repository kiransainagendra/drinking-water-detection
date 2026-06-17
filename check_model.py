import tensorflow as tf

MODEL_PATH = r"C:\Users\kiran\OneDrive\Desktop\drinking-water-detection\water_classifier.h5"

try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    model.summary()
    print("\n✅ Model loaded successfully!")
except Exception as e:
    print(f"\n❌ Failed to load model: {e}")
