<!-- <p align="center">
<img src="/src/frontend/static/icons/Hipster_HeroLogoMaroon.svg" width="300" alt="Online Boutique" />
</p> -->

**E Commerce Shopping** 
This project aims to deliver a cloud native, microservices-based e-commerce application that leverages state-of-the-art technologies like Kubernetes, Skaffold, Redis, MiniKube, gRPC, etc. 
It demonstrates modern architecture using multiple languages and frameworks, containerization, and orchestration with Kubernetes. The system is composed of several independent services, each responsible for a specific business capability, and communicates over well-defined gRPC APIs using protobufs.
This application works on any Kubernetes cluster.


## Architecture

**E Commerce Shopping** is composed of 11 microservices written in different
languages that talk to each other over gRPC.
The project tries to demonstrate how we can modernize enterprise applications achieving below objectives.
1.	Create a Microservices based application related to any business domain with 3 to 4 microservices. Each service should be maintained as a separate code repository so that it can be developed, deployed, and tested independently. 
2.	Use a suitable database and database related pattern for these services.
3.	Use a suitable approach for communication between these services.
4.	Add a security layer to authenticate the services using Oauth/Tokens.
5.	Deploy the application using Docker/Kubernetes.


[![Architecture of
microservices](/docs/img/architecture-diagram.png)](/docs/img/architecture-diagram.png)

Find **Protocol Buffers Descriptions** at the [`./protos` directory](/protos).

| Service                                              | Language      | Description                                                                                                                       |
| ---------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [frontend](/src/frontend)                           | Go            | Exposes an HTTP server to serve the website. Does not require signup/login and generates session IDs for all users automatically. |
| [cartservice](/src/cartservice)                     | C#            | Stores the items in the user's shopping cart in Redis and retrieves it.                                                           |
| [productcatalogservice](/src/productcatalogservice) | Go            | Provides the list of products from a JSON file and ability to search products and get individual products.                        |
| [currencyservice](/src/currencyservice)             | Node.js       | Converts one money amount to another currency. Uses real values fetched from European Central Bank. It's the highest QPS service. |
| [paymentservice](/src/paymentservice)               | Node.js       | Charges the given credit card info (mock) with the given amount and returns a transaction ID.                                     |
| [shippingservice](/src/shippingservice)             | Go            | Gives shipping cost estimates based on the shopping cart. Ships items to the given address (mock)                                 |
| [emailservice](/src/emailservice)                   | Python        | Sends users an order confirmation email (mock).                                                                                   |
| [checkoutservice](/src/checkoutservice)             | Go            | Retrieves user cart, prepares order and orchestrates the payment, shipping and the email notification.                            |
| [recommendationservice](/src/recommendationservice) | Python        | Recommends other products based on what's given in the cart.                                                                      |
| [adservice](/src/adservice)                         | Java          | Provides text ads based on given context words.                                                                                   |
| [loadgenerator](/src/loadgenerator)                 | Python/Locust | Continuously sends requests imitating realistic user shopping flows to the frontend.                                              |

## Screenshots

| Home Page                                                                                                         | Checkout Screen                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [![Screenshot of store homepage](/docs/img/online-boutique-frontend-1.png)](/docs/img/online-boutique-frontend-1.png) | [![Screenshot of checkout screen](/docs/img/online-boutique-frontend-2.png)](/docs/img/online-boutique-frontend-2.png) |

## Quickstart

1. Launch a local Kubernetes cluster with one of the following tools:
   a. **To launch Minikube**, ensure your local Kubernetes cluster has at least:
      - 4 CPUs
      - 4.0 GiB memory
      - 32 GB disk space

      ```sh
      minikube start --cpus=4 --memory=4096 --disk-size=32g
      ```

   b. **To launch Docker for Desktop** (tested with Mac/Windows), go to Preferences:
      - Enable "Kubernetes"
      - Set CPUs to at least 3
      - Set Memory to at least 6.0 GiB
      - On the "Disk" tab, set at least 32 GB disk space

   c. **To launch a Kind cluster**:

      ```sh
      kind create cluster
      ```
2. Deploy different containers in different pods in kubernetes
   Run the following commands in order:

      a. Verify you're connected to the Kubernetes control plane:

      ```sh
      kubectl get nodes
      ```

      b. Build and deploy the application (first time may take ~20 minutes):

      ```sh
      skaffold run
      ```

      > To automatically rebuild images as you refactor code, use:
      >
      > ```sh
      > skaffold dev
      > ```

      c. Verify that all Pods are ready and running:

      ```sh
      kubectl get pods
      ```
      After a few minutes, you should see the Pods in a `Running` state:

      ```
      NAME                                     READY   STATUS    RESTARTS   AGE
      adservice-76bdd69666-ckc5j               1/1     Running   0          2m58s
      cartservice-66d497c6b7-dp5jr             1/1     Running   0          2m59s
      checkoutservice-666c784bd6-4jd22         1/1     Running   0          3m1s
      currencyservice-5d5d496984-4jmd7         1/1     Running   0          2m59s
      emailservice-667457d9d6-75jcq            1/1     Running   0          3m2s
      frontend-6b8d69b9fb-wjqdg                1/1     Running   0          3m1s
      loadgenerator-665b5cd444-gwqdq           1/1     Running   0          3m
      paymentservice-68596d6dd6-bf6bv          1/1     Running   0          3m
      productcatalogservice-557d474574-888kr   1/1     Running   0          3m
      recommendationservice-69c56b74d4-7z8r5   1/1     Running   0          3m1s
      redis-cart-5f59546cdd-5jnqf              1/1     Running   0          2m58s
      shippingservice-6ccc89f8fd-v686r         1/1     Running   0          2m58s
      ```


      d. Forward a local port to the frontend service:

      ```sh
      kubectl port-forward deployment/frontend 8080:8080
      ```

      e. Access the web frontend at [http://localhost:8080](http://localhost:8080).

