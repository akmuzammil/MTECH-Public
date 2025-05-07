document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('upload-form');
  const fileInput = document.getElementById('image-upload');
  const previewImage = document.getElementById('preview-image');
  const resultsJson = document.getElementById('results-json');
  const loadingIndicator = document.getElementById('loading');
  
  // Show image preview when file is selected
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading indicator
    loadingIndicator.classList.remove('hidden');
    resultsJson.textContent = '';
    
    // Get form data
    const formData = new FormData(form);
    console.log('Form data:', formData);
    try {
      // Send request to the Python API
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      // Process response
      const data = await response.json();
      
      // Display results
      resultsJson.textContent = JSON.stringify(data, null, 2);
      
      // Add visual elements for detection results if available
      if (data.results && data.results.length > 0 && data.model === 'medical-detection') {
        // You could add code here to draw bounding boxes on the image
        // using canvas or overlays based on the bbox data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = previewImage.width;
        canvas.height = previewImage.height;
        previewImage.parentNode.insertBefore(canvas, previewImage.nextSibling);
        ctx.drawImage(previewImage, 0, 0);
        data.results.forEach(result => {
          const { bbox, label } = result;
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
          ctx.fillStyle = 'red';
          ctx.font = '16px Arial';
          ctx.fillText(label, bbox[0], bbox[1] > 10 ? bbox[1] - 5 : 10);
        });
      }
      
      // Show success notification
      if (data.success) {
        showNotification('Analysis completed successfully', 'success');
      } else {
        showNotification('Analysis completed with warnings', 'warning');
      }
    } catch (error) {
      console.error('Error:', error);
      resultsJson.textContent = JSON.stringify({
        error: 'Failed to analyze image. See console for details.'
      }, null, 2);
      showNotification('Failed to analyze image', 'error');
    } finally {
      // Hide loading indicator
      loadingIndicator.classList.add('hidden');
    }
  });
  
  // Simple notification system
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  // Add notification styles
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      transform: translateX(100%);
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .notification.info {
      background-color: #3B82F6;
    }
    
    .notification.success {
      background-color: #10B981;
    }
    
    .notification.warning {
      background-color: #F59E0B;
    }
    
    .notification.error {
      background-color: #EF4444;
    }
  `;
  document.head.appendChild(style);
});