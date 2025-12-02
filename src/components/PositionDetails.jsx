import React from 'react';

const PositionDetails = ({ position, onEdit, onDelete }) => {
    if (!position) return null;

    const { id, symbol, name, type, sellDate, expirationDate, priceSold, strikePrice, fees } = position;
    const totalPremium = ((priceSold * 100) - (fees || 0)).toFixed(2);

    const daysUntil = Math.floor((new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isExpired = daysUntil < 0;

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the position for ${symbol}?`)) {
            onDelete(id);
        }
    };

    return (
        <div className={`card ${isExpired ? 'expired' : ''}`} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', borderColor: isExpired ? '#eb3434' : 'transparent' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifySelf: 'start' }}>
                    <button
                        className="btn"
                        style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.8rem',
                            border: '1px solid #34aeeb',
                            background: 'rgba(52, 174, 235, 0.1)',
                            color: '#34aeeb',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => onEdit(position)}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        className="btn"
                        style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.8rem',
                            border: '1px solid #ef4444',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={handleDelete}
                    >
                        🗑️ Delete
                    </button>
                </div>
                <div style={{ textAlign: 'center', justifySelf: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{name} ({symbol})</h2>
                </div>
                <div className="badges-container" style={{ justifySelf: 'end' }}>
                    {isExpired && <span className="badge-expired">EXPIRED</span>}
                    <div className="position-type-badge">{type}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center', overflowY: 'auto' }}>
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
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.25rem' }}>Fees</div>
                    <div style={{ fontSize: '1.2rem', color: '#ef4444' }}>-${(fees || 0).toFixed(2)}</div>
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
                        border: '1px solid #34aeeb',
                        background: 'rgba(52, 174, 235, 0.1)',
                        color: '#34aeeb',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Mark Assigned
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
