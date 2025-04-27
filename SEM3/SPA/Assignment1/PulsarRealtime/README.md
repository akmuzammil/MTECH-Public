# Apache Pulsar Real-time Demo

This demo application visualizes the real-time messaging capabilities of Apache Pulsar, showcasing producers, topics, and multiple consumer groups with different subscription types.

## Features

- Interactive message producer that generates random IoT sensor data or custom messages
- Multiple consumer groups demonstrating different subscription types:
  - Group 1: Shared subscription - all instances receive a subset of messages
  - Group 2: Exclusive subscription - only one consumer receives all messages
  - Group 3: Filtered subscription - only receives specific types of messages (temperature & humidity)
- Real-time visualization of message flow from producers to consumers
- Statistics dashboard showing message counts and processing latency
- Dark/light mode toggle

## Architecture

The application consists of:

1. A React frontend built with:
   - TypeScript
   - Tailwind CSS
   - Socket.IO for real-time communication
   - Chart.js for data visualization
   - Lucide React for icons

2. A Python backend built with:
   - Flask web framework
   - Flask-SocketIO for WebSocket support
   - Simulated Pulsar client (can be replaced with a real Apache Pulsar client)

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)

### Installation

1. Install frontend dependencies:
   ```
   npm install
   ```

2. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the Python backend:
   ```
   npm run start-python
   ```
   This will start the Flask server on http://localhost:5000

2. In a separate terminal, start the React frontend:
   ```
   npm run dev
   ```
   This will start the Vite dev server

3. Open your browser and navigate to the URL shown in the Vite terminal output

## Integrating with a Real Pulsar Cluster

To connect this demo to a real Apache Pulsar cluster:

1. Update the `pulsar_client.py` file to use an actual Pulsar client instead of the simulation
2. Configure the broker service URL in `app.py`
3. Uncomment the actual Pulsar client code in the producer and consumer functions

Example connection to a real Pulsar cluster:

```python
import pulsar

client = pulsar.Client('pulsar://localhost:6650')
producer = client.create_producer('my-topic')
consumer = client.subscribe('my-topic', 'my-subscription')
```

## License

This project is available under the MIT License.