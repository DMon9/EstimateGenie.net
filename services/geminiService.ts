import { GoogleGenAI, Type } from "@google/genai";
import { QuoteData, ImageSize, ProjectInputs } from "../types";

// Helper to ensure we have a valid instance with the latest key if needed
const getAIInstance = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const analyzeProject = async (
  base64Data: string,
  mimeType: string,
  inputs: ProjectInputs
): Promise<QuoteData> => {
  const ai = getAIInstance();

  // Schema definition for structured output
  const quoteSchema = {
    type: Type.OBJECT,
    properties: {
      projectName: { type: Type.STRING },
      summary: { type: Type.STRING },
      totalEstimatedCostMin: { type: Type.NUMBER },
      totalEstimatedCostMax: { type: Type.NUMBER },
      currency: { type: Type.STRING },
      breakdown: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            estimatedCost: { type: Type.NUMBER },
            category: { type: Type.STRING },
          },
        },
      },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phaseName: { type: Type.STRING },
            duration: { type: Type.STRING },
            estimatedCost: { type: Type.NUMBER, description: "Total cost for this phase" },
            description: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
      materials: { type: Type.ARRAY, items: { type: Type.STRING } },
      designStyleSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["projectName", "totalEstimatedCostMin", "totalEstimatedCostMax", "breakdown", "timeline"],
  };

  let manualInputsText = "";
  if (inputs.manualMaterials.length > 0) {
    manualInputsText += "\nThe user has already identified the following materials to include in the quote:\n";
    inputs.manualMaterials.forEach(m => {
        manualInputsText += `- ${m.name} (Quantity: ${m.quantity})\n`;
    });
  }
  if (inputs.laborHours) {
    manualInputsText += `\nThe user estimates approximately ${inputs.laborHours} labor hours for the project. Please factor this into labor cost calculations at standard rates.\n`;
  }
  
  const parts = [
    {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    },
    {
      text: `You are an expert construction estimator and interior designer for "Estimate Genie". 
      Analyze this image/video of a project site. 
      
      User Vision: "${inputs.prompt}"
      Preferred Style: "${inputs.style}"
      ${manualInputsText}
      
      Provide a professional detailed quote.
      
      Requirements:
      1. A realistic cost estimate range (Min/Max).
      2. A detailed cost breakdown by category (Materials, Labor, Permits, etc.).
      3. A distinct phased timeline (e.g., Planning, Demolition, Construction, Finishing) with:
         - Estimated duration per phase.
         - Estimated cost specifically for that phase.
         - Tasks involved.
      4. Suggested materials, incorporating any user-specified materials.
      5. Confirm the design style matches "${inputs.style}" or suggest complementary styles.
      
      Be realistic with pricing based on current US market rates.`,
    },
  ];

  try {
    console.log("[Gemini] Starting quote analysis...");
    console.log("[Gemini] Image size:", base64Data.length, "bytes");
    
    // Create abort controller for timeout (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: quoteSchema,
        },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Quote generation timed out after 30 seconds")), 30000)
      )
    ]);

    clearTimeout(timeoutId);

    if (!response || !response.text) {
      console.error("[Gemini] No response text received");
      throw new Error("No response from Gemini API");
    }

    console.log("[Gemini] Received response, parsing JSON...");
    const result = JSON.parse(response.text) as QuoteData;
    console.log("[Gemini] Quote analysis completed successfully");
    
    return result;
  } catch (error) {
    console.error("[Gemini] Analysis error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("timed out")) {
        throw new Error("Quote generation took too long. Please try with a simpler image or contact support.");
      }
      if (error.message.includes("JSON")) {
        throw new Error("Failed to parse quote data. The API response was invalid.");
      }
      if (error.message.includes("API key")) {
        throw new Error("API key configuration error. Please contact support.");
      }
      throw new Error(`Quote generation failed: ${error.message}`);
    }
    
    throw new Error("Quote generation failed. Please try again.");
  }
};

export const generateVisualization = async (
  prompt: string,
  style: string,
  imageSize: ImageSize = '1K'
): Promise<string> => {
  // Ensure user has selected an API key for paid models if using Veo/Image Pro
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  const ai = getAIInstance(); // Re-instantiate to pick up potential new key

  const fullPrompt = `Photorealistic architectural rendering of: ${prompt}. \nStyle: ${style}. \nHigh quality, detailed, cinematic lighting, 8k resolution, interior design magazine quality.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [{ text: fullPrompt }],
    },
    config: {
      imageConfig: {
        imageSize: imageSize,
        aspectRatio: "16:9",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image generated.");
};

export const editVisualization = async (
  originalBase64: string,
  editPrompt: string
): Promise<string> => {
  const ai = getAIInstance();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: originalBase64,
          },
        },
        {
          text: editPrompt,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No edited image generated.");
};

export const generateProjectVideo = async (
  prompt: string,
  style: string,
  imageBytes?: string,
): Promise<string> => {
  // Ensure user has selected an API key for paid models if using Veo
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  const ai = getAIInstance();
  
  // Create a cinematic prompt
  const fullPrompt = `Cinematic, slow-motion promotional video of a renovated space: ${prompt}. Style: ${style}. Photorealistic, architectural digest quality, smooth camera movement, high resolution.`;

  let operation;

  if (imageBytes) {
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: fullPrompt,
      image: {
        imageBytes: imageBytes,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
  } else {
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: fullPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
  }

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation failed: No download link returned.");
  }

  // Fetch the video using the API key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
