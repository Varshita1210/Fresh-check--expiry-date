
import { GoogleGenAI, Type } from "@google/genai";
import { ExpiryAnalysis, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeExpiryImage = async (base64Image: string): Promise<ExpiryAnalysis> => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this product label image.
            1. Identify the product name clearly.
            2. Find the expiry date (EXP, Best Before, Use By, etc.).
            3. Categorize the item as one of: food, medicine, personal-care, household, or other.
            4. Return valid JSON only.
            
            Today's date is ${new Date().toISOString().split('T')[0]}.
            If the expiry date is not found, try to estimate based on other visible dates or manufacturing date if available, otherwise return null for expiryDate.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          expiryDate: { type: Type.STRING, description: "YYYY-MM-DD" },
          foundText: { type: Type.STRING },
          confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
          category: { type: Type.STRING, enum: ["food", "medicine", "personal-care", "household", "other"] }
        },
        required: ["productName", "expiryDate", "foundText", "confidence", "category"]
      }
    }
  });

  const response = await model;
  const data = JSON.parse(response.text || "{}");

  return processAnalysisData(data);
};

export const processAnalysisData = (data: any): ExpiryAnalysis => {
  let isExpired = false;
  let daysRemaining: number | null = null;
  let status: ExpiryAnalysis['status'] = 'unknown';

  try {
    const exp = new Date(data.expiryDate);
    if (!isNaN(exp.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = exp.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      isExpired = daysRemaining < 0;
      if (isExpired) status = 'expired';
      else if (daysRemaining <= 7) status = 'expiring-soon';
      else status = 'valid';
    }
  } catch (e) {
    console.error("Date calculation error", e);
  }

  return {
    ...data,
    isExpired,
    daysRemaining,
    status,
    category: (data.category as Category) || 'other'
  };
};
