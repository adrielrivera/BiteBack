import glob
import time
import cv2
import numpy as np
from ultralytics import YOLO
import atexit
from threading import Thread


model = YOLO("cv/best.pt", task='segment')

frame = None

# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("Could not open webcam")

def init_cv(cap,testing=0):
    Thread(target=camera_feed, args=[cap,testing], daemon=1).start()

def camera_feed(cap,testing):
    global frame
    while 1:
        ret, frame = cap.read()
        if testing:
            cv2.imshow('frame',frame)
        cv2.waitKey(1)

def count(testing=0):
    objects = []
    confs = []
    
    results = model(frame, verbose=False)
    detections = results[0].boxes

    for j in range(len(detections)):
        classidx = int(detections[j].cls.item())

        conf = detections[j].conf.item()
        if conf > 0.5:
            confs.append(conf)

            objects.append(classidx)

    print(confs)
    print(objects)

    return len(objects)
