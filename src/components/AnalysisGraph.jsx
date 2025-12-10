import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { parseDate } from '../services/util/DateUtils';

const AnalysisGraph = ({ data }) => {
    const [timeRange, setTimeRange] = useState('1Y'); // Just going to default it to one year
    const [hoveredData, setHoveredData] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, align: 'left' });

    const chartData = useMemo(() => {
        if (!data) return [];

        const now = new Date();
        let startDate = new Date();
        startDate.setDate(1); // Normalize to start of month

        if (timeRange === 'ALL') {
            if (data.length === 0) {
                startDate.setFullYear(now.getFullYear() - 1); // Default to 1Y if no data. Maybe add a message later?
            } else {
                const minDate = new Date(Math.min(...data.map(d => parseDate(d.date))));
                startDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
            }
        } else {
            switch (timeRange) {
                case '6M':
                    startDate.setMonth(now.getMonth() - 5); // Current + 5 previous = 6 months
                    break;
                case '1Y':
                    startDate.setFullYear(now.getFullYear() - 1);
                    startDate.setMonth(startDate.getMonth() + 1); // 12 months total
                    break;
                case '5Y':
                    startDate.setFullYear(now.getFullYear() - 5);
                    startDate.setMonth(startDate.getMonth() + 1);
                    break;
                default:
                    break;
            }
        }

        const monthlyData = {};
        data.forEach(item => {
            const date = parseDate(item.date);
            if (date >= startDate) {
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyData[key] = (monthlyData[key] || 0) + item.pl;
            }
        });

        const result = [];
        const current = new Date(startDate);
        const end = new Date(); // Today

        while (current <= end || (current.getMonth() === end.getMonth() && current.getFullYear() === end.getFullYear())) {
            const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            result.push({
                date: key,
                pl: monthlyData[key] || 0
            });
            current.setMonth(current.getMonth() + 1);
        }

        return result;
    }, [data, timeRange]);

    if (chartData.length === 0) {
        return (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    {['6M', '1Y', '5Y', 'ALL'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`btn btn-outline ${timeRange === range ? 'active' : ''}`}
                            style={{
                                margin: '0 0.25rem',
                                padding: '0.25rem 0.75rem',
                                fontSize: '0.8rem',
                                borderColor: timeRange === range ? 'var(--color-primary)' : 'var(--color-border)',
                                color: timeRange === range ? 'var(--color-primary)' : 'var(--color-text-muted)'
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>
                <p style={{ color: 'var(--color-text-muted)' }}>No data available for this time range.</p>
            </div>
        );
    }

    const width = 800;
    const height = 400;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...chartData.map(d => Math.abs(d.pl)), 100);
    const yScale = (val) => chartHeight / 2 - (val / maxVal) * (chartHeight / 2);
    const barWidth = (chartWidth / chartData.length) * 0.6;
    const xStep = chartWidth / chartData.length;

    return (
        <div className="glass-panel" style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>Profit/Loss Over Time</h3>
                <div>
                    {['6M', '1Y', '5Y', 'ALL'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`btn btn-outline`}
                            style={{
                                margin: '0 0.25rem',
                                padding: '0.25rem 0.75rem',
                                fontSize: '0.8rem',
                                borderColor: timeRange === range ? 'var(--color-primary)' : 'var(--color-border)',
                                color: timeRange === range ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                background: timeRange === range ? 'rgba(52, 235, 94, 0.1)' : 'transparent'
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {/* Zero Line */}
                    <line
                        x1={padding}
                        y1={height / 2}
                        x2={width - padding}
                        y2={height / 2}
                        stroke="var(--color-border)"
                        strokeWidth="1"
                        strokeDasharray="4"
                    />

                    {/* Bars */}
                    {chartData.map((d, i) => {
                        const x = padding + i * xStep + (xStep - barWidth) / 2;
                        const y = d.pl >= 0 ? height / 2 - (d.pl / maxVal) * (chartHeight / 2) : height / 2;
                        const h = Math.abs((d.pl / maxVal) * (chartHeight / 2));
                        const color = d.pl >= 0 ? 'var(--color-primary)' : '#ff4d4d';

                        return (
                            <g key={d.date} className="chart-bar-group">
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={h}
                                    fill={color}
                                    rx="2"
                                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                                    onMouseEnter={(e) => {
                                        setHoveredData(d);
                                        const isRightSide = e.clientX > window.innerWidth / 2;
                                        setTooltipPos({
                                            x: e.clientX,
                                            y: e.clientY,
                                            align: isRightSide ? 'right' : 'left'
                                        });
                                    }}
                                    onMouseMove={(e) => {
                                        const isRightSide = e.clientX > window.innerWidth / 2;
                                        setTooltipPos({
                                            x: e.clientX,
                                            y: e.clientY,
                                            align: isRightSide ? 'right' : 'left'
                                        });
                                    }}
                                    onMouseLeave={() => setHoveredData(null)}
                                />
                                {/* X Axis Labels (show every nth label to avoid crowding) */}
                                {(chartData.length <= 12 || i % Math.ceil(chartData.length / 12) === 0) && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={height - 10}
                                        textAnchor="middle"
                                        fill="var(--color-text-muted)"
                                        fontSize="10"
                                    >
                                        {new Date(d.date + '-02').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip */}
                {hoveredData && createPortal(
                    <div style={{
                        position: 'fixed',
                        left: tooltipPos.x,
                        top: tooltipPos.y,
                        transform: tooltipPos.align === 'right' ? 'translate(-100%, -120%)' : 'translate(0%, -120%)',
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                        zIndex: 9999, // Ensure it's on top of everything
                        pointerEvents: 'none',
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            {new Date(hoveredData.date + '-02').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{
                            fontWeight: 'bold',
                            color: hoveredData.pl >= 0 ? 'var(--color-primary)' : '#ff4d4d',
                            fontSize: '1.1rem'
                        }}>
                            ${hoveredData.pl.toFixed(2)}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default AnalysisGraph;
