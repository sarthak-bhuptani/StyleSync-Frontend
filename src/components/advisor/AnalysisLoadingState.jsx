import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, Loader2, ShieldCheck, ShoppingBag } from 'lucide-react';

export const AnalysisLoadingState = ({ product }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Analyzing your personal style profile...', detail: 'Comparing aesthetic tags & preferred silhouettes' },
    { title: 'Checking colors against your palette...', detail: 'Scanning favorite vs. avoided color spectrums' },
    { title: 'Comparing with your wardrobe collection...', detail: 'Testing multi-piece pairing combinations' },
    { title: 'Evaluating versatility & price-per-wear...', detail: 'Checking category budget constraints' },
    { title: 'Calculating final StyleSync recommendation...', detail: 'Generating suitability index & tailored reasoning' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-xl mx-auto py-12 px-6 text-center animate-fade-in">
      {/* Product Mini Preview */}
      <div className="relative inline-block mb-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-card border border-slate-200 mx-auto bg-slate-100 flex items-center justify-center">
          {product?.image ? (
            <img
              src={product.image}
              alt="Analyzing"
              className="w-full h-full object-cover animate-pulse-subtle"
            />
          ) : (
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center shadow-md">
          <Compass className="w-4 h-4 animate-spin text-emerald-400" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-1">
        Evaluating "{product?.name || 'Product'}"
      </h3>
      <p className="text-xs text-slate-500 mb-8 font-medium">
        Consulting your personal style profile, color season, and wardrobe rotation...
      </p>

      {/* Steps List */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle text-left">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                isCurrent ? 'bg-emerald-50/70 border border-emerald-200/60' : 'opacity-70'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold leading-tight ${
                    isCurrent ? 'text-emerald-950' : isDone ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Finalizing personal stylist verdict & pairing breakdown...</span>
      </div>
    </div>
  );
};
