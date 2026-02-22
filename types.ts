
import { ReactNode } from 'react';

export type Language = 'fr' | 'en';

export type YeastType = 'dry' | 'fresh';

export interface RecipePreset {
  name: string;
  nameEn: string;
  hydration: number;
  salt: number;
  yeast: number;
  oil: number;
  sugar: number;
}

export interface ProductionScale {
  id: string;
  name: string;
  nameEn: string;
  icon: ReactNode;
  pizzas: number;
  weightPerBall: number;
  description: string;
  descriptionEn: string;
  notes: string;
  notesEn: string;
}

export interface DoughCalculatorState {
  numberOfPizzas: number;
  doughWeightPerBall: number;
  hydration: number;
  salt: number;
  yeast: number;
  yeastType: YeastType;
  oil: number;
  sugar: number;
  includeResidue: boolean;
  ambientTemp: number;
  flourTemp: number;
  baseTemp: number;
  targetDinnerTime: string;
  totalFermentationHours: number;
  language: Language;
  theme: 'dark' | 'light';
}

export interface Ingredient {
  ingredient: string;
  quantite: number;
  pourcentage: number;
  note: string;
}

export interface CalculationResults {
  totalDoughWeight: number;
  totalPercentage: number;
  facteur: number;
  flourWeight: number;
  waterWeight: number;
  waterVolume: number;
  saltWeight: number;
  dryYeastWeight: number;
  freshYeastWeight: number;
  oilWeight: number;
  sugarWeight: number;
  useKg: boolean;
  productionNote: string;
  idealWaterTemp: number;
  startTime: string;
  takeOutTime: string;
  ingredientsTable: Ingredient[];
  debugInfo: {
    nombrePizzas: number;
    poidsBoule: number;
    poidsTotal: number;
    hydratation: number;
    sel: number;
    levure: number;
    huile: number;
    sucre: number;
    facteur: number;
  };
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GEMINI_API_KEY: string;
      API_KEY: string;
    }
  }
}
