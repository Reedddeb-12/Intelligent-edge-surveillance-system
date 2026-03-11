# System Data Flow

This document describes how data moves through the Intelligent Edge Surveillance System, from capturing visual input to generating alerts for monitoring personnel.

The system is designed to perform most of the processing directly on the edge device. Instead of streaming full video feeds, it analyzes frames locally and transmits only critical event information. This significantly reduces bandwidth usage and allows the system to operate in environments with limited connectivity.

---

## High Level Data Flow

The surveillance node follows the pipeline below:

Camera Module  
↓  
Frame Capture  
↓  
Image Preprocessing  
↓  
Object Detection Model  
↓  
Threat Classification  
↓  
Event Trigger  
↓  
Alert Packet Generation  
↓  
Monitoring Dashboard

Each stage of the pipeline performs a specific function that contributes to identifying and reporting potential threats.

---

## 1. Camera Input

The surveillance node captures visual data using a camera module connected to the edge device.

The camera continuously records frames from the surrounding environment. These frames serve as the raw input for the computer vision pipeline.

---

## 2. Frame Capture

Captured video is divided into individual frames at a predefined frame rate.

Processing individual frames instead of full video streams reduces computational load and allows the edge device to analyze data more efficiently.

---

## 3. Image Preprocessing

Before running object detection, the captured frames undergo basic preprocessing.

This step may include:

- resizing the image
- normalization
- noise reduction

These operations prepare the input for the object detection model and improve detection performance.

---

## 4. Object Detection

The preprocessed frame is passed to the object detection model.

The system uses a lightweight YOLO-based detection model capable of identifying objects such as:

- humans
- animals
- vehicles

The model outputs bounding boxes, object labels, and confidence scores for detected objects.

---

## 5. Threat Classification

Not all detected objects represent a threat.

In this stage, the system evaluates the detected objects and determines whether they represent a potential security concern based on predefined rules or confidence thresholds.

Examples:

- animal detected near farmland
- human detected in restricted area
- object detected on railway track

---

## 6. Event Trigger

If a detected object satisfies the threat criteria, the system triggers an event.

This event represents a potential threat that needs to be communicated to monitoring authorities.

---

## 7. Alert Packet Generation

Once an event is triggered, the system generates a compact alert packet containing relevant information.

Example alert structure:
```
{ "object": "animal", "confidence": 0.87, "timestamp": "2026-03-11T19:45", "node_id": "edge_node_01" }
```
By transmitting only this structured data instead of video streams, the system significantly reduces network bandwidth requirements.

---

## 8. Monitoring Dashboard

The alert packet is transmitted to a monitoring interface where it can be visualized by operators.

The dashboard displays:

- detected object type
- event timestamp
- node location
- detection confidence

This allows monitoring personnel to quickly respond to potential threats.

---

## Design Principle

The entire system follows an **event-driven architecture**.

Instead of transmitting large volumes of continuous video data, the edge node only communicates when a relevant event occurs. This makes the system efficient, scalable, and suitable for remote environments with limited connectivity.