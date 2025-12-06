import React from 'react';

const AnalysisMetrics = ({ metrics }) => {
    if (!metrics) return null;

    const { totalPL, tradeCount, callsCount, putsCount, assignedCount, expiredCount, rolledCount, repurchasedCount } = metrics;

    const MetricCard = ({ label, value, subValue, isCurrency }) => (
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{label}</span>
            <span style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: isCurrency ? (value >= 0 ? 'var(--color-primary)' : '#ff4d4d') : 'var(--color-text-main)'
            }}>
                {isCurrency ? `$${value.toFixed(2)}` : value}
            </span>
            {subValue && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    {subValue}
                </span>
            )}
        </div>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', width: '100%' }}>
            <MetricCard label="Total Trades" value={tradeCount} subValue={`${callsCount} Calls / ${putsCount} Puts`} />
            <MetricCard label="Total P/L" value={totalPL} isCurrency={true} />
            <MetricCard label="Repurchased" value={repurchasedCount || 0} />
            <MetricCard label="Assigned" value={assignedCount} />
            <MetricCard label="Expired" value={expiredCount} />
            <MetricCard label="Rolled" value={rolledCount} />
        </div>
    );
};

export default AnalysisMetrics;
