
import { GoogleGenAI } from "@google/genai";
import { Language } from "./types";

export class GeminiService {
  private async ensureKeySelected(): Promise<void> {
    const aiWindow = window as any;
    if (typeof aiWindow !== 'undefined' && aiWindow.aistudio) {
      const hasKey = await aiWindow.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aiWindow.aistudio.openSelectKey();
        // On continue sans attendre car aistudio.hasSelectedApiKey() 
        // peut mettre du temps à se mettre à jour (race condition)
      }
    }
  }

  async askPizzeo(prompt: string, context?: any, language: Language = 'fr'): Promise<string> {
    // On utilise API_KEY si présente (clé payante choisie par l'user), sinon GEMINI_API_KEY (clé gratuite)
    const apiKey = (typeof process !== 'undefined' && process.env.API_KEY) || (typeof process !== 'undefined' && process.env.GEMINI_API_KEY);
    if (!apiKey) {
      throw new Error("entity was not found");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are Pizzeo, an expert assistant for pizzaiolos. 
          Respond in ${language === 'fr' ? 'French' : 'English'} with a professional and passionate tone.
          Context: ${JSON.stringify(context)}.
          Focus on: fermentation, hydration, flour strength (W), and baking tips.`
        }
      });
      return response.text || (language === 'fr' ? "Désolé, je ne peux pas répondre pour le moment." : "Sorry, I can't respond right now.");
    } catch (error: any) {
      console.error("Gemini Text Error:", error);
      // Si la clé est manquante ou invalide, on force la re-sélection
      if (error?.message?.includes("entity was not found") || error?.status === 403 || error?.message?.includes("403")) {
        const aiWindow = window as any;
        if (aiWindow.aistudio) await aiWindow.aistudio.openSelectKey();
      }
      throw error;
    }
  }

  async generatePizzaImage(prompt: string): Promise<string | null> {
    // On utilise gemini-2.5-flash-image qui est plus accessible (souvent dispo en gratuit)
    const apiKey = (typeof process !== 'undefined' && process.env.API_KEY) || (typeof process !== 'undefined' && process.env.GEMINI_API_KEY);
    
    if (!apiKey) {
      await this.ensureKeySelected();
      throw new Error("entity was not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [{ text: `High-end food photography of a pizza: ${prompt}. Neapolitan style, perfect crust bubbles, soft lighting, 4k resolution.` }] 
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error: any) {
      console.error("Gemini Image Error:", error);
      if (error?.message?.includes("entity was not found") || error?.status === 403 || error?.message?.includes("403")) {
        const aiWindow = window as any;
        if (aiWindow.aistudio) await aiWindow.aistudio.openSelectKey();
      }
      // Si c'est une erreur 500, on peut suggérer que l'image n'est pas dispo en gratuit
      if (error?.message?.includes("500") || error?.status === 500) {
        throw new Error("IMAGE_GEN_FAILED_500");
      }
      throw error;
    }
  }
}
