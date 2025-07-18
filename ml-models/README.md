# ML Models

This directory contains code for training and exporting pose detection and exercise recognition models.

## Setup

1. Create a Python virtual environment:
   ```sh
   python -m venv env
   source env/bin/activate  # or env\Scripts\activate on Windows
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

## Model Training
- Use TensorFlow or PyTorch for training.
- Export models to TensorFlow Lite for mobile inference.

## Example Files
- `train.py` — Training script
- `export_tflite.py` — Export to TFLite 