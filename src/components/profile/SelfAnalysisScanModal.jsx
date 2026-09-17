import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  Scan,
  User,
  Palette,
  Eye,
  Ruler,
  Check,
  RefreshCw,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { profileApi } from '../../api/profileApi';

export const SelfAnalysisScanModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useWardrobe();

  const [scanStep, setScanStep] = useState('idle'); // 'idle' | 'scanning' | 'results'
  const [photoPreview, setPhotoPreview] = useState(user?.avatar || null);
  const [scanError, setScanError] = useState(null);

  const [physicalData, setPhysicalData] = useState({
    faceShape: user?.physicalTraits?.faceShape || user?.physicalAnalysis?.faceShape || 'Oval',
    skinTone: user?.physicalTraits?.skinUndertone || user?.physicalAnalysis?.skinTone || 'Warm Golden',
    skinUndertone: user?.physicalTraits?.skinUndertone || 'Warm Golden',
    skinToneHex: user?.physicalAnalysis?.skinToneHex || '#D2A374',
    colorSeason: user?.physicalTraits?.colorSeason || user?.physicalAnalysis?.colorSeason || 'Deep Autumn',
    bodyType: user?.physicalTraits?.bodySilhouette || user?.physicalAnalysis?.bodyType || 'Athletic V-Taper',
    contrastLevel: user?.physicalAnalysis?.contrastLevel || 'Medium-High Contrast',
    eyewearSuitability: user?.physicalTraits?.calibrationNotes || 'Square, Hexagonal, Wayfarer, Aviator frames balance your proportions',
    necklineSuitability: 'Camp collars, classic crew necks, and open cuban plackets complement jawline',
    fitRecommendation: 'Relaxed drop-shoulder tops with tapered bottoms create balanced vertical lines'
  });

  const faceShapes = [
    { name: 'Oval', desc: 'Balanced proportions; suits almost all eyewear and collars.' },
    { name: 'Square', desc: 'Strong jawline; suits round/oval eyewear & softer collar lines.' },
    { name: 'Round', desc: 'Softer curves; suits angular, rectangular, and structured eyewear.' },
    { name: 'Heart', desc: 'Broader forehead; suits bottom-heavy frames & open necklines.' },
    { name: 'Diamond', desc: 'Prominent cheekbones; suits rimless and cat-eye/oval styles.' },
    { name: 'Oblong', desc: 'Longer vertical proportions; suits wide horizontal frames.' }
  ];

  const skinUndertones = [
    { name: 'Warm Golden', hex: '#D2A374', season: 'Warm Autumn (Olive, Tan, Earthy tones)' },
    { name: 'Cool Rosy', hex: '#F3C5B5', season: 'Cool Winter / Summer (Navy, Slate, Charcoal)' },
    { name: 'Neutral', hex: '#E7B69E', season: 'Neutral All-Season (Black, White, Cream)' },
    { name: 'Olive', hex: '#BCA882', season: 'Warm Olive (Earthy Brown, Terracotta, Forest)' },
    { name: 'Deep Warm', hex: '#8D5524', season: 'Deep Autumn (Burgundy, Forest Green, Gold)' }
  ];

  const bodyTypes = [
    { name: 'Athletic V-Taper', desc: 'Broad chest/shoulders, slim waist. Best in relaxed structured fits.' },
    { name: 'Lean Rectangle', desc: 'Even shoulder-to-hip width. Best in layered outerwear & textured fabrics.' },
    { name: 'Hourglass', desc: 'Balanced chest & hips with defined waistline.' },
    { name: 'Pear/Triangle', desc: 'Wider hips and thighs. Best in structured shoulders & darker bottoms.' },
    { name: 'Inverted Triangle', desc: 'Broad shoulders tapering sharply to hips.' },
    { name: 'Oval/Apple', desc: 'Fuller midsection. Best in vertical lines and fluid tailoring.' }
  ];

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target.result);
        setScanError(null);
        startScan(ev.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startScan = async (img = photoPreview) => {
    if (!img) {
      setScanError('Please select or upload a selfie photo first.');
      return;
    }
    setScanStep('scanning');
    setScanError(null);
    try {
      const liveResult = await profileApi.scanFaceBody(img);
      if (liveResult) {
        const traits = liveResult.physicalTraits || liveResult.detectedAnalysis || liveResult;
        const analysis = liveResult.detectedAnalysis || traits;

        setPhysicalData(prev => ({
          ...prev,
          faceShape: traits.faceShape || prev.faceShape,
          skinTone: traits.skinUndertone || prev.skinTone,
          skinUndertone: traits.skinUndertone || prev.skinUndertone,
          skinToneHex: analysis.recommendedPalette?.[0] || prev.skinToneHex,
          colorSeason: traits.colorSeason || prev.colorSeason,
          bodyType: traits.bodySilhouette || traits.bodyType || prev.bodyType,
          eyewearSuitability: traits.calibrationNotes || traits.stylingNotes || prev.eyewearSuitability,
          fitRecommendation: traits.fitRecommendation || prev.fitRecommendation
        }));

        if (liveResult.avatar) {
          setPhotoPreview(liveResult.avatar);
        }

        if (liveResult.user) {
          await updateProfile(liveResult.user);
        }

        setScanStep('results');
        showToast('Face, Complexion & Silhouette calibrated with AI Vision!', 'success');
      }
    } catch (err) {
      const msg = err.message || 'No human face detected. Please upload a clear selfie photo.';
      setScanError(msg);
      setScanStep('idle');
      showToast(msg, 'error');
    }
  };

  const handleSaveScan = async () => {
    await updateProfile({
      avatar: photoPreview,
      physicalTraits: {
        faceShape: physicalData.faceShape,
        skinUndertone: physicalData.skinUndertone,
        colorSeason: physicalData.colorSeason,
        bodySilhouette: physicalData.bodyType,
        calibrationNotes: physicalData.eyewearSuitability,
        calibratedAt: new Date()
      },
      physicalAnalysis: {
        photoUploaded: true,
        ...physicalData
      }
    });
    showToast('Your calibrated Face, Complexion & Silhouette are saved!', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Face, Complexion & Body Calibration" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Intro */}
        <div>
          <p className="text-xs text-slate-500 leading-relaxed">
            StyleSync analyzes your <strong>Face Shape</strong>, <strong>Skin Undertone</strong>, and <strong>Silhouette</strong> to determine whether clothes, shoes, goggles, and colors will genuinely flatter you before purchasing.
          </p>
        </div>

        {scanError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Step 1: Upload or Scan Photo */}
        {scanStep === 'idle' && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 relative group">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Selfie" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <Camera className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold">No photo selected</p>
                      <p className="text-[10px] text-slate-400">Upload a selfie below</p>
                    </div>
                  )}
                  {photoPreview && (
                    <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                      <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                        Ready to Calibrate
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-7 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">1. Provide a Selfie or Portrait Photo</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload a well-lit photo showing your face and shoulders so StyleSync AI can calibrate your jawline geometry and natural undertone palette.
                </p>

                <label className="flex items-center justify-center gap-2 p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-2xl cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>Upload Your Photo / Selfie</span>
                  <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  disabled={!photoPreview}
                  onClick={() => startScan()}
                  className={`w-full py-3 text-white text-xs font-bold rounded-xl shadow-subtle flex items-center justify-center gap-2 transition-all ${
                    photoPreview ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer active:scale-[0.99]' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Scan className="w-4 h-4 text-emerald-400" />
                  <span>Run AI Body & Face Calibration</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Scanning Animation */}
        {scanStep === 'scanning' && (
          <div className="py-12 text-center space-y-6 animate-fade-in">
            <div className="relative w-32 h-32 mx-auto rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-card bg-slate-100 flex items-center justify-center">
              {photoPreview && <img src={photoPreview} alt="Scanning" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-emerald-500/15 animate-pulse" />
              <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_8px_#10B981] animate-bounce" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">AI Vision Engine Calibrating...</h4>
              <p className="text-xs text-slate-500 mt-1">
                Checking face geometry, skin undertone spectrum, and silhouette proportions.
              </p>
            </div>

            <div className="flex justify-center gap-2 text-[11px] font-semibold text-emerald-700">
              <span className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 animate-pulse">
                Analyzing undertone
              </span>
              <span className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 animate-pulse">
                Classifying season
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Calibrated Results */}
        {scanStep === 'results' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950">
                <span className="font-bold block mb-0.5">Physical Calibration Complete</span>
                <span>
                  Our AI Vision Engine has identified your facial proportions and natural undertone. You can review or manually adjust the detected traits below.
                </span>
              </div>
            </div>

            {/* Trait 1: Face Shape */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Detected Face Shape</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {faceShapes.map((shape) => (
                  <button
                    key={shape.name}
                    type="button"
                    onClick={() => setPhysicalData({ ...physicalData, faceShape: shape.name })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      physicalData.faceShape.toLowerCase().includes(shape.name.toLowerCase())
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{shape.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{shape.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Trait 2: Skin Undertone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span>Skin Undertone & Color Season</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {skinUndertones.map((tone) => (
                  <button
                    key={tone.name}
                    type="button"
                    onClick={() =>
                      setPhysicalData({
                        ...physicalData,
                        skinUndertone: tone.name,
                        skinTone: tone.name,
                        skinToneHex: tone.hex
                      })
                    }
                    className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                      physicalData.skinUndertone.toLowerCase().includes(tone.name.toLowerCase())
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: tone.hex }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">{tone.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{tone.season}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trait 3: Body Silhouette */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-slate-500" />
                <span>Body Silhouette / Build</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bodyTypes.map((type) => (
                  <button
                    key={type.name}
                    type="button"
                    onClick={() => setPhysicalData({ ...physicalData, bodyType: type.name })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      physicalData.bodyType.toLowerCase().includes(type.name.toLowerCase().replace('/', ' '))
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{type.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Notes */}
            {physicalData.eyewearSuitability && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">AI Styling Recommendation:</span>
                <span>{physicalData.eyewearSuitability}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setScanStep('idle')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rescan with Another Photo</span>
              </button>

              <button
                type="button"
                onClick={handleSaveScan}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Save & Activate Traits</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
