import pandas as pd
from scipy.stats import pearsonr
import logging
from matplotlib import pyplot as plt
import io
import base64

# Configure standard Python logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import the data
df = pd.read_csv("../data/heart.csv")
logger.info("Dataset loaded for Pearson correlation.")

# Convert columns to series
list1 = df['Age']
list2 = df['RestingBP']

# Compute Pearson correlation
corr, _ = pearsonr(list1, list2)
logger.info(f'Pearson correlation: {corr:.3f}')

# Scatter plot
plt.scatter(list1, list2)
plt.xlabel('Age')
plt.ylabel('Resting BP')
plt.title('Scatter plot of Age vs Resting BP')

# Save the plot to a buffer
buf = io.BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)

# Encode the image in base64 and log it
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
#logger.info("Scatter plot image (base64 encoded):")
#logger.info(f"data:image/png;base64,{img_base64}")

# Save the plot as a file
plt.savefig("../output/scatter_plot_resting_bp.png")
logger.info("Scatter plot saved as 'scatter_plot_resting_bp.png'")

# Close the buffer
buf.close()
