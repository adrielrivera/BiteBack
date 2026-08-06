import os
import sys
import argparse
import glob
import time
import cv2
import numpy as np
from ultralytics import YOLO

model = YOLO("best.pt", task='segment')

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Could not open webcam.")
    sys.exit(1)


prev = time.time()
while 1:
    objects = []
    confs = []
    ret, frame = cap.read()
    cv2.imshow('a',frame)
    results = model(frame, verbose=False)

    # Extract results
    detections = results[0].boxes

    for j in range(len(detections)):
        classidx = int(detections[j].cls.item())

        conf = detections[j].conf.item()
        confs.append(conf)

        objects.append(classidx)

    if time.time() - prev > 1:
        prev = time.time()
        print(confs)
        print(objects)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()
