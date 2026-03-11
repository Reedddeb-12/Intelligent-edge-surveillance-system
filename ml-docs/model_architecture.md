# Model Architecture

This document describes the machine learning model used in the Intelligent Edge Surveillance System and how it fits into the overall edge processing pipeline.

The goal of the model is to detect objects of interest in real time using a lightweight architecture that can run efficiently on an edge device such as a Raspberry Pi.

---

## Why Object Detection?

The surveillance node continuously captures frames from a camera module. Instead of sending these frames to a remote server for analysis, the system performs object detection locally on the device.

Object detection allows the system to:

- identify relevant objects in the scene
- locate them within the frame using bounding boxes
- estimate the confidence of each detection

This information is then used to determine whether an event should trigger an alert.

---

## Model Choice: YOLO

The system uses a **YOLO (You Only Look Once)** based object detection model.

YOLO is well suited for this application because it provides:

- fast inference speeds
- real-time detection capability
- relatively lightweight models compared to many alternatives
- good accuracy for detecting common objects

These characteristics make YOLO a strong candidate for deployment on edge devices where computational resources are limited.

---

## Detection Pipeline

The model operates as part of a larger detection pipeline.

Camera Frame  
↓  
Image Preprocessing  
↓  
YOLO Object Detection Model  
↓  
Bounding Box & Label Prediction  
↓  
Confidence Filtering  
↓  
Threat Classification  
↓  
Alert Generation

Each step ensures that only meaningful events are communicated to the monitoring system.

---

## Input Processing

Before running inference, captured frames undergo basic preprocessing to prepare them for the model.

Typical preprocessing steps include:

- resizing frames to the model input size
- normalization of pixel values
- optional noise reduction

These steps ensure consistent input for the detection model and help maintain stable performance.

---

## Model Output

For each processed frame, the model produces a set of detections.

Each detection includes:

- object label
- bounding box coordinates
- confidence score

Example output:

```
Object: Human  
Confidence: 0.91  
Bounding Box: (x1, y1, x2, y2)
```

These outputs are passed to the next stage of the system, where they are evaluated for potential threats.

---

## Threat Evaluation

Not every detected object represents a threat.

The system applies simple rule-based filtering or thresholding to determine whether the detection should trigger an alert.

Examples:

- human detected in restricted area
- animal detected inside farmland
- object detected on railway tracks

If the detection satisfies the defined conditions, the system generates an alert event.

---

## Edge Inference Considerations

Running machine learning models on edge devices requires careful consideration of computational constraints.

To ensure efficient performance, the system focuses on:

- using lightweight model variants
- limiting frame processing rate when necessary
- reducing unnecessary computations
- optimizing preprocessing steps

These design decisions allow the surveillance node to maintain real-time detection while operating on limited hardware resources.

---

## Future Improvements

As the system evolves, the machine learning pipeline can be improved through:

- dataset expansion for domain-specific environments
- model optimization and pruning
- hardware acceleration support
- adaptive threat classification models

These improvements will help increase detection accuracy and system robustness in real-world deployments.