# To run the file in terminal type > python workflow.py 
# Has to connect with Prefect cloud -> https://app.prefect.cloud/
# Prefect Login [Prefect Cloud] - https://www.prefect.io/opensource  -> get started

# Step 1: Import Required Libraries
import pandas as pd
from prefect import flow, task
from sklearn.preprocessing import MinMaxScaler

# Step 2: Load the Dataset
@task
def load_dataset():
    # Load the dataset -- 918 rows of patient data
    url = "https://raw.githubusercontent.com/akmuzammil/MTECH-Public/refs/heads/main/SEM3/ACNS/Datasets/heart.csv"
    column_names = ['Age','Sex','ChestPainType','RestingBP','Cholesterol','FastingBS','RestingECG','MaxHR','ExerciseAngina','Oldpeak','ST_Slope','HeartDisease']
    return pd.read_csv(url, names=column_names,header=1)

# Step 3: Data Preprocessing
@task(log_prints=True)
def preprocess_data(df):

    # Print columns with missing values and their count
    missing_values = df.isna().sum()
    columns_with_missing = missing_values[missing_values > 0]
    print("Columns with missing values: ")
    print(columns_with_missing)
    
    # Fill missing values in numeric columns only
    numeric_cols = df.select_dtypes(include='number').columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    #df.fillna(df.select_dtypes(include='number').median(), inplace=True)
    #Separate features and target
    target = df['HeartDisease']
    features = df.drop(columns=['HeartDisease'])
    #Encode categorical features
    features_encoded = pd.get_dummies(features, drop_first=True)
    #Separate numeric and categorical features
    original_numeric_cols = df.select_dtypes(include='number').drop(columns=['HeartDisease']).columns
    
    # Normalize using Min-Max Scaling
    scaler = MinMaxScaler()
    # normalized_numeric = pd.DataFrame(
    #     scaler.fit_transform(numeric_features),
    #     columns=numeric_features.columns
    # )
    features_encoded[original_numeric_cols] = scaler.fit_transform(features_encoded[original_numeric_cols])
    #Concatenate normalized numeric + original categorical features
    #df_normalized = pd.concat([normalized_numeric, categorical_features.reset_index(drop=True)], axis=1)
    df_preprocessed = pd.concat([features_encoded, target.reset_index(drop=True)], axis=1)

    # Add target column back
    #df_normalized['HeartDisease'] = target.reset_index(drop=True)

    # features = df.drop('HeartDisease', axis=1)  # Exclude the target variable
    # features = df.select_dtypes(include=['number'])
    # df_normalized = pd.DataFrame(scaler.fit_transform(features), columns=features.columns)
    # non_numeric = df.select_dtypes(exclude=['number'])
    # df_normalized = pd.concat([df_normalized, non_numeric.reset_index(drop=True)], axis=1)

    # df_normalized['HeartDisease'] = df['HeartDisease']  # Add the target variable back to the dataframe

    # Print the normalized dataframe
    #Print a sample
    print("Preprocessed DataFrame (with encoding + normalization):")
    print(df_preprocessed.head())

    return df_preprocessed

# Step 4: Model Training
@task
def train_model(df):
    # Train your machine learning model with Logistic Regression (classification model)
    from sklearn.model_selection import train_test_split
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score
    
    X = df.drop('HeartDisease', axis=1)
    y = df['HeartDisease']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    return accuracy

# Step 5: Define Prefect Flow
@flow(log_prints=True)
def workflow_heart_disease():
    # step 1 = loading data
    data = load_dataset()
    # step 2 = preprocessing
    preprocessed_data = preprocess_data(data)
    # step 3 = data modeling
    accuracy = train_model(preprocessed_data)

    print("Accuracy: ", accuracy)
   
# Step 6: Run the Prefect Flow
if __name__ == "__main__":
    workflow_heart_disease.serve(name="heart-disease-workflow",
                      tags=["first workflow"],
                      parameters={},
                      interval=30) #2 minutes
