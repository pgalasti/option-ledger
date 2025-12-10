import React from 'react';
import { parseDate } from '../services/util/DateUtils';

const PositionSummary = ({ position, isSelected }) => {
    const { symbol, name, type, sellDate, expirationDate, priceSold, strikePrice, fees, rollCount } = position;

    const daysUntil = Math.floor((parseDate(expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isExpired = daysUntil < 0;

    const strikeSuffix = type.toLowerCase().includes('call') ? 'C' : 'P';

    return (
        <div className={`position-summary-card ${isExpired ? 'expired' : ''} ${isSelected ? 'selected' : ''}`}>
            <div className="position-header">
                <div className="position-symbol-group">
                    <h3 className="position-symbol">
                        {symbol} <span className="strike-price">@{strikePrice}{strikeSuffix}</span>
                    </h3>
                    <span className="position-name">{name}</span>
                </div>
                <div className="badges-container">
                    {position.rollCount > 0 && (
                        <span className="badge-action-needed" style={{ borderColor: '#eab308', color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>
                            Rolled #{position.rollCount}
                        </span>
                    )}
                    {isExpired && <span className="badge-expired">EXPIRED</span>}
                    <div className="position-type-badge">{type}</div>
                </div>
            </div>

            <div className="position-details-grid">
                <div className="detail-item">
                    <span className="detail-label">Sell Date</span>
                    <span className="detail-value">{sellDate}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Expires</span>
                    <span className="detail-value">
                        {expirationDate}
                        <span className={`days-remaining ${isExpired ? 'expired-text' : ''}`}>
                            ({isExpired ? 'Expired' : `${daysUntil}d`})
                        </span>
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Contract Price</span>
                    <span className="detail-value price">${priceSold.toFixed(2)}{priceSold > 0 ? 'cr' : 'db'}   </span>
                </div>
            </div>
        </div>
    );
};

export default PositionSummary;
