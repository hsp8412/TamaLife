# backend/ml/src/convert_to_tflite_simple.py
import tensorflow as tf
import os


def convert_model_simple():
    try:
        # Load your existing model
        print("Loading model...")
        model_path = "../model/model_latest.h5"
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")

        model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully")

        # Create a concrete function from the model
        print("Creating concrete function...")
        input_shape = model.input_shape
        concrete_func = tf.function(model).get_concrete_function(
            tf.TensorSpec(input_shape, tf.float32)
        )

        # Convert using from_concrete_functions
        print("Converting model...")
        converter = tf.lite.TFLiteConverter.from_concrete_functions([concrete_func])

        # Basic settings
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS]

        tflite_model = converter.convert()

        # Save the converted model
        output_path = "../model/model_latest.tflite"
        with open(output_path, "wb") as f:
            f.write(tflite_model)

        print(f"Model converted successfully and saved to {output_path}")
        print(
            f"Original model size: {os.path.getsize(model_path) / (1024*1024):.2f} MB"
        )
        print(f"TFLite model size: {os.path.getsize(output_path) / (1024*1024):.2f} MB")

    except Exception as e:
        print(f"Error during conversion: {str(e)}")
        raise


if __name__ == "__main__":
    print("Starting model conversion...")
    convert_model_simple()
