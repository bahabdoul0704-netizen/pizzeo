
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Pizza, Calculator, UtensilsCrossed, Scale, Factory, Coffee, MessageCircle, 
  Settings, ChevronDown, ChevronUp, Info, Send, Sparkles, Image as ImageIcon, 
  Wand2, Wheat, Droplets, FlaskConical, Thermometer, Share2, Copy, CheckCircle2,
  Clock, Trash2, Plus, Minus, Moon, Sun, Key, Loader2, X, Zap, Languages, Heart, Gift
} from 'lucide-react';
import { PRESETS, PRODUCTION_SCALES, TRANSLATIONS } from './constants';
import { DoughCalculatorState, CalculationResults, RecipePreset, Ingredient, YeastType, Language } from './types';
import { GeminiService } from './geminiService';

// --- UI Components ---

const Card: React.FC<{ children: React.ReactNode; className?: string; theme: 'dark' | 'light' }> = ({ children, className = "", theme }) => (
  <div className={`backdrop-blur-xl rounded-[2.5rem] overflow-hidden transition-all duration-500 border ${
    theme === 'dark'
      ? 'bg-slate-950/80 border-slate-800 shadow-2xl hover:border-slate-700' 
      : 'bg-white/80 border-slate-200 shadow-xl hover:border-orange-500/30'
  } ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string; variant?: 'default' | 'secondary' | 'warning' | 'info' | 'success'; theme: 'dark' | 'light' }> = ({ children, className = "", variant = "default", theme }) => {
  const styles = {
    default: theme === 'dark' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-500/10 text-orange-600 border-orange-200',
    secondary: theme === 'dark' ? 'bg-slate-700/50 text-slate-300 border-slate-600/50' : 'bg-slate-100 text-slate-600 border-slate-200',
    warning: theme === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-200',
    info: theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-500/10 text-blue-600 border-blue-200',
    success: theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-500/10 text-green-600 border-green-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

const PreciseControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  theme: 'dark' | 'light';
}> = ({ label, value, min, max, step = 1, unit = "", onChange, icon, theme }) => {
  const increment = () => onChange(Math.min(max, Number((value + step).toFixed(2))));
  const decrement = () => onChange(Math.max(min, Number((value - step).toFixed(2))));

  return (
    <div className="group space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-orange-500 transition-transform group-hover:scale-110 duration-300">{icon}</span>}
          <label className={`text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
        </div>
        <span className={`text-2xl font-black tabular-nums ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
          {value}<span className={`text-sm ml-0.5 font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{unit}</span>
        </span>
      </div>
      <div className={`flex items-center gap-4 p-2 rounded-2xl border group-focus-within:border-orange-500/50 transition-colors ${
        theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button 
          onClick={decrement}
          className={`p-2.5 rounded-xl transition-all text-slate-400 active:scale-90 ${
            theme === 'dark' ? 'hover:bg-slate-900 hover:text-white' : 'hover:bg-white hover:text-orange-500'
          }`}
        >
          <Minus className="w-5 h-5" />
        </button>
        <div className="flex-1 px-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'
            }`}
          />
        </div>
        <button 
          onClick={increment}
          className={`p-2.5 rounded-xl transition-all text-slate-400 active:scale-90 ${
            theme === 'dark' ? 'hover:bg-slate-900 hover:text-white' : 'hover:bg-white hover:text-orange-500'
          }`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const MainTabs: React.FC<{
  value: string;
  onValueChange: (val: string) => void;
  options: { id: string; label: string; icon: React.ReactNode }[];
  theme: 'dark' | 'light';
}> = ({ value, onValueChange, options, theme }) => (
  <div className={`flex p-1.5 rounded-[1.5rem] border shadow-inner overflow-x-auto no-scrollbar ${
    theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
  }`}>
    {options.map((opt) => (
      <button
        key={opt.id}
        onClick={() => onValueChange(opt.id)}
        className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
          value === opt.id 
            ? 'bg-orange-500 text-white shadow-xl scale-[1.02]' 
            : theme === 'dark' 
              ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-900' 
              : 'text-slate-400 hover:text-orange-500 hover:bg-white'
        }`}
      >
        <span className={value === opt.id ? 'animate-pulse' : ''}>{opt.icon}</span>
        <span className="hidden md:inline whitespace-nowrap">{opt.label}</span>
      </button>
    ))}
  </div>
);

// --- Utils ---
const getBrowserLanguage = (): Language => {
  const lang = navigator.language.split('-')[0];
  return lang === 'fr' ? 'fr' : 'en';
};

const DEFAULT_STATE: DoughCalculatorState = {
  numberOfPizzas: 4,
  doughWeightPerBall: 250,
  hydration: 60,
  salt: 3,
  yeast: 0.1,
  yeastType: 'dry',
  oil: 0,
  sugar: 0,
  includeResidue: true,
  ambientTemp: 22,
  flourTemp: 21,
  baseTemp: 60,
  targetDinnerTime: "20:00",
  totalFermentationHours: 24,
  language: getBrowserLanguage(),
  theme: 'dark',
};

export default function App() {
  const [calculator, setCalculator] = useState<DoughCalculatorState>(() => {
    const saved = localStorage.getItem('pizzeo_v3_state');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed }; 
      } catch (e) { return DEFAULT_STATE; }
    }
    return DEFAULT_STATE;
  });

  const language = calculator.language;
  const t = (key: keyof typeof TRANSLATIONS['fr'], params?: Record<string, string | number>) => {
    let text = TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, String(v));
      });
    }
    return text;
  };

  useEffect(() => {
    localStorage.setItem('pizzeo_v3_state', JSON.stringify(calculator));
    if (calculator.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [calculator]);

  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [activeScale, setActiveScale] = useState<string>('artisanal');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [showDetailedTable, setShowDetailedTable] = useState(false);
  const [showCalcInfo, setShowCalcInfo] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string; image?: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const gemini = useMemo(() => new GeminiService(), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const calculations = useMemo((): CalculationResults => {
    const { 
      numberOfPizzas, doughWeightPerBall, hydration, salt, yeast, yeastType, oil, sugar, 
      includeResidue, ambientTemp, flourTemp, baseTemp, targetDinnerTime, totalFermentationHours 
    } = calculator;
    
    let totalDoughWeight = numberOfPizzas * doughWeightPerBall;
    if (includeResidue) totalDoughWeight *= 1.03;
    
    const idealWaterTemp = baseTemp - (flourTemp + ambientTemp);
    
    const [hours, minutes] = targetDinnerTime.split(':').map(Number);
    const dinnerDate = new Date(); dinnerDate.setHours(hours, minutes, 0, 0);
    const startDate = new Date(dinnerDate.getTime() - totalFermentationHours * 60 * 60 * 1000);
    const takeOutDate = new Date(dinnerDate.getTime() - 4 * 60 * 60 * 1000);

    const h = hydration / 100;
    const s = salt / 100;
    const o = oil / 100;
    const sug = sugar / 100;
    
    const yeastFactor = yeast / 100;
    const facteur = 1 + h + s + yeastFactor + o + sug;
    const flourWeight = totalDoughWeight / facteur;
    
    const waterWeight = flourWeight * h;
    const saltWeight = flourWeight * s;
    const oilWeight = flourWeight * o;
    const sugarWeight = flourWeight * sug;
    
    const dryYeastWeight = yeastType === 'dry' ? (flourWeight * yeastFactor) : (flourWeight * yeastFactor / 3);
    const freshYeastWeight = yeastType === 'fresh' ? (flourWeight * yeastFactor) : (flourWeight * yeastFactor * 3);
    
    const ingredientsTable: Ingredient[] = [
      { ingredient: `🌾 ${t('flour')}`, quantite: flourWeight, pourcentage: 100, note: language === 'fr' ? 'Base de calcul' : 'Calculation base' },
      { ingredient: `💧 ${t('water')}`, quantite: waterWeight, pourcentage: hydration, note: `${idealWaterTemp.toFixed(1)}°C` },
      { ingredient: `🧂 ${t('salt')}`, quantite: saltWeight, pourcentage: salt, note: '-' },
      { 
        ingredient: `🍄 ${language === 'fr' ? 'Levure Sèche' : 'Dry Yeast'}`, 
        quantite: dryYeastWeight, 
        pourcentage: yeastType === 'dry' ? yeast : Number((yeast / 3).toFixed(2)), 
        note: language === 'fr' ? 'Active' : 'Active' 
      },
      { 
        ingredient: `🍄 ${language === 'fr' ? 'Levure Fraîche' : 'Fresh Yeast'}`, 
        quantite: freshYeastWeight, 
        pourcentage: yeastType === 'fresh' ? yeast : Number((yeast * 3).toFixed(2)), 
        note: '×3' 
      },
    ];
    if (oil > 0) ingredientsTable.push({ ingredient: `🫗 ${t('oil')}`, quantite: oilWeight, pourcentage: oil, note: `${oil}%` });
    if (sugar > 0) ingredientsTable.push({ ingredient: `🍬 ${t('sugar')}`, quantite: sugarWeight, pourcentage: sugar, note: `${sugar}%` });

    return {
      totalDoughWeight,
      totalPercentage: 100 + hydration + salt + yeast + oil + sugar,
      facteur, flourWeight, waterWeight, waterVolume: waterWeight,
      saltWeight, dryYeastWeight, freshYeastWeight, oilWeight, sugarWeight,
      useKg: flourWeight >= 1000, productionNote: hydration > 75 ? "⚠️ Haute Hydratation" : "",
      idealWaterTemp,
      startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (" + startDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' }) + ")",
      takeOutTime: takeOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ingredientsTable,
      debugInfo: { 
        nombrePizzas: numberOfPizzas, 
        poidsBoule: doughWeightPerBall, 
        poidsTotal: totalDoughWeight, 
        hydratation: h, 
        sel: s, 
        levure: yeastFactor, 
        huile: o,
        sucre: sug,
        facteur 
      }
    };
  }, [calculator, language]);

  const updateCalculator = (key: keyof DoughCalculatorState, value: any) => {
    setCalculator(prev => ({ ...prev, [key]: value }));
    if (['hydration', 'salt', 'yeast', 'oil', 'sugar'].includes(key)) setActivePreset(null);
    if (['numberOfPizzas', 'doughWeightPerBall'].includes(key)) setActiveScale('custom');
  };

  const applyScale = (scaleId: string) => {
    const scale = PRODUCTION_SCALES.find(s => s.id === scaleId);
    if (scale) {
      setCalculator(prev => ({ ...prev, numberOfPizzas: scale.pizzas, doughWeightPerBall: scale.weightPerBall }));
      setActiveScale(scaleId);
    }
  };

  const applyPreset = (preset: RecipePreset) => {
    setCalculator(prev => ({
      ...prev,
      hydration: preset.hydration,
      salt: preset.salt,
      yeast: preset.yeast,
      oil: preset.oil,
      sugar: preset.sugar
    }));
    setActivePreset(language === 'fr' ? preset.name : preset.nameEn);
  };

  const toggleYeastType = () => {
    const newType: YeastType = calculator.yeastType === 'dry' ? 'fresh' : 'dry';
    const newValue = newType === 'fresh' ? calculator.yeast * 3 : calculator.yeast / 3;
    setCalculator(prev => ({ ...prev, yeastType: newType, yeast: Number(newValue.toFixed(2)) }));
  };

  const copyRecipe = () => {
    const yeastLabel = calculator.yeastType === 'dry' ? (language === 'fr' ? 'Levure Sèche' : 'Dry Yeast') : (language === 'fr' ? 'Levure Fraîche' : 'Fresh Yeast');
    const text = `🍕 Pizzeo - ${activePreset || 'Custom'}\n${t('nb_pizzas')}: ${calculator.numberOfPizzas} x ${calculator.doughWeightPerBall}g\nTotal: ${(calculations.totalDoughWeight/1000).toFixed(2)}kg\n\nIngrédients:\n- ${t('flour')}: ${(calculations.flourWeight).toFixed(0)}g\n- ${t('water')}: ${(calculations.waterWeight).toFixed(0)}g\n- ${t('salt')}: ${(calculations.saltWeight).toFixed(1)}g\n- ${yeastLabel}: ${(calculator.yeastType === 'dry' ? calculations.dryYeastWeight : calculations.freshYeastWeight).toFixed(2)}g\n\n${t('ideal_water')}: ${calculations.idealWaterTemp.toFixed(1)}°C\n${t('kneading')}: ${calculations.startTime}`;
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const msg = inputValue; 
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setInputValue(''); 
    setIsThinking(true); 
    setAuthError(null);
    
    try {
      const res = await gemini.askPizzeo(msg, { calculator, results: calculations }, language);
      setMessages(p => [...p, { role: 'ai', content: res }]);
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("403") || e?.message?.includes("entity was not found")) {
        setAuthError(t('auth_key_error'));
      } else {
        setMessages(p => [...p, { role: 'ai', content: language === 'fr' ? "Erreur de connexion. Veuillez réessayer." : "Connection error. Please try again." }]);
      }
    } finally { 
      setIsThinking(false); 
    }
  };

  const handleImagine = async () => {
    setAiPanelOpen(true);
    setIsGeneratingImage(true);
    setAuthError(null);
    
    try {
      const prompt = `Professional close-up, ${calculator.hydration}% hydration pizza, ${activePreset || 'artisan style'}.`;
      const img = await gemini.generatePizzaImage(prompt);
      if (img) {
        setMessages(p => [...p, { role: 'ai', content: language === 'fr' ? "Voici ma vision de votre pizza !" : "Here is my vision of your pizza!", image: img }]);
      }
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("403") || e?.message?.includes("entity was not found")) {
        setAuthError(t('auth_key_error'));
      } else if (e?.message === "IMAGE_GEN_FAILED_500") {
        setMessages(p => [...p, { role: 'ai', content: language === 'fr' ? "La génération d'image est temporairement indisponible ou nécessite une clé API payante." : "Image generation is temporarily unavailable or requires a paid API key." }]);
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleOpenSelectKey = async () => {
    const aiWindow = window as any;
    if (aiWindow.aistudio) {
      await aiWindow.aistudio.openSelectKey();
      setAuthError(null);
    }
  };

  // WhatsApp Support helper
  const getWhatsAppLink = () => {
    const phone = "2250555323890";
    const message = language === 'fr' 
      ? "Bonjour ! J'adore Pizzeo et j'aimerais soutenir le projet ou vous offrir un café ! ☕" 
      : "Hello! I love Pizzeo and would like to support the project or buy you a coffee! ☕";
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-sans selection:bg-orange-500/30 overflow-x-hidden ${
      calculator.theme === 'dark' ? 'bg-black text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse ${
          calculator.theme === 'dark' ? 'bg-orange-500/2' : 'bg-orange-500/5'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse ${
          calculator.theme === 'dark' ? 'bg-blue-500/2' : 'bg-blue-500/5'
        }`} />
      </div>

      <header className="pt-20 pb-16 px-4 text-center relative">
        <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
          <button 
            onClick={() => updateCalculator('theme', calculator.theme === 'dark' ? 'light' : 'dark')}
            className={`p-2.5 rounded-2xl transition-all border shadow-xl ${
              calculator.theme === 'dark' 
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-amber-400' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-amber-500'
            }`}
            title={calculator.theme === 'dark' ? 'Mode Jour' : 'Mode Nuit'}
          >
            {calculator.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={handleOpenSelectKey}
            className={`p-2.5 rounded-2xl transition-all border shadow-xl ${
              calculator.theme === 'dark' 
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800' 
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
            title={t('choose_key')}
          >
            <Key className="w-4 h-4 text-amber-500" />
          </button>
          
          <button 
            onClick={() => updateCalculator('language', language === 'fr' ? 'en' : 'fr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all border shadow-xl ${
              calculator.theme === 'dark' 
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800' 
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Languages className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'fr' ? 'English' : 'Français'}</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-8 group">
          <div 
            onClick={() => setAiPanelOpen(true)}
            className="w-28 h-28 rounded-[2.5rem] bg-slate-900 border-4 border-orange-500 flex items-center justify-center cursor-pointer shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all hover:scale-110"
          >
            <Pizza className="w-14 h-14 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter glow-text drop-shadow-2xl">Pizzeo</h1>
            <p className="text-[11px] font-black text-orange-400 tracking-[0.5em] uppercase opacity-90">{t('tagline')}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pb-32 space-y-20">
        {authError && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-3xl flex items-center justify-between text-xs font-bold text-amber-200 animate-in fade-in zoom-in">
            <div className="flex items-center gap-4"><Key className="w-5 h-5 text-amber-500" /> {authError}</div>
            <button onClick={handleOpenSelectKey} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors shadow-lg shadow-amber-500/20">{t('choose_key')}</button>
          </div>
        )}

        {/* Section Production */}
        <section className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black flex items-center gap-4 group">
              <span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20"><Factory className="w-5 h-5 text-orange-500" /></span>
              {t('production')}
            </h2>
            <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-950/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/50">
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('loss_3')}</span>
               <button 
                  onClick={() => updateCalculator('includeResidue', !calculator.includeResidue)}
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${calculator.includeResidue ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`}
               >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${calculator.includeResidue ? 'translate-x-6' : 'translate-x-0'}`} />
               </button>
            </div>
          </div>
          <Card theme={calculator.theme} className="p-10 space-y-12">
            <MainTabs theme={calculator.theme} value={activeScale} onValueChange={applyScale} options={PRODUCTION_SCALES.map(s => ({ id: s.id, label: language === 'fr' ? s.name : s.nameEn, icon: s.icon }))} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <PreciseControl theme={calculator.theme} label={t('nb_pizzas')} value={calculator.numberOfPizzas} min={1} max={1000} icon={<Pizza className="w-5 h-5" />} onChange={(v) => updateCalculator('numberOfPizzas', v)} />
              <PreciseControl theme={calculator.theme} label={t('ball_weight')} value={calculator.doughWeightPerBall} min={100} max={1200} step={5} icon={<Scale className="w-5 h-5" />} onChange={(v) => updateCalculator('doughWeightPerBall', v)} />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-10 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 text-center">
              <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{t('total_mass')}</p>
              <p className="text-6xl font-black text-orange-500 dark:text-orange-400 tabular-nums">{(calculations.totalDoughWeight/1000).toFixed(2)}<span className="text-3xl text-orange-500/50 ml-1">kg</span></p>
            </div>
          </Card>
        </section>

        {/* Section Formulation */}
        <section className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black flex items-center gap-4 group">
               <span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20"><UtensilsCrossed className="w-5 h-5 text-orange-500" /></span>
               {t('formulation')}
            </h2>
            <button 
              onClick={toggleYeastType}
              className="flex items-center bg-slate-100 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 text-[10px] font-black uppercase overflow-hidden"
            >
              <span className={`px-4 py-2 rounded-xl transition-all duration-300 ${calculator.yeastType === 'dry' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500'}`}>{t('yeast_dry')}</span>
              <span className={`px-4 py-2 rounded-xl transition-all duration-300 ${calculator.yeastType === 'fresh' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500'}`}>{t('yeast_fresh')}</span>
            </button>
          </div>
          <Card theme={calculator.theme} className="p-10 space-y-12">
            <div className="flex flex-wrap gap-4">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)} className={`px-6 py-3.5 rounded-2xl text-[11px] font-black border-2 transition-all ${activePreset === (language === 'fr' ? p.name : p.nameEn) ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-slate-200'}`}>
                  {language === 'fr' ? p.name : p.nameEn}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                <PreciseControl theme={calculator.theme} label={t('hydration')} value={calculator.hydration} min={50} max={95} step={0.5} unit="%" icon={<Droplets className="w-5 h-5" />} onChange={(v) => updateCalculator('hydration', v)} />
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="group flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 text-[11px] font-black uppercase text-slate-400 dark:text-slate-500">
                  <Settings className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  {showAdvanced ? t('hide_advanced') : t('advanced_options')}
                </button>
                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 animate-in fade-in duration-700">
                    <PreciseControl theme={calculator.theme} label={t('salt')} value={calculator.salt} min={0.5} max={5} step={0.1} unit="%" onChange={(v) => updateCalculator('salt', v)} />
                    <PreciseControl theme={calculator.theme} label={t('yeast')} value={calculator.yeast} min={0.01} max={5} step={0.01} unit="%" onChange={(v) => updateCalculator('yeast', v)} />
                  </div>
                )}
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-blue-500/10 dark:border-blue-500/20 space-y-8">
                <div className="flex items-center gap-3 text-[11px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest"><Thermometer className="w-5 h-5" /> {t('thermal_control')}</div>
                <PreciseControl theme={calculator.theme} label={t('flour_temp')} value={calculator.flourTemp} min={5} max={40} unit="°C" onChange={(v) => updateCalculator('flourTemp', v)} />
                <PreciseControl theme={calculator.theme} label={t('ambient_temp')} value={calculator.ambientTemp} min={5} max={45} unit="°C" onChange={(v) => updateCalculator('ambientTemp', v)} />
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                   <p className="text-[10px] font-black text-blue-500/50 uppercase mb-2 tracking-widest">{t('ideal_water')}</p>
                   <p className="text-5xl font-black text-blue-500 dark:text-blue-400">{calculations.idealWaterTemp.toFixed(1)}°C</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section Roadmap */}
        <section className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black flex items-center gap-4">
               <span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20"><Calculator className="w-5 h-5 text-orange-500" /></span>
               {t('roadmap')}
            </h2>
            <div className="flex gap-3">
              <button onClick={handleImagine} className={`flex items-center gap-2.5 px-6 py-3.5 border rounded-2xl text-[11px] font-black uppercase transition-all shadow-xl active:scale-95 text-orange-500 dark:text-orange-400 ${
                calculator.theme === 'dark' ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}>
                <Wand2 className="w-4 h-4" /> {t('visualize')}
              </button>
              <button onClick={copyRecipe} className="flex items-center gap-2.5 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 rounded-2xl text-[11px] font-black uppercase transition-all shadow-xl active:scale-95 text-white">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? t('copied') : t('export')}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card theme={calculator.theme} className="p-10 space-y-8 bg-slate-50 dark:bg-slate-900/30">
              <div className="p-8 bg-orange-500/10 rounded-[2rem] border border-orange-500/20 flex justify-between items-end">
                <div>
                  <p className="text-[11px] font-black text-orange-500 uppercase mb-2">{t('flour_force')}</p>
                  <p className="text-6xl font-black text-orange-500 dark:text-orange-400">{calculations.flourWeight.toFixed(0)}<span className="text-2xl ml-1 opacity-50">g</span></p>
                </div>
                <Badge theme={calculator.theme} variant="warning">{t('base_100')}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-slate-900/60 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3">{t('water')}</p>
                  <p className="text-3xl font-black text-blue-500 dark:text-blue-400">{calculations.waterWeight.toFixed(0)}<span className="text-lg opacity-50 ml-1">g</span></p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900/60 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3">{t('yeast')}</p>
                  <p className="text-3xl font-black text-amber-500 dark:text-amber-400">{(calculator.yeastType === 'dry' ? calculations.dryYeastWeight : calculations.freshYeastWeight).toFixed(2)}<span className="text-lg opacity-50 ml-1">g</span></p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900/60 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3">{t('salt')}</p>
                  <p className="text-3xl font-black text-slate-700 dark:text-slate-200">{calculations.saltWeight.toFixed(1)}<span className="text-lg opacity-50 ml-1">g</span></p>
                </div>
              </div>
            </Card>
            <Card theme={calculator.theme} className="p-10 bg-slate-50 dark:bg-slate-900/60 border-l-4 border-l-indigo-500/50">
               <div className="flex items-center justify-between mb-12">
                  <h4 className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase flex items-center gap-3"><Clock className="w-5 h-5" /> {t('planning')}</h4>
                  <input type="time" value={calculator.targetDinnerTime} onChange={(e) => updateCalculator('targetDinnerTime', e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black p-2 text-orange-500 dark:text-orange-400" />
               </div>
               <div className="space-y-10 relative ml-3">
                  <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-slate-200 dark:bg-slate-800" />
                  <div className="relative pl-10">
                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full bg-orange-500" />
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('kneading')}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100">{calculations.startTime}</p>
                  </div>
                  <div className="relative pl-10">
                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full bg-blue-500" />
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('shaping')}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100">{calculations.takeOutTime}</p>
                  </div>
                  <div className="relative pl-10">
                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full bg-green-500" />
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('baking')}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{calculator.targetDinnerTime}</p>
                  </div>
               </div>
            </Card>
          </div>
        </section>

        {/* Section Detailed Table */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black flex items-center gap-4">
               <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20"><UtensilsCrossed className="w-4 h-4 text-orange-500" /></span>
               {t('detailed_table')}
            </h2>
            <button 
              onClick={() => setShowDetailedTable(!showDetailedTable)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                calculator.theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {showDetailedTable ? t('hide') : t('show')}
            </button>
          </div>
          {showDetailedTable && (
            <Card theme={calculator.theme} className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{t('ingredient')}</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">%</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{t('quantity')}</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{t('note')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {calculations.ingredientsTable.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-700 dark:text-slate-200">{row.ingredient}</td>
                      <td className="px-8 py-5 font-bold text-slate-500 dark:text-slate-400 tabular-nums">{row.pourcentage}%</td>
                      <td className="px-8 py-5 font-black text-orange-500 dark:text-orange-400 tabular-nums">
                        {row.quantite.toFixed(row.quantite < 10 ? 2 : 1)}{row.ingredient.includes('Eau') || row.ingredient.includes('Water') ? ' ml' : ' g'}
                      </td>
                      <td className="px-8 py-5">
                        <Badge theme={calculator.theme} variant="secondary" className="text-[9px]">{row.note}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </section>

        {/* Section Calculation Info */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black flex items-center gap-4">
               <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><FlaskConical className="w-4 h-4 text-blue-500" /></span>
               {t('calc_info')}
            </h2>
            <button 
              onClick={() => setShowCalcInfo(!showCalcInfo)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                calculator.theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {showCalcInfo ? t('hide') : t('show')}
            </button>
          </div>
          {showCalcInfo && (
            <div className="space-y-8">
              <Card theme={calculator.theme} className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">📐 ÉTAPE 1 & 2: Données d'Entrée</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Nombre de Pizzas:</span> <span className="font-black">{calculator.numberOfPizzas}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Poids par Boule:</span> <span className="font-black">{calculator.doughWeightPerBall}g</span></div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800"><span className="text-slate-500">Poids Total Cible:</span> <span className="font-black text-orange-500">{calculator.numberOfPizzas} × {calculator.doughWeightPerBall} = {calculator.numberOfPizzas * calculator.doughWeightPerBall}g</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">📊 ÉTAPE 3 & 4: Ratios & Facteur</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Hydratation:</span> <span className="font-black">{calculator.hydration.toFixed(1)}% = {(calculator.hydration/100).toFixed(3)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Sel:</span> <span className="font-black">{calculator.salt.toFixed(1)}% = {(calculator.salt/100).toFixed(4)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Levure:</span> <span className="font-black">{calculator.yeast.toFixed(2)}% = {(calculator.yeast/100).toFixed(4)}</span></div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800 font-black text-blue-500"><span>Facteur Total:</span> <span>{calculations.facteur.toFixed(4)}</span></div>
                      <p className="text-[9px] text-slate-400 italic">facteur = 1 + hydratation + sel + levure</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">✅ ÉTAPE 5: Vérification Calculs</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Farine (poidsTotal / facteur):</span> <span className="font-black">{calculations.flourWeight.toFixed(2)}g</span></div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800 text-green-600 dark:text-green-500 font-bold">
                        <span>Vérification (% méthode):</span> 
                        <span>({(calculations.facteur * 100).toFixed(1)}% de {calculations.flourWeight.toFixed(0)}g) = {calculations.totalDoughWeight.toFixed(0)}g ✓</span>
                      </div>
                      <p className="text-[10px] font-black text-green-600 dark:text-green-500 uppercase tracking-tighter">✅ Les calculs correspondent exactement à la méthode du boulanger</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest px-2"><Zap className="w-4 h-4" /> 🔌 Format API/Export</div>
                <Card theme={calculator.theme} className="p-6 bg-slate-950 border-slate-800">
                  <pre className="text-[11px] font-mono text-blue-400 overflow-x-auto">
{`// Données prêtes pour export
[
${calculations.ingredientsTable.map(row => `  { ingredient: "${row.ingredient.replace(/^[^\s]+\s/, '')}", quantite: ${row.quantite.toFixed(2)}, note: "${row.note}" }`).join(',\n')}
]`}
                  </pre>
                </Card>
              </div>
            </div>
          )}
        </section>

        {/* WhatsApp Project Support Section */}
        <div className="flex justify-center pt-16">
          <a 
            href={getWhatsAppLink()} 
            target="_blank" 
            className={`group flex flex-col items-center gap-6 p-12 rounded-[3rem] border-2 transition-all duration-500 text-center max-w-lg w-full relative overflow-hidden ${
              calculator.theme === 'dark' 
                ? 'bg-slate-950/80 border-slate-800 shadow-none' 
                : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            <div className="absolute top-0 right-0 p-4">
               <Heart className="w-6 h-6 text-orange-500/30 group-hover:text-orange-500 transition-colors animate-pulse" />
            </div>
            <div className="flex gap-6 relative">
              <div className={`p-5 rounded-2xl group-hover:scale-110 transition-transform ${
                calculator.theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-500/10'
              }`}>
                <Gift className="w-12 h-12 text-orange-500 dark:text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]" />
              </div>
              <div className={`p-5 rounded-2xl group-hover:scale-110 transition-transform delay-75 ${
                calculator.theme === 'dark' ? 'bg-green-500/20' : 'bg-green-500/10'
              }`}>
                <Coffee className="w-12 h-12 text-green-600 dark:text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]" />
              </div>
            </div>
            <div className="space-y-3">
              <p className={`text-3xl font-black tracking-tight transition-colors ${
                calculator.theme === 'dark' ? 'text-slate-100 group-hover:text-orange-400' : 'text-slate-900 group-hover:text-orange-500'
              }`}>{t('discuss')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4">{t('support_note')}</p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest">
               <span>Pizzeo Project Support</span>
               <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            </div>
          </a>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-900 text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-600">
        {t('footer', { year: new Date().getFullYear() })}
      </footer>

      {/* Floating AI Button */}
      <div className="fixed bottom-10 right-10 z-[100]">
        <button 
          onClick={() => setAiPanelOpen(true)} 
          className="group w-20 h-20 bg-orange-500 text-white rounded-[2rem] shadow-xl flex items-center justify-center transition-all hover:scale-110"
        >
          <Sparkles className="w-9 h-9" />
        </button>
      </div>

      {/* AI Panel */}
      {aiPanelOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 dark:bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-slate-200 dark:border-slate-800">
            <div className="p-10 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center rotate-3 shadow-lg shadow-orange-500/20"><Pizza className="w-9 h-9 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-black uppercase text-slate-900 dark:text-white">{t('ai_title')}</h2>
                  <p className="text-[10px] text-green-600 dark:text-green-500 font-black uppercase tracking-widest">{t('ai_tagline')}</p>
                </div>
              </div>
              <button onClick={() => setAiPanelOpen(false)} className="p-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><X className="w-7 h-7" /></button>
            </div>

            <div ref={scrollRef} className="flex-1 p-10 overflow-y-auto space-y-10 no-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                  <Sparkles className="w-10 h-10 text-orange-500" />
                  <p className="text-[11px] font-black uppercase text-slate-900 dark:text-white">{t('ai_welcome')}</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] space-y-4`}>
                    <div className={`p-8 rounded-[2rem] text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'}`}>
                      {m.content}
                    </div>
                    {m.image && (
                      <div className="rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl max-w-sm">
                        <img src={m.image} alt="Pizza visualization" className="w-full aspect-square object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(isThinking || isGeneratingImage) && (
                <div className="flex justify-start items-center gap-4 animate-pulse">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{isGeneratingImage ? t('ai_generating_img') : t('ai_thinking')}</p>
                </div>
              )}
              {authError && (
                <div className="flex justify-center p-4">
                  <button onClick={handleOpenSelectKey} className="px-6 py-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 border border-amber-500/30 rounded-2xl text-[11px] font-black uppercase">
                    {t('choose_key')}
                  </button>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-3 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 focus-within:border-orange-500/50 shadow-inner">
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                  placeholder={t('ai_placeholder')} 
                  className="flex-1 bg-transparent border-none px-6 py-4 text-sm focus:outline-none text-slate-900 dark:text-white" 
                />
                <button onClick={handleSendMessage} disabled={!inputValue.trim() || isThinking} className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 shadow-lg shadow-orange-500/20">
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .glow-text { text-shadow: 0 0 40px rgba(249, 115, 22, 0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 28px; width: 28px;
          border-radius: 12px;
          background: #ffffff;
          border: 4px solid #f97316;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
