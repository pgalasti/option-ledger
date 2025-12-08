import React, { useState, useEffect } from 'react';
import { TradeType } from '../model/TradeType';
import { CompanyService } from '../services/http/CompanyService';

function NewTradeForm({ isOpen, onClose, onSave, onUpdate, onClosePosition, onAssign, onRoll, initialData, mode = 'NEW' }) {
    const [symbol, setSymbol] = useState('');
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [type, setType] = useState('Call'); // Just default it to call for now
    const [strikePrice, setStrikePrice] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
    const [premium, setPremium] = useState('');
    const [fees, setFees] = useState(0.65);
    const [buyToClosePrice, setBuyToClosePrice] = useState('');

    const [selectedCompany, setSelectedCompany] = useState(null);

    // May need to useReducer for this since it's getting complex.
    useEffect(() => {
        if (initialData) {
            setSymbol(initialData.symbol);
            setSelectedCompany({ symbol: initialData.symbol, name: initialData.name });
            setType(initialData.type === TradeType.COVERED_CALL ? 'Call' : 'Put');
            setStrikePrice(initialData.strikePrice);
            setExpirationDate(initialData.expirationDate);

            if (mode === 'CLOSE') {
                setSellDate(new Date().toISOString().split('T')[0]); // Default close date to today
                setPremium(''); // User needs to enter buy back price
                setFees(0.00); // Default close fees
            } else if (mode === 'ASSIGN') {
                setSellDate(new Date().toISOString().split('T')[0]); // Default assignment date to today
                setPremium(initialData.strikePrice); // Default assigned price to strike price
                setFees(0.00); // Default assignment fees
            } else {
                setSellDate(initialData.sellDate);
                setPremium(initialData.priceSold);
                setFees(initialData.fees || 0);
            }
        } else {
            resetFormState();
        }
    }, [initialData, isOpen, mode]);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!symbol) {
                setFilteredCompanies([]);
                return;
            }

            setIsLoading(true);
            try {
                const companies = await CompanyService.searchCompanies(symbol);
                console.log("NewTradeForm companies:", companies);
                setFilteredCompanies(companies);
            } catch (error) {
                console.error("Failed to search companies", error);
                setFilteredCompanies([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (symbol.length > 1) { // Only search if more than 1 char
                fetchCompanies();
            } else {
                setFilteredCompanies([]);
            }
        }, 500);  // Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [symbol]);

    const handleSelectCompany = async (company) => {
        setSymbol(company.symbol);
        setSelectedCompany(company);
        setShowSuggestions(false);

        const quote = await CompanyService.getQuote(company.symbol);
        if (quote && quote.regularMarketPrice) {
            setStrikePrice(Math.round(quote.regularMarketPrice).toFixed(2));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCompany) {
            alert("Please select a valid company from the list.");
            return;
        }

        const tradeData = {
            ...(initialData || {}),
            id: initialData ? initialData.id : Date.now(),
            symbol: selectedCompany.symbol,
            name: selectedCompany.name,
            type: type === 'Call' ? TradeType.COVERED_CALL : TradeType.SHORT_PUT,
            sellDate,
            expirationDate,
            priceSold: parseFloat(premium),
            strikePrice: parseFloat(strikePrice),
            fees: parseFloat(fees)
        };

        if (mode === 'CLOSE') {
            onClosePosition({
                ...tradeData,
                dateClosed: sellDate,
                priceClosed: parseFloat(premium),
                fees: parseFloat(fees)
            });
        } else if (mode === 'ASSIGN') {
            onAssign({
                ...tradeData,
                dateAssigned: sellDate,
                assignedPrice: parseFloat(premium),
                fees: parseFloat(fees)
            });
        } else if (mode === 'ROLL') {
            // For roll, we need to pass back data for both closing the old and opening the new
            // 'premium' state here is the STO price for the new leg
            // We need a separate state for the BTC price of the old leg
            onRoll({
                oldPositionId: initialData.id,
                closeDate: sellDate, // Using sellDate as the transaction date for both
                closePrice: parseFloat(buyToClosePrice),
                closeFees: parseFloat(fees), // Assuming fees apply to both or split? Let's just use one fee field for now or add another.

                newPosition: {
                    symbol: selectedCompany.symbol,
                    name: selectedCompany.name,
                    type: type === 'Call' ? TradeType.COVERED_CALL : TradeType.SHORT_PUT,
                    sellDate: sellDate,
                    expirationDate: expirationDate,
                    priceSold: parseFloat(premium),
                    strikePrice: parseFloat(strikePrice),
                    fees: parseFloat(fees) // Applying same fee to new leg? Or maybe we should have separate fee inputs.
                }
            });
        } else if (initialData) {
            onUpdate(tradeData);
        } else {
            onSave(tradeData);
        }
        resetFormState();
    };

    const resetFormState = () => {
        setSymbol('');
        setSelectedCompany(null);
        setType('Call');
        setStrikePrice('');
        setExpirationDate('');
        setSellDate(new Date().toISOString().split('T')[0]);
        setPremium('');
        setFees(0.65);
        setBuyToClosePrice('');
    };

    const handleClose = () => {
        resetFormState();
        onClose();
    };

    if (!isOpen) return null;

    const isCloseMode = mode === 'CLOSE';
    const isAssignMode = mode === 'ASSIGN';
    const isRollMode = mode === 'ROLL';
    const isReadOnlyMode = isCloseMode || isAssignMode; // Roll mode allows editing most things for the new leg

    const getTitle = () => {
        if (isCloseMode) return 'Close Position';
        if (isAssignMode) return 'Mark Assigned';
        if (isRollMode) return 'Roll Position';
        return initialData ? 'Edit Trade' : 'New Trade';
    };

    const getDateLabel = () => {
        if (isCloseMode) return 'Date Closed';
        if (isAssignMode) return 'Assignment Date';
        if (isRollMode) return 'Transaction Date';
        return 'Sell Date';
    };

    const getPriceLabel = () => {
        if (isCloseMode) return 'Buy Back Cost ($)';
        if (isAssignMode) return 'Assigned Price ($)';
        if (isRollMode) return 'New Premium (STO) ($)';
        return 'Premium / Cost ($)';
    };

    const getSubmitLabel = () => {
        if (isCloseMode) return 'Close Position';
        if (isAssignMode) return 'Mark Assigned';
        if (isRollMode) return 'Roll Position';
        return initialData ? 'Update Trade' : 'Save Trade';
    };

    return (
        <div className="new-trade-overlay" onClick={handleClose}>
            <div className="new-trade-sidebar" onClick={e => e.stopPropagation()}>

                <div className="sidebar-header">
                    <h2 className="sidebar-title">
                        {getTitle()}
                    </h2>
                    <button onClick={handleClose} className="close-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Company Search - Read Only in Close/Assign Mode, but editable in Roll (though usually same symbol) */}
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
                            disabled={isReadOnlyMode || isRollMode}
                        />
                        {console.log("Render suggestions check:", { isReadOnlyMode, showSuggestions, symbol, filteredCompaniesLen: filteredCompanies.length, isLoading })}
                        {!isReadOnlyMode && showSuggestions && symbol && (
                            <ul className="suggestions-list">
                                {isLoading ? (
                                    <li className="suggestion-item">Loading...</li>
                                ) : filteredCompanies.length > 0 ? (
                                    filteredCompanies.map((company) => (
                                        <li
                                            key={company.symbol}
                                            className="suggestion-item"
                                            onClick={() => handleSelectCompany(company)}
                                        >
                                            {company.symbol} - {company.name}
                                        </li>
                                    ))
                                ) : (
                                    <li className="suggestion-item no-results">No companies found</li>
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Type Toggle */}
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <div className="toggle-group">
                            <button
                                type="button"
                                onClick={() => !isReadOnlyMode && setType('Call')}
                                className={`toggle-btn call ${type === 'Call' ? 'active' : ''}`}
                                disabled={isReadOnlyMode}
                            >
                                Call
                            </button>
                            <button
                                type="button"
                                onClick={() => !isReadOnlyMode && setType('Put')}
                                className={`toggle-btn put ${type === 'Put' ? 'active' : ''}`}
                                disabled={isReadOnlyMode}
                            >
                                Put
                            </button>
                        </div>
                    </div>

                    {isRollMode && (
                        <div className="form-group" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Closing Leg</h4>
                            <label className="form-label">Buy To Close Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={buyToClosePrice}
                                onChange={(e) => setBuyToClosePrice(e.target.value)}
                                placeholder="0.00"
                                className="form-input"
                                required={isRollMode}
                            />
                        </div>
                    )}

                    {isRollMode && <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>New Leg</h4>}

                    {/* Strike Price */}
                    <div className="form-group">
                        <label className="form-label">New Strike Price ($)</label>
                        <input
                            type="number"
                            step="0.50"
                            value={strikePrice}
                            onChange={(e) => setStrikePrice(e.target.value)}
                            placeholder="0.00"
                            className="form-input"
                            required
                            disabled={isReadOnlyMode}
                        />
                    </div>

                    {/* Date Field */}
                    <div className="form-group">
                        <label className="form-label">{getDateLabel()}</label>
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
                        <label className="form-label">New Expiration Date</label>
                        <input
                            type="date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            className="form-input"
                            required
                            disabled={isReadOnlyMode}
                        />
                    </div>

                    {/* Premium/Cost/Price */}
                    <div className="form-group">
                        <label className="form-label">{getPriceLabel()}</label>
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

                    {/* Fees */}
                    <div className="form-group">
                        <label className="form-label">Fees ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={fees}
                            onChange={(e) => setFees(e.target.value)}
                            placeholder="0.00"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                        >
                            {getSubmitLabel()}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default NewTradeForm;
