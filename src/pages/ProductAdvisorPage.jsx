import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Layers, ArrowLeft, ShieldCheck } from 'lucide-react';
import { UploadDropzone } from '../components/advisor/UploadDropzone';
import { AnalysisLoadingState } from '../components/advisor/AnalysisLoadingState';
import { SelfAnalysisScanModal } from '../components/profile/SelfAnalysisScanModal';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';

export const ProductAdvisorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analyzeNewProduct, showToast } = useWardrobe();
  const { user } = useAuth();

  const [analyzing, setAnalyzing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(location.state?.initialProduct || null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const handleProductReady = async (productData) => {
    setCurrentProduct(productData);
    setAnalyzing(true);

    try {
      const analyzed = await analyzeNewProduct(productData);
      if (analyzed && analyzed.id) {
        navigate(`/advisor/result/${analyzed.id}`);
      } else {
        throw new Error('Could not evaluate product. Please verify server connection.');
      }
    } catch (err) {
      console.error('[ProductAdvisor Error]:', err);
      setAnalyzing(false);
      showToast(err.message || 'Product evaluation failed. Please try again.', 'error');
    }
  };

  const faceShape = user?.physicalTraits?.faceShape && user.physicalTraits.faceShape !== 'Uncalibrated'
    ? user.physicalTraits.faceShape
    : null;
  const skinTone = user?.physicalTraits?.skinUndertone && user.physicalTraits.skinUndertone !== 'Uncalibrated'
    ? user.physicalTraits.skinUndertone
    : null;
  const silhouette = user?.physicalTraits?.bodySilhouette && user.physicalTraits.bodySilhouette !== 'Uncalibrated'
    ? user.physicalTraits.bodySilhouette
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Title Header */}
      {!analyzing && (
        <div className="space-y-4 mb-8">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Neural Suitability Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Will This Suit Me?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Upload a product screenshot and StyleSync will analyze it against your <strong>Face Shape</strong>, <strong>Skin Undertone</strong>, <strong>Body Build</strong>, wardrobe items, and budget.
            </p>
          </div>

          {/* User Face & Body Calibration Mini Banner */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${faceShape ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span className="text-slate-600">
                Calibrated to:{' '}
                {faceShape ? (
                  <>
                    <strong className="text-slate-900">{faceShape} Face</strong> ·{' '}
                    <strong className="text-slate-900">{skinTone || 'Neutral'} Skin</strong> ·{' '}
                    <strong className="text-slate-900">{silhouette || 'Athletic Build'}</strong>
                  </>
                ) : (
                  <span className="text-amber-700 font-semibold">Not calibrated yet (Selfie calibration recommended)</span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsScanModalOpen(true)}
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{faceShape ? 'Recalibrate Face & Body' : 'Calibrate with Selfie'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Body: Upload Form or Animated AI Loading State */}
      {analyzing ? (
        <AnalysisLoadingState product={currentProduct} />
      ) : (
        <UploadDropzone
          onProductReady={handleProductReady}
          initialProduct={currentProduct}
        />
      )}

      {/* Face & Body Analysis Scan Modal */}
      <SelfAnalysisScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};
