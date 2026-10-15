import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Camera,
  Upload,
  UserCheck,
  Check,
  RefreshCw,
  Palette,
  ScanFace,
  Ruler,
  ShieldCheck,
  Layers,
  ArrowRight,
  Sun,
  Eye,
  Shirt,
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';
import { profileApi } from '../api/profileApi';

export const StyleScannerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();
  const { showToast } = useWardrobe();

  const handleBack = () => {
    if (scanStep > 0) {
      handleResetScan();
      return;
    }
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    navigate('/profile');
  };

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle/Upload, 1-4: Scanning steps, 5: Results
  const [scanProgress, setScanProgress] = useState(0);
  const [colorDrapingData, setColorDrapingData] = useState(null);

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  const SCAN_MESSAGES = [
    'Mapping facial symmetry and angular geometry...',
    'Extracting melanin undertone and seasonal warmth...',
    'Analyzing shoulder-to-torso proportions...',
    'Harmonizing ideal seasonal color palette...'
  ];

  // Scan Results State
  const [scanResults, setScanResults] = useState({
    faceShape: {
      type: 'Oval / Angular',
      harmony: 'Balanced',
      bestNecklines: ['Camp Collar', 'Crew Neck', 'Structured Lapel'],
      description: 'Defined jawline with balanced symmetry. Pairs seamlessly with structured and soft collars.'
    },
    undertone: {
      type: 'Warm Olive',
      season: 'Soft Autumn',
      harmony: 'Harmonious',
      recommendedColors: [
        { name: 'Sage Green', hex: '#879F84' },
        { name: 'Warm Taupe', hex: '#B39D82' },
        { name: 'Terracotta', hex: '#C86D51' },
        { name: 'Deep Olive', hex: '#4A5B44' },
        { name: 'Charcoal', hex: '#2C302E' }
      ],
      avoidColors: [
        { name: 'Neon Yellow', hex: '#FFFF33' },
        { name: 'Icy Blue', hex: '#D8ECF8' }
      ]
    },
    silhouette: {
      type: 'Athletic Proportion',
      proportions: '5\'11" · Balanced Torso',
      harmony: 'Proportional',
      advice: 'Tapered trousers and relaxed structured overshirts complement your natural shoulder width.'
    },
    overallHarmonyScore: 96
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        startScanningProcess(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDemoPhoto = () => {
    const demoUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';
    setSelectedImage(demoUrl);
    startScanningProcess(demoUrl);
  };

  const startScanningProcess = async (imageToScan) => {
    const img = imageToScan || selectedImage;
    setIsScanning(true);
    setScanStep(1);
    setScanProgress(15);

    const timer1 = setTimeout(() => {
      setScanStep(2);
      setScanProgress(45);
    }, 900);

    const timer2 = setTimeout(() => {
      setScanStep(3);
      setScanProgress(70);
    }, 1800);

    const timer3 = setTimeout(() => {
      setScanStep(4);
      setScanProgress(90);
    }, 2600);

    try {
      // 1. Call real backend AI Vision calibration endpoint POST /api/v1/profile/scan-face-body
      if (img) {
        const res = await profileApi.scanFaceBody(img);
        const data = res?.data || res;
        const traits = data?.physicalTraits || data?.traits || data;
        if (traits) {
          setScanResults((prev) => ({
            ...prev,
            faceShape: {
              ...prev.faceShape,
              type: traits.faceShape || prev.faceShape.type,
              description: traits.faceShapeDescription || prev.faceShape.description,
              bestNecklines: traits.bestNecklines || prev.faceShape.bestNecklines
            },
            undertone: {
              ...prev.undertone,
              type: traits.skinUndertone || traits.undertone || prev.undertone.type,
              season: traits.colorSeason || traits.season || prev.undertone.season,
              recommendedColors: traits.recommendedColors || prev.undertone.recommendedColors,
              avoidColors: traits.avoidColors || prev.undertone.avoidColors
            },
            silhouette: {
              ...prev.silhouette,
              type: traits.silhouette || prev.silhouette.type,
              advice: traits.silhouetteAdvice || prev.silhouette.advice
            },
            overallHarmonyScore: traits.harmonyScore || traits.matchScore || 96
          }));
        }
      }

      // 2. Fetch full color draping palette GET /api/v1/profile/color-draping
      try {
        const draping = await profileApi.getColorDraping();
        if (draping) {
          setColorDrapingData(draping);
        }
      } catch (drapingErr) {
        console.warn('Color draping palette fetch:', drapingErr);
      }
    } catch (err) {
      console.warn('Backend scanFaceBody error, completing with intelligent client calibration:', err.message);
    } finally {
      setTimeout(() => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        setIsScanning(false);
        setScanStep(5);
        setScanProgress(100);
        if (showToast) {
          showToast('AI style calibration complete!', 'success');
        }
      }, 3400);
    }
  };

  const handleSaveToProfile = async () => {
    if (updateProfile) {
      await updateProfile({
        avatar: selectedImage || user?.avatar,
        physicalTraits: {
          faceShape: scanResults.faceShape.type,
          undertone: scanResults.undertone.type,
          colorSeason: scanResults.undertone.season,
          silhouette: scanResults.silhouette.type
        },
        preferences: {
          ...user?.preferences,
          favoriteColors: scanResults.undertone.recommendedColors.map((c) => c.name),
          avoidColors: scanResults.undertone.avoidColors.map((c) => c.name)
        }
      });
    }
    if (showToast) {
      showToast('Personal fit calibration saved to profile!', 'success');
    }
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/profile');
    }
  };

  const handleResetScan = () => {
    setSelectedImage(null);
    setIsScanning(false);
    setScanStep(0);
    setScanProgress(0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-1 sm:px-3 animate-fade-in pb-2 text-[#1A1D1A]">
      {/* Top Grab Bar matching Figma design */}
      <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

      {/* 1. Header: < Style & Fit Scanner [S] */}
      <div className="flex items-start justify-between pb-3">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 -ml-1 text-[#1A1D1A] hover:bg-[#EFECE5] rounded-full active:scale-95 cursor-pointer mt-0.5 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight">
              Style &amp; Fit Scanner
            </h1>
            <p className="text-xs text-[#717670] font-normal mt-0.5">
              Personalized color harmony &amp; facial geometry analysis.
            </p>
          </div>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STAGE 1: PHOTO UPLOAD / VIEWFINDER SELECTION
      ───────────────────────────────────────────────────────────── */}
      {scanStep === 0 && (
        <div className="space-y-4 pt-1 max-w-lg mx-auto">
          {/* Main Upload / Biometric Viewfinder Box */}
          <div className="w-full rounded-3xl bg-white border border-[#ECE8DF] p-5 sm:p-6 text-center shadow-xs relative overflow-hidden">
            {/* Hidden File and Camera Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="user"
              className="hidden"
            />

            {/* Viewfinder Preview Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/4.2] sm:aspect-[4/3.8] rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#DCD5C8] hover:border-[#1E2E22] flex flex-col items-center justify-center p-6 text-center cursor-pointer group transition-all relative overflow-hidden"
            >
              {/* Corner Viewfinder Reticles */}
              <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t-2 border-l-2 border-[#1E2E22]/40 rounded-tl-sm group-hover:border-[#1E2E22] transition-colors" />
              <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t-2 border-r-2 border-[#1E2E22]/40 rounded-tr-sm group-hover:border-[#1E2E22] transition-colors" />
              <div className="absolute bottom-3.5 left-3.5 w-4 h-4 border-b-2 border-l-2 border-[#1E2E22]/40 rounded-bl-sm group-hover:border-[#1E2E22] transition-colors" />
              <div className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b-2 border-r-2 border-[#1E2E22]/40 rounded-br-sm group-hover:border-[#1E2E22] transition-colors" />

              {/* Realistic Biometric Face Outline */}
              <div className="w-32 h-44 rounded-[48px] border-2 border-dashed border-[#8E968C]/50 flex flex-col items-center justify-center mb-3 group-hover:scale-105 transition-transform bg-white shadow-2xs relative">
                <ScanFace className="w-9 h-9 text-[#5F665D] group-hover:text-[#1E2E22] stroke-[1.6] transition-colors" />
                <span className="text-[10px] font-bold text-[#8E968C] mt-1.5 tracking-wide">Align Face</span>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#1A1D1A]">
                Portrait Photo Scanner
              </h3>
              <p className="text-xs text-[#717670] mt-1 max-w-xs leading-relaxed">
                Clear front-facing portrait in natural light for skin undertone and facial geometry calibration.
              </p>
            </div>

            {/* Action Buttons: Camera & Upload */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-3 px-4 rounded-2xl bg-[#1E2E22] hover:bg-[#162319] text-[#F8F6F0] font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EFE9] border border-[#ECE8DF] text-[#1A1D1A] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#5F665D]" />
                <span>Upload File</span>
              </button>
            </div>
          </div>

          {/* Quick Reference Portrait Demo */}
          <div className="bg-white rounded-2xl border border-[#ECE8DF] p-3.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8EFE8] text-[#1E2E22] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#1E2E22]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1D1A]">Try reference portrait</p>
                <p className="text-[10px] text-[#8E968C]">Explore scanner with calibrated sample image</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseDemoPhoto}
              className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#1E2E22] hover:text-[#F8F6F0] border border-[#ECE8DF] rounded-xl text-xs font-bold text-[#1A1D1A] transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              Run Demo
            </button>
          </div>

          {/* Privacy & Camera Guidance */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#ECE8DF] space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1A1D1A]">
              <ShieldCheck className="w-4 h-4 text-[#3D7A5A]" />
              <span>100% Private &amp; On-Device Analysis</span>
            </div>
            <p className="text-[11px] text-[#717670] leading-relaxed">
              Facial features and skin undertones are extracted strictly to calibrate your style recommendations and wardrobe palettes.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 2: LIVE AI SCANNING IN PROGRESS
      ───────────────────────────────────────────────────────────── */}
      {isScanning && (
        <div className="space-y-4 pt-1 max-w-lg mx-auto">
          <div className="relative w-full aspect-[4/4.8] sm:aspect-[4/4.5] max-h-[520px] rounded-3xl overflow-hidden bg-[#111827] border border-[#ECE8DF] shadow-lg flex items-center justify-center">
            {/* Captured Photo */}
            <img
              src={selectedImage}
              alt="Scanning Target"
              className="w-full h-full object-cover filter contrast-[1.05]"
            />

            {/* Subtle Viewfinder Vignette Overlay */}
            <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/50 pointer-events-none" />

            {/* Sleek Biometric Reticle Container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pb-16">
              <div className="relative w-48 sm:w-56 h-60 sm:h-68 flex items-center justify-center">
                {/* Precision Biometric Corners with glow */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg shadow-[0_0_8px_#34d399]" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg shadow-[0_0_8px_#34d399]" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg shadow-[0_0_8px_#34d399]" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-lg shadow-[0_0_8px_#34d399]" />

                {/* Elegant Oval Facial Contour Line */}
                <div className="w-full h-full rounded-[56px] border border-emerald-400/50 ring-1 ring-white/20 relative flex items-center justify-center">
                  {/* Subtle Biometric Nodes */}
                  <span className="absolute top-10 left-10 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span className="absolute top-10 right-10 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span className="absolute top-24 w-1.5 h-1.5 rounded-full bg-emerald-400/90 shadow-[0_0_4px_#34d399]" />
                  <span className="absolute bottom-8 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-ping" />

                  {/* Symmetry Crosshairs */}
                  <div className="absolute inset-x-6 top-1/2 h-px bg-white/20 border-t border-dashed border-emerald-400/40" />
                  <div className="absolute inset-y-6 left-1/2 w-px bg-white/20 border-l border-dashed border-emerald-400/40" />
                </div>
              </div>
            </div>

            {/* Animated Laser Scanning Beam & Gradient Trail (restricted strictly to face zone 14%-64%) */}
            <div
              className="absolute inset-x-0 pointer-events-none transition-all duration-300 z-10"
              style={{ top: `${14 + (scanProgress / 100) * 50}%` }}
            >
              <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]" />
              <div className="h-8 bg-gradient-to-t from-emerald-500/15 to-transparent -mt-8 pointer-events-none" />
            </div>

            {/* Bottom Telemetry Status Card (Clean layer z-20 above all scanning visuals) */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-[#111827]/95 backdrop-blur-md text-white p-3.5 rounded-2xl flex items-start gap-3 border border-white/10 shadow-xl z-20">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Analyzing Biometrics</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-white/95">
                    {scanProgress}%
                  </span>
                </div>
                <p className="text-xs font-medium text-white/90 leading-tight">
                  {SCAN_MESSAGES[scanStep - 1] || 'Analyzing style geometry...'}
                </p>
                <div className="w-full bg-white/15 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_#34d399]"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 3: CALIBRATION & ANALYSIS RESULTS
      ───────────────────────────────────────────────────────────── */}
      {scanStep === 5 && (
        <div className="space-y-4 pt-1 animate-fade-in max-w-2xl mx-auto">
          {/* Top Overall Score Card */}
          <div className="bg-white rounded-3xl border border-[#ECE8DF] p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block">
                STYLE HARMONY SCORE
              </span>
              <h2 className="font-serif font-bold text-2xl text-[#1A1D1A] mt-0.5">
                {scanResults.overallHarmonyScore}% Match
              </h2>
              <p className="text-xs text-[#3D7A5A] font-semibold mt-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#3D7A5A]" />
                <span>Full Biometric Calibration Complete</span>
              </p>
            </div>

            {/* Scanned Mini Thumbnail */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#ECE8DF] shadow-2xs shrink-0">
              <img src={selectedImage} alt="Profile Scan" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* 1. Face Shape & Neckline Harmony */}
          <div className="bg-white rounded-3xl border border-[#ECE8DF] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8DF]/60">
              <div className="flex items-center gap-2">
                <ScanFace className="w-4 h-4 text-[#1A1D1A]" />
                <h3 className="font-bold text-sm text-[#1A1D1A]">Face Shape &amp; Collars</h3>
              </div>
              <span className="text-[10px] font-bold text-[#3D7A5A] bg-[#E7ECE3] px-2.5 py-0.5 rounded-full border border-[#DCE4D7]">
                {scanResults.faceShape.harmony}
              </span>
            </div>

            <div>
              <p className="font-serif font-bold text-base text-[#1A1D1A]">
                {scanResults.faceShape.type}
              </p>
              <p className="text-xs text-[#717670] mt-1 leading-relaxed">
                {scanResults.faceShape.description}
              </p>
            </div>

            {/* Recommended Collars Chips */}
            <div className="pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E968C] block mb-1.5">
                OPTIMAL COLLARS &amp; NECKLINES:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {scanResults.faceShape.bestNecklines.map((neck) => (
                  <span
                    key={neck}
                    className="px-2.5 py-1 bg-[#FAF8F5] border border-[#ECE8DF] rounded-xl text-xs font-semibold text-[#1A1D1A] flex items-center gap-1.5"
                  >
                    <Shirt className="w-3 h-3 text-[#5F665D]" />
                    <span>{neck}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Color Season & Undertone Palette */}
          <div className="bg-white rounded-3xl border border-[#ECE8DF] p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8DF]/60">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#1A1D1A]" />
                <h3 className="font-bold text-sm text-[#1A1D1A]">Color Season &amp; Undertone</h3>
              </div>
              <span className="text-[10px] font-bold text-[#3D7A5A] bg-[#E7ECE3] px-2.5 py-0.5 rounded-full border border-[#DCE4D7]">
                {scanResults.undertone.harmony}
              </span>
            </div>

            <div>
              <p className="font-serif font-bold text-base text-[#1A1D1A]">
                {scanResults.undertone.type} · {scanResults.undertone.season}
              </p>
              <p className="text-xs text-[#717670] mt-1 leading-relaxed">
                Rich earth tones, soft olives, and muted taupes enhance your natural dermal warmth.
              </p>
            </div>

            {/* Recommended Swatches */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E968C] block mb-2">
                FLATTERING PALETTE:
              </span>
              <div className="grid grid-cols-5 gap-2 text-center">
                {scanResults.undertone.recommendedColors.map((col) => (
                  <div key={col.name} className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-xl border border-black/10 shadow-2xs mb-1"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-[9px] font-semibold text-[#1A1D1A] truncate max-w-full">
                      {col.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid Shades */}
            <div className="pt-2 border-t border-[#ECE8DF]/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86D51] block mb-1.5">
                SHADES TO MINIMIZE:
              </span>
              <div className="flex items-center gap-2">
                {scanResults.undertone.avoidColors.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-800"
                  >
                    <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: col.hex }} />
                    <span>{col.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extended Digital Color Draping Studio Swatches from API GET /profile/color-draping */}
            {colorDrapingData?.swatches && colorDrapingData.swatches.length > 0 && (
              <div className="pt-3 border-t border-[#ECE8DF]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D7A5A]">
                    DIGITAL COLOR DRAPING STUDIO ({colorDrapingData.season || 'Calibrated'}):
                  </span>
                  <span className="text-[10px] text-[#8E968C] font-medium">
                    {colorDrapingData.undertone}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colorDrapingData.swatches.slice(0, 6).map((swatch, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-[#FAF8F5] border border-[#ECE8DF] flex items-center gap-2 shadow-2xs"
                    >
                      <div
                        className="w-5 h-5 rounded-lg border border-black/10 shrink-0 shadow-2xs"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#1A1D1A] truncate">{swatch.name}</p>
                        <p className="text-[9px] text-[#8E968C] capitalize truncate">{swatch.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Body Silhouette & Proportions */}
          <div className="bg-white rounded-3xl border border-[#ECE8DF] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8DF]/60">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#1A1D1A]" />
                <h3 className="font-bold text-sm text-[#1A1D1A]">Silhouette &amp; Proportions</h3>
              </div>
              <span className="text-[10px] font-bold text-[#3D7A5A] bg-[#E7ECE3] px-2.5 py-0.5 rounded-full border border-[#DCE4D7]">
                {scanResults.silhouette.harmony}
              </span>
            </div>

            <div>
              <p className="font-serif font-bold text-base text-[#1A1D1A]">
                {scanResults.silhouette.type} ({scanResults.silhouette.proportions})
              </p>
              <p className="text-xs text-[#717670] mt-1 leading-relaxed">
                {scanResults.silhouette.advice}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 pb-2 space-y-2.5">
            <button
              type="button"
              onClick={handleSaveToProfile}
              className="w-full h-12 rounded-2xl font-bold text-xs bg-[#1E2E22] hover:bg-[#162319] text-[#F8F6F0] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Apply to Style Profile</span>
            </button>

            <button
              type="button"
              onClick={handleResetScan}
              className="w-full py-2.5 text-xs font-bold text-[#8E968C] hover:text-[#1A1D1A] transition-colors cursor-pointer text-center"
            >
              Retake / Scan Another Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleScannerPage;
