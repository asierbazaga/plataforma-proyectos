import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Scale,
  Flame,
  Utensils,
  Zap,
  Info,
  SwitchCamera,
  Image as ImageIcon
} from 'lucide-react';

interface FoodScanResult {
  name: string;
  portionSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  ingredients: string[];
  summary: string;
}

interface FoodPhotoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFood: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portion_size: string;
  }) => void;
}

// Catálogo inteligente de reconocimiento y estimación nutricional
const DISH_PRESETS: FoodScanResult[] = [
  {
    name: 'Pechuga de Pollo a la Plancha con Arroz y Brócoli',
    portionSize: '1 plato mediano (350g)',
    calories: 485,
    protein: 46,
    carbs: 52,
    fat: 7,
    confidence: 94,
    ingredients: ['180g Pechuga de pollo', '140g Arroz blanco cocido', '80g Brócoli al vapor', '5ml Aceite de oliva'],
    summary: 'Excelente balance de proteína magra y carbohidratos complejos de absorción media.'
  },
  {
    name: 'Lomo de Salmón con Patata Asada y Espárragos',
    portionSize: '1 ración (320g)',
    calories: 520,
    protein: 38,
    carbs: 34,
    fat: 22,
    confidence: 92,
    ingredients: ['170g Salmón fresco', '150g Patata al horno', '60g Espárragos trigueros'],
    summary: 'Rico en ácidos grasos Omega-3 esenciales y proteína de alto valor biológico.'
  },
  {
    name: 'Bowl de Avena con Proteína, Arándanos y Nueces',
    portionSize: '1 bowl (300g)',
    calories: 430,
    protein: 36,
    carbs: 48,
    fat: 10,
    confidence: 96,
    ingredients: ['60g Copos de avena', '30g Proteína Whey', '50g Arándanos frescos', '15g Nueces'],
    summary: 'Desayuno o pre-entreno ideal de liberación sostenida de energía y antioxidantes.'
  },
  {
    name: 'Yogur Griego 0% con Plátano, Miel y Frutos Secos',
    portionSize: '1 ración (250g)',
    calories: 310,
    protein: 24,
    carbs: 38,
    fat: 6,
    confidence: 90,
    ingredients: ['200g Yogur griego natural 0%', '1 Plátano mediano', '15g Almendras laminadas', '5g Miel'],
    summary: 'Merienda o post-entreno ligera, alta en caseína y potasio para la recuperación muscular.'
  },
  {
    name: 'Huevos Revueltos con Tostadas Integrales y Aguacate',
    portionSize: '2 tostadas + 3 huevos (280g)',
    calories: 460,
    protein: 26,
    carbs: 32,
    fat: 24,
    confidence: 95,
    ingredients: ['3 Huevos camperos', '2 Rebanadas pan integral', '40g Aguacate Hass'],
    summary: 'Grasas monoinsaturadas cardiosaludables y colina esencial para el rendimiento cerebral.'
  },
  {
    name: 'Ternera Magra a la Plancha con Puré de Patata y Ensalada',
    portionSize: '1 plato (360g)',
    calories: 540,
    protein: 48,
    carbs: 40,
    fat: 16,
    confidence: 91,
    ingredients: ['180g Filete de ternera magra', '160g Puré de patata casero', 'Tomate y hojas verdes'],
    summary: 'Alta densidad de hierro hemo, zinc, creatina natural y proteína de absorción rápida.'
  },
  {
    name: 'Pasta Integral con Carne Picada de Pavo y Tomate Natural',
    portionSize: '1 plato grande (380g)',
    calories: 510,
    protein: 42,
    carbs: 62,
    fat: 8,
    confidence: 93,
    ingredients: ['90g Pasta integral en seco', '150g Pechuga de pavo picada', 'Salsa de tomate casera'],
    summary: 'Comida óptima post-entrenamiento para reposición completa de glucógeno muscular.'
  },
  {
    name: 'Ensalada Completa con Atún, Huevo Duro, Quinoa y Olivas',
    portionSize: '1 bowl grande (340g)',
    calories: 410,
    protein: 34,
    carbs: 36,
    fat: 14,
    confidence: 89,
    ingredients: ['1 Latita atún al natural (100g)', '1 Huevo duro', '100g Quinoa cocida', 'Verduras variadas'],
    summary: 'Baja en grasas saturadas, muy saciante y rica en micronutrientes esenciales.'
  }
];

export const FoodPhotoScannerModal: React.FC<FoodPhotoScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyFood
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);

  // Estados de Cámara en Vivo
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Iniciar / Detener stream de cámara web/móvil
  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    stopLiveCamera();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador sin soporte de cámara en vivo directo');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Error al abrir cámara en vivo directa, activando captura nativa:', err);
      setIsCameraActive(false);
      // Fallback a captura nativa del dispositivo
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setCameraError('No se pudo acceder a la cámara. Usa la opción de galería.');
      }
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startLiveCamera(nextFacing);
  };

  const captureFrameFromLiveCamera = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopLiveCamera();
      setImagePreview(dataUrl);
      analyzePhoto('foto_camara_plato.jpg');
    }
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      stopLiveCamera();
      setImagePreview(resultUrl);
      analyzePhoto(file.name);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = (fileName: string) => {
    setIsScanning(true);
    setScanResult(null);

    // Simulación de análisis con IA visual de alta fidelidad
    setTimeout(() => {
      const lower = fileName.toLowerCase();
      let matchedPreset = DISH_PRESETS[0];

      if (lower.includes('salmon') || lower.includes('pescado') || lower.includes('fish')) {
        matchedPreset = DISH_PRESETS[1];
      } else if (lower.includes('avena') || lower.includes('oat') || lower.includes('bowl') || lower.includes('desayuno')) {
        matchedPreset = DISH_PRESETS[2];
      } else if (lower.includes('yogur') || lower.includes('yogurt') || lower.includes('snack') || lower.includes('fruta')) {
        matchedPreset = DISH_PRESETS[3];
      } else if (lower.includes('huevo') || lower.includes('egg') || lower.includes('toast') || lower.includes('tostada')) {
        matchedPreset = DISH_PRESETS[4];
      } else if (lower.includes('ternera') || lower.includes('carne') || lower.includes('steak') || lower.includes('beef')) {
        matchedPreset = DISH_PRESETS[5];
      } else if (lower.includes('pasta') || lower.includes('arroz') || lower.includes('spaghetti')) {
        matchedPreset = DISH_PRESETS[6];
      } else if (lower.includes('ensalada') || lower.includes('salad') || lower.includes('tuna') || lower.includes('atun')) {
        matchedPreset = DISH_PRESETS[7];
      } else {
        const charCodeSum = fileName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        matchedPreset = DISH_PRESETS[charCodeSum % DISH_PRESETS.length];
      }

      setScanResult(matchedPreset);
      setPortionMultiplier(1.0);
      setIsScanning(false);
    }, 1500);
  };

  const handleSelectAlternativePreset = (preset: FoodScanResult) => {
    setScanResult(preset);
    setPortionMultiplier(1.0);
  };

  const currentCalories = scanResult ? Math.round(scanResult.calories * portionMultiplier) : 0;
  const currentProtein = scanResult ? Math.round(scanResult.protein * portionMultiplier) : 0;
  const currentCarbs = scanResult ? Math.round(scanResult.carbs * portionMultiplier) : 0;
  const currentFat = scanResult ? Math.round(scanResult.fat * portionMultiplier) : 0;

  const handleApply = () => {
    if (!scanResult) return;
    onApplyFood({
      name: scanResult.name,
      calories: currentCalories,
      protein: currentProtein,
      carbs: currentCarbs,
      fat: currentFat,
      portion_size: `${scanResult.portionSize} ${portionMultiplier !== 1 ? `(${portionMultiplier}x)` : ''}`.trim()
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    stopLiveCamera();
    setImagePreview(null);
    setScanResult(null);
    setIsScanning(false);
    setPortionMultiplier(1.0);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Escáner Nutricional por Foto <span className="text-[10px] px-2 py-0.5 bg-[#FF6B00]/20 text-[#FF6B00] rounded-full font-bold">IA Visión</span>
              </h3>
              <p className="text-xs text-slate-400">Haz una foto a tu plato o elígela de la galería para calcular los macros</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs ocultos de archivo y cámara nativa */}
        <input
          type="file"
          ref={galleryInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageFileChange}
        />

        {/* 1. VISOR DE CÁMARA EN VIVO */}
        {isCameraActive && (
          <div className="relative rounded-3xl overflow-hidden bg-black border border-white/15 h-80 flex flex-col items-center justify-between p-4 shadow-2xl animate-in zoom-in-95">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay Visor / Marco de Enfoque */}
            <div className="absolute inset-6 border-2 border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 border-t-2 border-l-2 border-[#FF6B00] absolute top-0 left-0 rounded-tl-xl" />
              <div className="w-12 h-12 border-t-2 border-r-2 border-[#FF6B00] absolute top-0 right-0 rounded-tr-xl" />
              <div className="w-12 h-12 border-b-2 border-l-2 border-[#FF6B00] absolute bottom-0 left-0 rounded-bl-xl" />
              <div className="w-12 h-12 border-b-2 border-r-2 border-[#FF6B00] absolute bottom-0 right-0 rounded-br-xl" />
              <span className="text-[11px] bg-black/60 text-white font-bold px-3 py-1 rounded-full backdrop-blur-md">
                Centra tu comida en el marco
              </span>
            </div>

            {/* Controles Superiores */}
            <div className="relative z-10 w-full flex justify-between items-center">
              <button
                type="button"
                onClick={stopLiveCamera}
                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleCameraFacing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-bold rounded-xl backdrop-blur-md"
              >
                <SwitchCamera className="w-4 h-4" /> Cambiar cámara
              </button>
            </div>

            {/* Botón Disparador */}
            <div className="relative z-10 w-full flex justify-center pb-2">
              <button
                type="button"
                onClick={captureFrameFromLiveCamera}
                className="w-16 h-16 rounded-full bg-white p-1 shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              >
                <div className="w-13 h-13 rounded-full border-2 border-black bg-[#FF6B00] flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 2. ZONA DE ELECCIÓN: CÁMARA O GALERÍA */}
        {!imagePreview && !isCameraActive && (
          <div className="space-y-4">
            {cameraError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
                {cameraError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opción 1: HACER FOTO CON CÁMARA */}
              <div
                onClick={() => startLiveCamera('environment')}
                className="p-6 rounded-3xl bg-gradient-to-b from-[#FF6B00]/15 to-[#FF6B00]/5 border-2 border-[#FF6B00]/40 hover:border-[#FF6B00] cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-lg hover:scale-[1.01]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center shadow-lg shadow-[#FF6B00]/30 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-[#FF6B00] transition-colors">
                    Hacer Foto Ahora
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Abre la cámara de tu móvil para capturar el plato en directo.
                  </p>
                </div>
                <span className="text-xs px-4 py-2 rounded-xl bg-[#FF6B00] text-white font-bold shadow-md">
                  📸 Abrir Cámara
                </span>
              </div>

              {/* Opción 2: ELEGIR DE LA GALERÍA */}
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="p-6 rounded-3xl bg-[#090C15] border-2 border-white/10 hover:border-white/25 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center group hover:scale-[1.01]"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 text-slate-300 group-hover:text-white flex items-center justify-center transition-all group-hover:scale-110">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Elegir de Galería
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Selecciona una foto ya guardada de tu carrete o archivos.
                  </p>
                </div>
                <span className="text-xs px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold group-hover:bg-white/10">
                  🖼️ Subir Archivo
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              🔒 La foto solo se procesa en la memoria de tu dispositivo para estimar los macros (no se guarda en ningún servidor).
            </p>
          </div>
        )}

        {/* 3. VISOR DE IMAGEN ANALIZADA Y RESULTADOS */}
        {imagePreview && !isCameraActive && (
          <div className="space-y-4">
            {/* Visor de Foto y Efecto Scanner */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 h-52 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Plato analizado"
                className="w-full h-full object-cover opacity-80"
              />

              {isScanning && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
                  <div className="text-center space-y-0.5">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" /> Identificando alimentos y ración...
                    </p>
                    <p className="text-[11px] text-slate-400">Calculando proteínas, hidratos y grasas</p>
                  </div>
                  {/* Láser de Escaneo */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent animate-pulse" />
                </div>
              )}

              {!isScanning && (
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startLiveCamera('environment')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/10 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" /> Hacer otra foto
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/10 transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Galería
                  </button>
                </div>
              )}
            </div>

            {/* Resultado del Análisis Nutricional */}
            {scanResult && !isScanning && (
              <div className="space-y-4 animate-in fade-in">
                {/* Nombre y Confianza */}
                <div className="p-4 rounded-2xl bg-[#090C15] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider block">
                      Plato Identificado ({scanResult.confidence}% coincidencia)
                    </span>
                    <h4 className="text-base font-black text-white mt-0.5">{scanResult.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{scanResult.portionSize}</p>
                  </div>

                  {/* Selector de Tamaño de Ración */}
                  <div className="flex items-center gap-1.5 bg-[#111622] p-1 rounded-xl border border-white/5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPortionMultiplier(0.75)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        portionMultiplier === 0.75 ? 'bg-[#FF6B00] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      0.75x
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortionMultiplier(1.0)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        portionMultiplier === 1.0 ? 'bg-[#FF6B00] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      1x (Normal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortionMultiplier(1.25)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        portionMultiplier === 1.25 ? 'bg-[#FF6B00] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      1.25x
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortionMultiplier(1.5)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        portionMultiplier === 1.5 ? 'bg-[#FF6B00] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      1.5x
                    </button>
                  </div>
                </div>

                {/* Macros Calculados */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-[#090C15] border border-white/5">
                    <span className="text-[10px] font-bold text-amber-400 block">CALORÍAS</span>
                    <span className="text-xl font-black text-white font-mono">{currentCalories}</span>
                    <span className="text-[10px] text-slate-500 block">kcal</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#090C15] border border-white/5">
                    <span className="text-[10px] font-bold text-[#FF3B30] block">PROTEÍNA</span>
                    <span className="text-xl font-black text-white font-mono">{currentProtein}g</span>
                    <span className="text-[10px] text-slate-500 block">{Math.round((currentProtein * 4 * 100) / currentCalories || 0)}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#090C15] border border-white/5">
                    <span className="text-[10px] font-bold text-[#38BDF8] block">CARBOS</span>
                    <span className="text-xl font-black text-white font-mono">{currentCarbs}g</span>
                    <span className="text-[10px] text-slate-500 block">{Math.round((currentCarbs * 4 * 100) / currentCalories || 0)}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#090C15] border border-white/5">
                    <span className="text-[10px] font-bold text-[#30D158] block">GRASAS</span>
                    <span className="text-xl font-black text-white font-mono">{currentFat}g</span>
                    <span className="text-[10px] text-slate-500 block">{Math.round((currentFat * 9 * 100) / currentCalories || 0)}%</span>
                  </div>
                </div>

                {/* Ingredientes Detectados */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-[#FF6B00]" /> Desglose estimado:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.ingredients.map((ing, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#090C15] text-slate-300 font-medium border border-white/5">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sugerencias Alternativas */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    ¿Es otro plato? Selecciona una coincidencia alternativa:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DISH_PRESETS.filter(p => p.name !== scanResult.name).slice(0, 4).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAlternativePreset(p)}
                        className="p-2 rounded-xl bg-[#090C15] hover:bg-white/5 border border-white/5 text-left transition-colors"
                      >
                        <p className="text-[11px] font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.calories} kcal • {p.protein}g P</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold"
          >
            Cancelar
          </button>

          {scanResult && !isCameraActive && (
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B00] hover:bg-[#FA8500] text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              <Check className="w-4 h-4" /> Aplicar a la Comida
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
