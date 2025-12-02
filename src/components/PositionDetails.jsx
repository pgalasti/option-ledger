import React from 'react';

const PositionDetails = ({ position }) => {
    if (!position) return null;

    const { symbol, name, type, sellDate, expirationDate, priceSold, strikePrice } = position;
    const totalPremium = (priceSold * 100).toFixed(2);

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.9rem', color: '#888' }}>Other Open Positions: #</span>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{name} ({symbol})</h2>
                </div>
                <div className="position-type-badge">{type}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', flex: 1, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.25rem' }}>Sell Date</div>
                    <div style={{ fontSize: '1.2rem' }}>{sellDate}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.25rem' }}>Expiration Date</div>
                    <div style={{ fontSize: '1.2rem' }}>{expirationDate}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.25rem' }}>Contract Price</div>
                    <div style={{ fontSize: '1.2rem' }}>${priceSold.toFixed(2)}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.25rem' }}>Total Premium</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-accent-green)' }}>${totalPremium}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem' }}>
                <button
                    className="btn"
                    style={{
                        flex: 1,
                        border: '1px solid #ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Close Position
                </button>
                <button
                    className="btn"
                    style={{
                        flex: 1,
                        border: '1px solid #22c55e',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Roll Position
                </button>
            </div>
        </div>
    );
};

export default PositionDetails;
