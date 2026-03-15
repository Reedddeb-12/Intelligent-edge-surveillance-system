# ML Model Testing Guide

## Test Environment
- Python 3.8+
- TensorFlow 2.x
- OpenCV 4.x

## Running Tests

### Object Detection
```bash
python test_detection.py --input sample.jpg
```

### Threat Classification
```bash
python test_classifier.py --model model.pkl
```

## Expected Output
- Detection confidence > 85%
- Classification accuracy > 90%
- Inference time < 200ms
