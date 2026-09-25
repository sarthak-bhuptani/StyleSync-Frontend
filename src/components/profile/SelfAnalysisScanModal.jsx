import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  User,
  Palette,
  Eye,
  Ruler,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Sliders
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
    colorSeason: user?.physicalTraits?.colorSeason || user?.physicalAnalysis?.colorSeason || 'Warm Autumn',
    bodyType: user?.physicalTraits?.bodySilhouette || user?.physicalAnalysis?.bodyType || 'Athletic',
    eyewearSuitability: user?.physicalTraits?.calibrationNotes || 'Square, Hexagonal, and Aviator frames balance your proportions',
    necklineSuitability: 'Camp collars and open plackets complement jawline',
    fitRecommendation: 'Relaxed drop-shoulder tops with tapered bottoms create balanced lines'
  });

  const faceShapes = ['Oval', 'Square', 'Round', 'Heart', 'Diamond', 'Oblong'];

  const skinUndertones = [
    { name: 'Warm Golden', hex: '#D2A374', season: 'Warm Autumn' },
    { name: 'Cool Rosy', hex: '#F3C5B5', season: 'Cool Winter' },
    { name: 'Warm Olive', hex: '#BCA882', season: 'Deep Autumn' },
    { name: 'Deep Warm', hex: '#8D5524', season: 'Warm Autumn' },
    { name: 'Neutral', hex: '#E7B69E', season: 'Universal' }
  ];

  const bodyTypes = ['Athletic', 'Lean', 'Classic', 'Structured', 'Relaxed'];

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target.result);
        setScanError(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const [scanProgress, setScanProgress] = useState(15);
  const [scanPhaseText, setScanPhaseText] = useState('Reading complexion & undertone temperature...');

  const startScan = async (img = photoPreview) => {
    if (!img) {
      setScanError('Please select or upload a portrait photo first.');
      return;
    }
    setScanStep('scanning');
    setScanError(null);
    setScanProgress(20);
    setScanPhaseText('Reading complexion & undertone temperature...');

    try {
      // Step 1: Trigger scan API
      const apiPromise = profileApi.scanFaceBody(img);

      // Smooth step-by-step progress timer sequence
      await new Promise(r => setTimeout(r, 650));
      setScanProgress(55);
      setScanPhaseText('Mapping facial symmetry & jawline structure...');

      await new Promise(r => setTimeout(r, 750));
      setScanProgress(85);
      setScanPhaseText('Curating flattering seasonal color palette...');

      const liveResult = await apiPromise;
      
      await new Promise(r => setTimeout(r, 500));
      setScanProgress(100);

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
        showToast('Color palette & traits analyzed!', 'success');
      }
    } catch (err) {
      const msg = err.message || 'Could not analyze photo. Please upload a clear portrait.';
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
    showToast('Personal style profile saved!', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Personal Color & Style Profile" maxWidth="max-w-lg">
      <div className="space-y-4 animate-fade-in text-slate-800">
        
        {scanError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Step 1: Upload / Ready */}
        {scanStep === 'idle' && (
          <div className="text-center space-y-4 py-1">
            
            {/* Compact Circular Preview */}
            <div className="relative w-28 h-28 mx-auto">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-slate-200 bg-slate-100 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Portrait preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-4 text-slate-400 text-center">
                    <Camera className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                    <span className="text-[10px] font-semibold">No photo</span>
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">Personal Color & Proportions</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Add a portrait photo to find your flattering season colors, undertone warmth, and frame pairings.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={!photoPreview}
                onClick={() => startScan()}
                className={`w-full py-2.5 text-white text-xs font-bold rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all ${
                  photoPreview ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer active:scale-98' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Find My Best Colors</span>
              </button>

              <label className="text-xs font-semibold text-slate-600 hover:text-slate-900 py-1 cursor-pointer text-center transition-colors">
                <span>Upload a different photo</span>
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Styling in Progress */}
        {scanStep === 'scanning' && (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            
            {/* Viewfinder Circle with Scanner Laser Sweep */}
            <div className="relative w-28 h-28 mx-auto">
              {/* Corner brackets */}
              <div className="absolute -inset-1.5 border border-dashed border-slate-300 rounded-full animate-spin [animation-duration:12s]" />
              
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-900 shadow-md relative bg-slate-100 flex items-center justify-center">
                {photoPreview && <img src={photoPreview} alt="Analyzing" className="w-full h-full object-cover" />}
                
                {/* Gentle scanning laser line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-scan-sweep pointer-events-none" />
                <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
              </div>
            </div>

            {/* Title & Live Status */}
            <div className="space-y-1.5 max-w-xs mx-auto">
              <h4 className="text-sm font-extrabold text-slate-900">Analyzing Your Personal Palette</h4>
              <p className="text-xs text-amber-700 font-medium animate-pulse min-h-[18px]">
                {scanPhaseText}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-xs mx-auto space-y-1.5">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
                <span>Skin & Undertone</span>
                <span>Proportions</span>
                <span>Palette</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Calibrated Results Summary */}
        {scanStep === 'results' && (
          <div className="space-y-3.5 animate-fade-in text-xs">
            
            {/* Header pill */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-xs">Calibration Complete</p>
                <p className="text-[11px] text-slate-600">Review or fine-tune your detected physical traits below.</p>
              </div>
            </div>

            {/* Trait 1: Face Shape */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Face Shape</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {faceShapes.map((shape) => {
                  const isSelected = physicalData.faceShape.toLowerCase() === shape.toLowerCase();
                  return (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setPhysicalData({ ...physicalData, faceShape: shape })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {shape}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trait 2: Skin Undertone */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span>Skin Undertone & Season</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {skinUndertones.map((tone) => {
                  const isSelected = physicalData.skinUndertone.toLowerCase() === tone.name.toLowerCase();
                  return (
                    <button
                      key={tone.name}
                      type="button"
                      onClick={() =>
                        setPhysicalData({
                          ...physicalData,
                          skinUndertone: tone.name,
                          skinTone: tone.name,
                          skinToneHex: tone.hex,
                          colorSeason: tone.season
                        })
                      }
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: tone.hex }} />
                      <span>{tone.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trait 3: Silhouette */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-slate-400" />
                <span>Body Build</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {bodyTypes.map((type) => {
                  const isSelected = physicalData.bodyType.toLowerCase() === type.toLowerCase();
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPhysicalData({ ...physicalData, bodyType: type })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stylist Recommendation Tip */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              <strong className="text-slate-900">Styling Guidance:</strong> {physicalData.eyewearSuitability}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => setScanStep('idle')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer py-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rescan</span>
              </button>

              <button
                type="button"
                onClick={handleSaveScan}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save to Style Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SelfAnalysisScanModal;
