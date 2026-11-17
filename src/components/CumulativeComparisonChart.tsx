import React, { useState } from 'react';
import { calculateDailyCumulativeExpense, formatCurrency } from '../utils/calculations';
import { Transaction } from '../types/finance';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface CumulativeComparisonChartProps {
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
  prevMonth: number;
  prevYear: number;
  hideValues?: boolean;
}

export const CumulativeComparisonChart: React.FC<CumulativeComparisonChartProps> = ({
  transactions,
  currentMonth,
  currentYear,
  prevMonth,
  prevYear,
  hideValues = false,
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const currentDaily = calculateDailyCumulativeExpense(transactions, currentMonth, currentYear, 30);
  const prevDaily = calculateDailyCumulativeExpense(transactions, prevMonth, prevYear, 30);

  const maxVal = Math.max(
    ...currentDaily.map(d => d.cumulative),
    ...prevDaily.map(d => d.cumulative),
    1000
  );

  const width = 360;
  const height = 180;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (day: number) => paddingLeft + ((day - 1) / 29) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxVal) * chartHeight;

  // Build SVG paths
  const currentPath = currentDaily
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.day)} ${getY(pt.cumulative)}`)
    .join(' ');

  const prevPath = prevDaily
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.day)} ${getY(pt.cumulative)}`)
    .join(' ');

  const currentArea = `${currentPath} L ${getX(30)} ${getY(0)} L ${getX(1)} ${getY(0)} Z`;

  // Selected Day data
  const selectedDay = hoveredDay !== null ? hoveredDay : 6;
  const currentValAtDay = currentDaily.find(d => d.day === selectedDay)?.cumulative || 0;
  const prevValAtDay = prevDaily.find(d => d.day === selectedDay)?.cumulative || 0;
  const diffAtDay = currentValAtDay - prevValAtDay;
  const isSpendingLess = diffAtDay <= 0;

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white">Trajetória Acumulada de Despesas</h3>
          <p className="text-xs text-slate-400">Comparação diária em tempo real</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
          {isSpendingLess ? (
            <>
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-mono">
                {formatCurrency(Math.abs(diffAtDay), hideValues)} a menos
              </span>
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 font-mono">
                +{formatCurrency(diffAtDay, hideValues)} a mais
              </span>
            </>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredDay(null)}
        >
          <defs>
            <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = paddingTop + chartHeight * (1 - pct);
            const val = maxVal * pct;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="2,2"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingLeft - 4}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  fill="#94A3B8"
                  fontFamily="monospace"
                >
                  {hideValues ? '•••' : `${Math.round(val / 1000)}k`}
                </text>
              </g>
            );
          })}

          {/* Area fill for current month */}
          <path d={currentArea} fill="url(#currentGrad)" />

          {/* Previous Month (dashed line) */}
          <path
            d={prevPath}
            fill="none"
            stroke="#64748B"
            strokeWidth="2"
            strokeDasharray="4,4"
          />

          {/* Current Month (solid emerald line) */}
          <path
            d={currentPath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Hover indicator vertical bar */}
          {hoveredDay && (
            <line
              x1={getX(hoveredDay)}
              y1={paddingTop}
              x2={getX(hoveredDay)}
              y2={paddingTop + chartHeight}
              stroke="#E2E8F0"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}

          {/* Day markers along X-axis */}
          {[1, 5, 10, 15, 20, 25, 30].map(day => (
            <text
              key={day}
              x={getX(day)}
              y={height - 8}
              textAnchor="middle"
              fontSize="8"
              fill="#94A3B8"
              fontFamily="monospace"
            >
              d{day}
            </text>
          ))}

          {/* Interactive touch/hover points across 30 days */}
          {currentDaily.map(d => (
            <rect
              key={d.day}
              x={getX(d.day) - 5}
              y={paddingTop}
              width={10}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredDay(d.day)}
              onTouchStart={() => setHoveredDay(d.day)}
            />
          ))}

          {/* Point indicator on current day */}
          <circle
            cx={getX(selectedDay)}
            cy={getY(currentValAtDay)}
            r="4"
            fill="#10B981"
            stroke="#0F172A"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Trajectory Details Badge */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 rounded" />
            <span className="text-slate-300 font-medium">Este Mês (Dia {selectedDay}):</span>
            <span className="text-white font-mono font-bold">
              {formatCurrency(currentValAtDay, hideValues)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
            <span className="text-slate-400">Mês Ant.:</span>
            <span className="text-slate-300 font-mono">
              {formatCurrency(prevValAtDay, hideValues)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
