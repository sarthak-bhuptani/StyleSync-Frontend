import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Layers, ArrowLeft, ShieldCheck } from 'lucide-react';
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
      {/* Clean Compact Style Profile Banner */}
      {!analyzing && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-slate-700">
              <Compass className="w-4 h-4 text-slate-800" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Style Calibration</p>
              <p className="text-xs font-bold text-slate-800 truncate">
                {faceShape ? `${faceShape} Face · ${skinTone || 'Warm Golden'} · ${silhouette || 'Athletic Build'}` : 'Profile uncalibrated'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl shrink-0 transition-colors cursor-pointer"
          >
            {faceShape ? 'Edit' : 'Calibrate'}
          </button>
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
