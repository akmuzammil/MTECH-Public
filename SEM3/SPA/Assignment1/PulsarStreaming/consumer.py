#
import pulsar
import ast

client = pulsar.Client('pulsar://localhost:6650')
consumer = client.subscribe('persistent://public/default/sensor-data', subscription_name='sub1')

try:
    while True:
        msg = consumer.receive()
        data = ast.literal_eval(msg.data().decode('utf-8'))

        # Sample processing: Filter high temperature
        if data['temperature'] > 30:
            print(f"⚠️ Alert: High Temperature Detected: {data}")
        else:
            print(f"✅ Normal: {data}")

        consumer.acknowledge(msg)
except KeyboardInterrupt:
    print("Stopped.")
finally:
    client.close()
