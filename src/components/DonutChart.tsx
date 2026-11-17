import React, { useState } from 'react';
import { CategoryExpense } from '../types/finance';
import { formatCurrency } from '../utils/calculations';

interface DonutChartProps {
  categories: CategoryExpense[];
  totalExpense: number;
  hideValues?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  categories,
  totalExpense,
  hideValues = false,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryExpense | null>(null);

  if (categories.length === 0 || totalExpense === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700/50">
        <p className="text-sm text-slate-400">Nenhuma despesa registrada para o período selecionado.</p>
      </div>
    );
  }

  const activeCategory = hoveredCategory || categories[0];
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
          {/* Background circle track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {categories.map((cat) => {
            const fraction = cat.total / totalExpense;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeOffset;
            cumulativeOffset += fraction * circumference;

            const isSelected = activeCategory?.category === cat.category;

            return (
              <circle
                key={cat.category}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={cat.color}
                strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onMouseEnter={() => setHoveredCategory(cat)}
                onClick={() => setHoveredCategory(cat)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-[11px] font-medium text-slate-400 truncate max-w-[110px]">
            {activeCategory?.category}
          </span>
          <span className="text-base font-bold font-mono text-white mt-0.5 tracking-tight">
            {formatCurrency(activeCategory?.total || 0, hideValues)}
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 mt-0.5">
            {activeCategory?.percentage}% do total
          </span>
        </div>
      </div>

      {/* Legend below */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4 max-h-40 overflow-y-auto pr-1">
        {categories.map(cat => {
          const isSelected = activeCategory?.category === cat.category;
          return (
            <button
              key={cat.category}
              onClick={() => setHoveredCategory(cat)}
              className={`flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-slate-800 border border-slate-700 shadow-sm'
                  : 'hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs text-slate-300 font-medium truncate">
                  {cat.category}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-200 shrink-0 ml-1">
                {cat.percentage}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
