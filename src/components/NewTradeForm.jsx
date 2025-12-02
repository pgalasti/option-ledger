import React, { useState, useEffect } from 'react';
import { TradeType } from '../model/TradeType';
import { CompanyService } from '../services/CompanyService';

function NewTradeForm({ isOpen, onClose, onSave }) {
    const [symbol, setSymbol] = useState('');
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [type, setType] = useState('Call'); // Just default it to call for now
    const [strikePrice, setStrikePrice] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
    const [premium, setPremium] = useState('');

    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!symbol) {
                setFilteredCompanies([]);
                return;
            }

            const companies = await CompanyService.searchCompanies(symbol);
            setFilteredCompanies(companies);
        };

        const timeoutId = setTimeout(() => {
            if (symbol.length > 1) { // Only search if more than 1 char
                fetchCompanies();
            } else {
                setFilteredCompanies([]);
            }
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [symbol]);

    const handleSelectCompany = (company) => {
        setSymbol(company.symbol);
        setSelectedCompany(company);
        setShowSuggestions(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCompany) {
            alert("Please select a valid company from the list.");
            return;
        }

        const newTrade = {
            id: Date.now(), // DateTime in milliseconds for unique ID
            symbol: selectedCompany.symbol,
            name: selectedCompany.name,
            type: type === 'Call' ? TradeType.COVERED_CALL : TradeType.SHORT_PUT,
            sellDate,
            expirationDate,
            priceSold: parseFloat(premium),
            strikePrice: parseFloat(strikePrice)
        };
        onSave(newTrade);
        resetForm();
    };

    const resetForm = () => {
        setSymbol('');
        setSelectedCompany(null);
        setType('Call');
        setStrikePrice('');
        setExpirationDate('');
        setSellDate(new Date().toISOString().split('T')[0]);
        setPremium('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="new-trade-overlay" onClick={onClose}>
            <div className="new-trade-sidebar" onClick={e => e.stopPropagation()}>

                <div className="sidebar-header">
                    <h2 className="sidebar-title">New Trade</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Company Search */}
                    <div className="form-group">
                        <label className="form-label">Company</label>
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => {
                                setSymbol(e.target.value);
                                setSelectedCompany(null); // Clear selection on type
                                setShowSuggestions(true);
                            }}
                            placeholder="Search Symbol or Name"
                            className="form-input"
                            required
                        />
                        {showSuggestions && symbol && filteredCompanies.length > 0 && (
                            <ul className="suggestions-list">
                                {filteredCompanies.map(c => (
                                    <li key={c.symbol} onClick={() => handleSelectCompany(c)} className="suggestion-item">
                                        <strong>{c.symbol}</strong> - {c.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Type Toggle */}
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <div className="toggle-group">
                            <button
                                type="button"
                                onClick={() => setType('Call')}
                                className={`toggle-btn call ${type === 'Call' ? 'active' : ''}`}
                            >
                                Call
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('Put')}
                                className={`toggle-btn put ${type === 'Put' ? 'active' : ''}`}
                            >
                                Put
                            </button>
                        </div>
                    </div>

                    {/* Strike Price */}
                    <div className="form-group">
                        <label className="form-label">Strike Price ($)</label>
                        <input
                            type="number"
                            step="0.50"
                            value={strikePrice}
                            onChange={(e) => setStrikePrice(e.target.value)}
                            placeholder="0.00"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Sell Date */}
                    <div className="form-group">
                        <label className="form-label">Sell Date</label>
                        <input
                            type="date"
                            value={sellDate}
                            onChange={(e) => setSellDate(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Expiration Date */}
                    <div className="form-group">
                        <label className="form-label">Expiration Date</label>
                        <input
                            type="date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Premium/Cost */}
                    <div className="form-group">
                        <label className="form-label">Premium / Cost ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={premium}
                            onChange={(e) => setPremium(e.target.value)}
                            placeholder="0.00"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                        >
                            Save Trade
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default NewTradeForm;
