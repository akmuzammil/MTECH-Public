import os
import json
import time
import random
import threading
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
# Placeholder for actual Pulsar client implementation
# In a real application, you would use the pulsar_client module
from pulsar_client import PulsarClientWrapper

app = Flask(__name__, 
            static_folder="../dist/assets",
            template_folder="../dist")
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize our Pulsar client wrapper
pulsar_client = PulsarClientWrapper(broker_service_url="pulsar://localhost:6650")

# Message store for demo purposes
message_store = {
    "produced": [],
    "consumed": {
        "group1": [],
        "group2": [],
        "group3": []
    },
    "stats": {
        "produced_count": 0,
        "consumed_count": {
            "group1": 0,
            "group2": 0,
            "group3": 0
        },
        "avg_latency_ms": 0
    }
}

# Simulated sensor types and their value ranges
SENSOR_TYPES = {
    "temperature": {"min": 15, "max": 35, "unit": "°C"},
    "humidity": {"min": 30, "max": 90, "unit": "%"},
    "pressure": {"min": 980, "max": 1050, "unit": "hPa"},
    "co2": {"min": 300, "max": 1500, "unit": "ppm"},
    "light": {"min": 0, "max": 10000, "unit": "lux"}
}

def get_random_sensor_reading():
    """Generate a random sensor reading for demo purposes"""
    sensor_type = random.choice(list(SENSOR_TYPES.keys()))
    sensor_info = SENSOR_TYPES[sensor_type]
    
    value = round(random.uniform(sensor_info["min"], sensor_info["max"]), 2)
    device_id = f"device-{random.randint(1, 20):03d}"
    
    return {
        "device_id": device_id,
        "sensor_type": sensor_type,
        "value": value,
        "unit": sensor_info["unit"],
        "timestamp": datetime.now().isoformat()
    }

@app.route('/')
def index():
    """Serve the main index page"""
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    """Get current message statistics"""
    return jsonify(message_store["stats"])

@app.route('/api/produce', methods=['POST'])
def produce_message():
    """API endpoint to produce a message"""
    try:
        # Check if we're sending random sensor data or custom message
        if request.json.get('random', False):
            message_data = get_random_sensor_reading()
        else:
            message_data = request.json.get('message', {})
            if not message_data:
                message_data = {"text": "Hello Pulsar!", "timestamp": datetime.now().isoformat()}

        # In a real app, we would use the actual Pulsar producer to send the message
        # Here we're simulating it for demo purposes
        message_id = f"msg-{int(time.time() * 1000)}"
        message = {
            "id": message_id,
            "data": message_data,
            "timestamp": datetime.now().isoformat(),
            "topic": request.json.get('topic', 'persistent://public/default/sensors')
        }
        
        # Simulate producing to Pulsar
        pulsar_client.produce(message['topic'], json.dumps(message['data']))
        
        # For demo: store the message and broadcast via WebSocket
        message_store["produced"].append(message)
        message_store["stats"]["produced_count"] += 1
        
        socketio.emit('new_message_produced', message)
        
        # Simulate consumption after a short delay
        threading.Thread(target=simulate_consumption, args=(message,)).start()
        
        return jsonify({"success": True, "message_id": message_id})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def simulate_consumption(message):
    """Simulate consumers receiving messages with different patterns"""
    # Group 1: Consumes all messages immediately (shared subscription)
    time.sleep(random.uniform(0.1, 0.5))  # Simulate network/processing delay
    consume_message(message, "group1")
    
    # Group 2: Consumes with some delay (exclusive subscription)
    time.sleep(random.uniform(0.5, 2.0))
    consume_message(message, "group2")
    
    # Group 3: Consumes only certain message types (filtered subscription)
    # For example, only consume temperature or humidity readings
    if "sensor_type" not in message["data"] or message["data"]["sensor_type"] in ["temperature", "humidity"]:
        time.sleep(random.uniform(1.0, 3.0))
        consume_message(message, "group3")

def consume_message(message, consumer_group):
    """Record message consumption by a consumer group"""
    consumption_time = datetime.now().isoformat()
    
    consumed_message = {
        "id": message["id"],
        "data": message["data"],
        "produced_at": message["timestamp"],
        "consumed_at": consumption_time,
        "consumer_group": consumer_group
    }
    
    # Store the consumed message
    message_store["consumed"][consumer_group].append(consumed_message)
    message_store["stats"]["consumed_count"][consumer_group] += 1
    
    # Update average latency
    produced_time = datetime.fromisoformat(message["timestamp"])
    consumed_time = datetime.fromisoformat(consumption_time)
    latency_ms = (consumed_time - produced_time).total_seconds() * 1000
    
    current_avg = message_store["stats"]["avg_latency_ms"]
    total_consumed = sum(message_store["stats"]["consumed_count"].values())
    
    # Calculate new average latency
    message_store["stats"]["avg_latency_ms"] = (current_avg * (total_consumed - 1) + latency_ms) / total_consumed
    
    # Emit to WebSocket
    socketio.emit('message_consumed', consumed_message)

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    print('Client connected')
    
    # Send initial stats and recent messages
    socketio.emit('initial_state', {
        "stats": message_store["stats"],
        "recent_produced": message_store["produced"][-10:] if message_store["produced"] else [],
        "recent_consumed": {
            group: messages[-10:] if messages else []
            for group, messages in message_store["consumed"].items()
        }
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    print('Client disconnected')

def start_demo_producer():
    """Start a background thread that produces random messages periodically"""
    def produce_periodic_messages():
        while True:
            try:
                # Only produce messages if we have clients connected
                if socketio.server.manager.rooms:
                    # Generate random sensor data
                    sensor_data = get_random_sensor_reading()
                    
                    # Call our produce endpoint
                    message_id = f"auto-{int(time.time() * 1000)}"
                    message = {
                        "id": message_id,
                        "data": sensor_data,
                        "timestamp": datetime.now().isoformat(),
                        "topic": "persistent://public/default/sensors"
                    }
                    
                    # Store and broadcast
                    message_store["produced"].append(message)
                    message_store["stats"]["produced_count"] += 1
                    socketio.emit('new_message_produced', message)
                    # Simulate producing to Pulsar
                    pulsar_client.produce(message['topic'], json.dumps(message['data']))
                    # Simulate consumption
                    threading.Thread(target=simulate_consumption, args=(message,)).start()
                
                # Wait between 2-5 seconds before sending the next message
                time.sleep(random.uniform(2, 5))
            
            except Exception as e:
                print(f"Error in demo producer: {e}")
                time.sleep(5)  # Back off on error
    
    # Start the background thread
    threading.Thread(target=produce_periodic_messages, daemon=True).start()

if __name__ == '__main__':
    # Start our demo producer
    start_demo_producer()
    
    # Start the Flask app with socketio
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)