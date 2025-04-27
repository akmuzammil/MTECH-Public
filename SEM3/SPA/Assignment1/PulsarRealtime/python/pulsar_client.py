"""
Pulsar client wrapper for the Apache Pulsar demo application.

In a production environment, you would use the actual Pulsar client
to connect to a Pulsar cluster. For this demo, we're simulating
the behavior of producers and consumers.
"""
import pulsar
import json
import threading
import time
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

# This would normally be used in a real implementation
# import pulsar

class PulsarClientWrapper:
    """
    A wrapper around the Pulsar client that simplifies producer and consumer management.
    
    For this demo, this is mostly a simulation that mimics the behavior of
    a real Pulsar client without requiring an actual Pulsar cluster.
    """
    
    def __init__(self, broker_service_url: str):
        """
        Initialize the Pulsar client wrapper.
        
        Args:
            broker_service_url: The service URL for the Pulsar broker
        """
        self.broker_service_url = broker_service_url
        self.producers = {}
        self.consumers = {}
        self._running = True
        
        # In a real implementation, we would create the client:
        self.client = pulsar.Client(broker_service_url)
        
        print(f"[DEMO] Connected to Pulsar broker at {broker_service_url}")
    
    def create_producer(self, topic: str) -> "Producer":
        """
        Create a new producer for the given topic.
        
        Args:
            topic: The Pulsar topic to produce messages to
            
        Returns:
            A producer instance
        """
        if topic not in self.producers:
            # In a real implementation:
            real_producer = self.client.create_producer(topic)
            producer = Producer(topic, real_producer)
            
            #producer = Producer(topic, None)  # Demo version
            self.producers[topic] = producer
            print(f"[DEMO] Created producer for topic: {topic}")
        
        return self.producers[topic]
    
    def create_consumer(self, 
                       topic: str, 
                       subscription_name: str,
                       consumer_type: str = "Shared") -> "Consumer":
        """
        Create a new consumer for the given topic and subscription.
        
        Args:
            topic: The Pulsar topic to consume messages from
            subscription_name: The name of the subscription
            consumer_type: The type of subscription (Exclusive, Shared, Failover)
            
        Returns:
            A consumer instance
        """
        # Key to uniquely identify this consumer
        consumer_key = f"{topic}:{subscription_name}"
        
        if consumer_key not in self.consumers:
            # In a real implementation:
            real_consumer = self.client.subscribe(
               topic=topic,
               subscription_name=subscription_name,
               consumer_type=getattr(pulsar.ConsumerType, consumer_type)
            )
            consumer = Consumer(topic, subscription_name, consumer_type, real_consumer)
            
            #consumer = Consumer(topic, subscription_name, consumer_type, None)  # Demo version
            self.consumers[consumer_key] = consumer
            print(f"[DEMO] Created {consumer_type} consumer for topic: {topic}, " 
                  f"subscription: {subscription_name}")
        
        return self.consumers[consumer_key]
    
    def produce(self, topic: str, message: str):
        """
        Convenience method to produce a message without explicitly creating a producer.
        
        Args:
            topic: The topic to produce to
            message: The message content
        """
        producer = self.create_producer(topic)
        return producer.send(message)
    
    def close(self):
        """Clean up resources and close the client."""
        self._running = False
        
        # Close all producers and consumers
        for producer in self.producers.values():
            producer.close()
        
        for consumer in self.consumers.values():
            consumer.close()
        
        # In a real implementation:
        self.client.close()
        
        print("[DEMO] Pulsar client closed")


class Producer:
    """A wrapper around a Pulsar producer."""
    
    def __init__(self, topic: str, real_producer: Any):
        """
        Initialize the producer.
        
        Args:
            topic: The topic this producer is producing to
            real_producer: The actual Pulsar producer (None in demo mode)
        """
        self.topic = topic
        self.real_producer = real_producer
        self.message_counter = 0
    
    def send(self, message: str) -> str:
        """
        Send a message to the topic.
        
        Args:
            message: The message content
            
        Returns:
            A message ID
        """
        self.message_counter += 1
        msg_id = f"{self.topic}-{int(time.time())}-{self.message_counter}"
        
        # In a real implementation:
        self.real_producer.send(message.encode('utf-8'))
        
        print(f"[DEMO] Produced message to {self.topic}: {message[:50]}...")
        return msg_id
    
    def close(self):
        """Close the producer."""
        # In a real implementation:
        self.real_producer.close()
        pass


class Consumer:
    """A wrapper around a Pulsar consumer."""
    
    def __init__(self, 
                topic: str, 
                subscription_name: str, 
                consumer_type: str,
                real_consumer: Any):
        """
        Initialize the consumer.
        
        Args:
            topic: The topic this consumer is consuming from
            subscription_name: The name of the subscription
            consumer_type: The type of subscription (Exclusive, Shared, Failover)
            real_consumer: The actual Pulsar consumer (None in demo mode)
        """
        self.topic = topic
        self.subscription_name = subscription_name
        self.consumer_type = consumer_type
        self.real_consumer = real_consumer
        self.listeners = []
        self._running = False
        self._consumer_thread = None
    
    def receive(self, timeout_ms: int = 1000) -> Optional[Dict]:
        """
        Receive a single message from the topic.
        
        Args:
            timeout_ms: The timeout in milliseconds
            
        Returns:
            The message or None if no message was available
        """
        # In a real implementation:
        msg = self.real_consumer.receive(timeout_millis=timeout_ms)
        if msg:
            data = json.loads(msg.data().decode('utf-8'))
            self.real_consumer.acknowledge(msg)
            return data
        return None
        
        # Demo version just simulates a timeout
        # time.sleep(timeout_ms / 1000)
        # return None
    
    def add_listener(self, callback: Callable[[Dict], None]):
        """
        Add a message listener.
        
        Args:
            callback: The callback function to call when a message is received
        """
        self.listeners.append(callback)
        
        # Start the listener thread if not already running
        if not self._running:
            self._start_listener()
    
    def _start_listener(self):
        """Start the background thread that listens for messages."""
        def listen_for_messages():
            self._running = True
            
            while self._running:
                try:
                    # In a real implementation, we would receive real messages
                    msg = self.receive()
                    if msg:
                        for listener in self.listeners:
                            listener(msg)
                    
                    # For demo, we just sleep to avoid busy waiting
                    #time.sleep(0.1)
                
                except Exception as e:
                    print(f"[DEMO] Error in consumer listener: {e}")
                    time.sleep(1)  # Back off on error
        
        self._consumer_thread = threading.Thread(target=listen_for_messages)
        self._consumer_thread.daemon = True
        self._consumer_thread.start()
    
    def close(self):
        """Close the consumer."""
        self._running = False
        
        # In a real implementation:
        self.real_consumer.close()
        
        if self._consumer_thread and self._consumer_thread.is_alive():
            self._consumer_thread.join(timeout=1.0)