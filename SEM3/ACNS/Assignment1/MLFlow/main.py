# Installations
# 1. pip install mlflow
# 2. pip install psutil
# psutil is a cross-platform library for retrieving information on running processes and system utilization (CPU, memory, disks, network, sensors) in Python

# Steps to run
# 1. In terminal, run command -> mlflow ui --host 0.0.0.0 --port 5000
# 2. Right click on main.py and "run in interactive terminal"
# 3. Open localhost:5000 in browser and see the experimental results

# Import necessary libraries
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, precision_score, recall_score, f1_score, confusion_matrix
import mlflow
import mlflow.sklearn
import psutil
import time

# Set the MLflow tracking URI to 'http'
mlflow.set_tracking_uri("http://localhost:5000")

# Function for data preprocessing
def preprocess_data(data):

    # remove duplicates
    data = data.drop_duplicates()
    # Convert categorical variables to one-hot encoding
    data = pd.get_dummies(data, columns=['Sex','ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope'], drop_first=True)

    # Split data into X (features) and y (target)
    X = data.drop('HeartDisease', axis=1)
    y = data['HeartDisease']

    return X, y

# Function for training the Random Forest model
def train_model_randomforest(X_train, y_train, max_depth=3, n_estimators=100):
    start_time = time.time()
    # Initialize the classifier
    clf = RandomForestClassifier(max_depth=max_depth, n_estimators=n_estimators, random_state=42)

    # Train the model
    clf.fit(X_train, y_train)
    # Log system metrics
    cpu_usage = psutil.cpu_percent(interval=1)
    memory_usage = psutil.virtual_memory().percent

    mlflow.log_metric("system_cpu_usage", cpu_usage)
    mlflow.log_metric("system_memory_usage", memory_usage)
    end_time = time.time()
    training_time = end_time - start_time
    return clf, training_time

# Function for training the Logistic Regression model
def train_model_logisticregression(X_train, y_train):
    start_time = time.time()
    clf = LogisticRegression(max_iter=1000)
    clf.fit(X_train, y_train)
    # Log system metrics
    cpu_usage = psutil.cpu_percent(interval=1)
    memory_usage = psutil.virtual_memory().percent

    mlflow.log_metric("system_cpu_usage", cpu_usage)
    mlflow.log_metric("system_memory_usage", memory_usage)
    end_time = time.time()
    training_time = end_time - start_time
    return clf, training_time

# Function to evaluate the model
def evaluate_model(name, model, X_test, y_test):
    # Make predictions
    y_pred = model.predict(X_test)
    print(f"\n📊 Evaluation Metrics for {name}:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    print(f"Precision: {precision_score(y_test, y_pred):.2f}")
    print(f"Recall: {recall_score(y_test, y_pred):.2f}")
    print(f"F1 Score: {f1_score(y_test, y_pred):.2f}")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    # Display classification report
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

# Function to log model and system metrics to MLflow
def log_to_mlflow(name, model, X_train, X_test, y_train, y_test):
    try:
        if mlflow.active_run():
            mlflow.end_run()
        with mlflow.start_run(run_name=name):
            mlflow.log_param("model_type", name)

            # Log hyper parameters using in Random Forest Algorithm
            if hasattr(model, 'max_depth'):
                mlflow.log_param("max_depth", model.max_depth)
            if hasattr(model, 'n_estimators'):
                mlflow.log_param("n_estimators", model.n_estimators)

            # Log model metrics
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='macro')
            recall = recall_score(y_test, y_pred, average='macro')
            f1 = f1_score(y_test, y_pred, average='macro')
            confusion = confusion_matrix(y_test, y_pred)
            
            mlflow.log_metric("accuracy", accuracy)
            mlflow.log_metric("precision", precision)
            mlflow.log_metric("recall", recall)
            mlflow.log_metric("f1-score", f1)
            
            # Log confusion matrix
            confusion_dict = {
                "true_positive": confusion[1][1],
                "false_positive": confusion[0][1],
                "true_negative": confusion[0][0],
                "false_negative": confusion[1][0]
            }
            mlflow.log_metrics(confusion_dict)

            # Log model
            mlflow.sklearn.log_model(model, name)
    except Exception as e:
        mlflow.log_param("exception", str(e))
        raise
# Main function
def main():
    # Load the dataset
    data = pd.read_csv("heart.csv")  

    # Preprocess the data
    X, y = preprocess_data(data)

    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train the Random forest model
    rf_model, train_time = train_model_randomforest(X_train, y_train)
    # Log execution time 
    mlflow.log_metric("randomforest_training_time_seconds", train_time)
    evaluate_model("Random Forest", rf_model, X_test, y_test)
    # Evaluate and log to MLflow
    log_to_mlflow("RandomForest",rf_model, X_train, X_test, y_train, y_test)

     # Train Logistic Regression
    log_model,train_time = train_model_logisticregression(X_train, y_train)
    # Log execution time 
    mlflow.log_metric("regression_training_time_seconds", train_time)
    evaluate_model("Logistic Regression", log_model, X_test, y_test)
    log_to_mlflow("LogisticRegression", log_model, X_train, X_test, y_train, y_test)

if __name__ == "__main__":
    main()
