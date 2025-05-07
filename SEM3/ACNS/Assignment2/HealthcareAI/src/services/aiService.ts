import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const bits_openai = new OpenAI({
  apiKey: import.meta.env.VITE_BITS_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});


const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

export const analyzeText = async (text: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant. Analyze the following medical text and extract entities, sentiment, and provide a summary. Additionally, estimate the model's performance metrics such as accuracy, precision, recall, and F1 score based on the analysis.Return the response in JSON format with entities (text, type, score), sentiment (label, score), summary, metrics (Object with accuracy, precision, recall, and F1 score) and keywords."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};

export const answerQuestion = async (question: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant. Answer the following medical question with accurate, evidence-based information.  Additionally, estimate the model's performance metrics such as accuracy, precision, recall, and F1 score based on the analysis. Include metrics, confidence score and sources in your JSON response."
        },
        {
          role: "user",
          content: question
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
  }
};

export const predictDisease = async (symptoms: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant. Based on the provided symptoms, predict potential diseases with probabilities and descriptions. Additionally, estimate the model's performance metrics such as accuracy, precision, recall, and F1 score based on the analysis. Return the response in JSON format with predictions array (name, probability, description), metrics and overall confidence."
        },
        {
          role: "user",
          content: symptoms
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error predicting disease:', error);
    throw error;
  }
};

// export const classifyImage = async (image: File) => {
//   try {
//     const reader = new FileReader();

//     //const imageData = await image.arrayBuffer();
//     const base64=await image.arrayBuffer().then(buffer =>
//       btoa(String.fromCharCode(...new Uint8Array(buffer)))
//     );
//     // const response = await hf.imageClassification({
//     //   data: imageData,
//     //   model: "microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224",
      
//     // });
//     const response = await fetch("http://localhost:3001/api/classify", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ imageBase64: base64,textPrompt: "Xray scan showing some issue" })
//     });

//     return {
//       predictions: await response.json()
//       // predictions: response.map(pred => ({
//       //   label: pred.label,
//       //   score: pred.score,
//       // }))
//     };
//   } catch (error) {
//     console.error('Error classifying image:', error);
//     throw error;
//   }
// };

// export const classifyImage = async (image: File) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const reader = new FileReader();

//       reader.onloadend = async () => {
//         try {
//           const base64WithPrefix = reader.result as string;

//           // ✅ Remove the data URI prefix
//           const base64 = base64WithPrefix.split(",")[1];

//           const response = await fetch("http://localhost:5000/api/analyze", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//               imageBase64: base64,
//               textPrompt: "Xray scan showing some issue"
//             })
//           });

//           if (!response.ok) {
//             const err = await response.json();
//             return reject(err);
//           }

//           const result = await response.json();
//           resolve({ predictions: result });
//         } catch (error) {
//           console.error("Error sending image to backend:", error);
//           reject(error);
//         }
//       };

//       reader.onerror = () => reject("Failed to read image file");

//       // ✅ Safe and correct base64 conversion
//       reader.readAsDataURL(image);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };
export const classifyImage = async (image: File) => {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("image", image); // Add the image file to the FormData object
      formData.append("textPrompt", "Xray scan showing some issue"); // Add the text prompt

      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData, // Pass the FormData object as the request body
      });

      if (!response.ok) {
        const err = await response.json();
        return reject(err);
      }

      const result = await response.json();
      console.log("Image classification result:", result);
      
      resolve({ predictions: result });
    } catch (error) {
      console.error("Error sending image to backend:", error);
      reject(error);
    }
  });
};

export const normalizeConfidence = (confidence: string | number): number => {
  if (typeof confidence === 'string') {
    // Map textual confidence levels to numeric values
    switch (confidence.toLowerCase()) {
      case 'high':
        return 90; // Example: High = 90%
      case 'medium':
        return 60; // Example: Medium = 60%
      case 'low':
        return 30; // Example: Low = 30%
      case 'moderate to high':
        return 75; // Example: Very High = 95%
      case 'low to moderate':
        return 40; // Example: Very High = 95%
      default:
        if(confidence.includes('%')) {
          const percentage = parseFloat(confidence.replace('%', ''));
          return isNaN(percentage) ? 0 : percentage; // Convert to number if it's a percentage string
        }
        console.warn('Unknown confidence level:', confidence);
        return 50; // Default to 50% if unknown
    }
  } else if (typeof confidence === 'number') {
    // If it's already a number, normalize it to a 0-1 scale if needed
    return confidence > 1 ? confidence  : confidence * 100;
  }

  console.warn('Invalid confidence value:', confidence);
  return 0; // Default to 0 if invalid
};
export const listFineTuningJobs = async () => {
  try {
    const response = await bits_openai.fineTuning.jobs.list({limit: 5});
    const filteredJobs = response.data.filter(
      (job: any) => job?.user_provided_suffix === "muzammil-25"
    );
    return filteredJobs; // an array of jobs
  } catch (error) {
    console.error('Error listing fine-tuning jobs:', error);
    throw error;
  }
};
export const createFineTuningJob = async (trainingData: string) => {
  try {
    // Convert JSONL string to File object
    const file = new File(
      [trainingData],
      'training_data.jsonl',
      { type: 'application/jsonl' }
    );

    // Upload the training file
    const uploadResponse = await bits_openai.files.create({
      file,
      purpose: 'fine-tune'
    });

    // Create fine-tuning job
    const fineTuningJob = await bits_openai.fineTuning.jobs.create({
      training_file: uploadResponse.id,
      model: 'gpt-4o-mini-2024-07-18',
      suffix: 'muzammil-25',

      hyperparameters: {
        n_epochs: 1
      }
    });

    return {
      jobId: fineTuningJob.id,
      status: fineTuningJob.status,
      fineTunedModel: fineTuningJob.fine_tuned_model || null,
    };
  } catch (error) {
    console.error('Error creating fine-tuning job:', error);
    throw error;
  }
};

export const getFineTuningJobStatus = async (jobId: string) => {
  try {
    const job = await bits_openai.fineTuning.jobs.retrieve(jobId);
    
    return {
      status: job.status,
      progress: job.trained_tokens ? 
        Math.round((job.trained_tokens / (job.training_file?.tokens || 1)) * 100) : 0,
      error: job.error?.message,
      fineTunedModel: job.fine_tuned_model || null,
      
    };
  } catch (error) {
    console.error('Error getting fine-tuning job status:', error);
    throw error;
  }
};

export const testFineTunedModel = async (modelId: string, prompt: string) => {
  const response = await bits_openai.chat.completions.create({
    model: modelId,
    messages: [
      { role: 'system', content: 'You are a healthcare assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  });

  return response.choices?.[0]?.message?.content || 'No response';
};
