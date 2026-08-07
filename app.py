from flask import Flask, render_template, Response
from threading import Thread
from cv import cv
import cv2

testing = 1 # change this to 0 when deploying

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
# cv.init_cv(0)

def init():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam")
        exit()
    return cap

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/demo')
def demo():
    return render_template('demo.html')

@app.route('/api/count')
def cv_count():
    cnt = cv.count(testing)
    return {'count': cnt}, 200

if __name__ == '__main__':
    cap = init()
    cv.init_cv(cap,testing)
    app.run(host="0.0.0.0", port=5000, debug=testing, use_reloader=0)
