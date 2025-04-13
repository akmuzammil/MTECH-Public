import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import logging

# Configure standard logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load the dataset
df = pd.read_csv("../data/heart.csv",header=1)
logger.info("Dataset loaded successfully.")
logger.info(f"DataFrame head:\n{df.head()}")


# Summary statistics
logger.info("Summary Statistics:")
logger.info(f"\n{df.describe(include='all')}")

# Checking for missing values
logger.info("Missing Values:")
logger.info(f"\n{df.isnull().sum()}")

# Data type information
logger.info("Data Types:")
logger.info(f"\n{df.dtypes}")
