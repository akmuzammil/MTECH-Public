#
import pulsar
import time
import random

client = pulsar.Client('pulsar://localhost:6650')
producer = client.create_producer('persistent://public/default/sensor-data')

while True:
    data = {
        'sensor_id': random.randint(1, 5),
        'temperature': round(random.uniform(20, 40), 2)
    }
    producer.send(str(data).encode('utf-8'))
    print(f"Produced: {data}")
    time.sleep(1)  # simulate real-time feed

client.close()
