import React from 'react';

export const ScoreMeter = ({ score = 88, max = 100, size = 'lg', decision = 'BUY' }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((score / max) * 100)));
  
  // Choose stroke color based on decision/score
  let strokeColor = '#10B981'; // Emerald (BUY)
  let ringBg = 'text-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (score < 60 || decision === 'SKIP') {
    strokeColor = '#EF4444'; // Red
    ringBg = 'text-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (score < 80 || decision === 'MAYBE') {
    strokeColor = '#F59E0B'; // Amber
    ringBg = 'text-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  const radius = size === 'xl' ? 56 : size === 'lg' ? 44 : 32;
  const strokeWidth = size === 'xl' ? 8 : size === 'lg' ? 6.5 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="relative inline-flex items-center justify-center flex-col">
      <div className="relative flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Progress Ring */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-extrabold tracking-tight text-slate-900 ${
            size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : 'text-lg'
          }`}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            / {max}
          </span>
        </div>
      </div>
    </div>
  );
};
