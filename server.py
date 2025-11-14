from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

latest_data = {
    "flow": 0,
    "pressure": 0,
    "sound": 0,
    "leak_detected": False,
    "leak_position": "none"
}

@app.route('/')
def home():
    return jsonify({"message": "✅ Flask server is running — use /predict for leak detection"})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    flow = float(data.get("flow", 0))
    pressure = float(data.get("pressure", 0))
    sound = float(data.get("sound", 0))

    # --- Smart Leak Detection Logic ---
    leak_detected = False
    leak_position = "none"

    if flow > 75 and pressure < 25 and 55 < sound <= 65:
        leak_detected = True
        leak_position = "before middle"
    elif 55 <= flow <= 70 and 20 <= pressure <= 30 and sound > 65:
        leak_detected = True
        leak_position = "exact middle"
    elif flow < 50 and pressure < 18 and sound > 70:
        leak_detected = True
        leak_position = "before end"
    else:
        leak_detected = False
        leak_position = "none"

    # Save latest readings for /latest endpoint
    latest_data.update({
        "flow": flow,
        "pressure": pressure,
        "sound": sound,
        "leak_detected": leak_detected,
        "leak_position": leak_position
    })

    return jsonify({
        "flow": flow,
        "pressure": pressure,
        "sound": sound,
        "leak_detected": leak_detected,
        "leak_position": leak_position
    })

@app.route('/latest', methods=['GET'])
def latest():
    return jsonify(latest_data)

@app.route('/start')
def start():
    return jsonify({"message": "✅ Motor started"})

@app.route('/stop')
def stop():
    return jsonify({"message": "🛑 Motor stopped"})

if __name__ == '__main__':
    app.run(debug=True)
