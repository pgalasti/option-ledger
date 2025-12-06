import React, { useState, useEffect } from 'react';
import { CompanyService } from '../services/http/CompanyService';

const AnalysisSearch = ({ onSelectSymbol }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length > 1) {
                const results = await CompanyService.searchCompanies(searchTerm);
                setSuggestions(results);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSelect = (company) => {
        setSearchTerm(company.symbol);
        onSelectSymbol(company.symbol);
        setShowSuggestions(false);
    };

    return (
        <div className="analysis-search-container" style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
            <div className="search-input-wrapper glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem' }}>
                <span style={{ fontSize: '1.2rem', marginRight: '0.5rem', opacity: 0.7 }}>🔍</span>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a symbol to analyze..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-main)',
                        fontSize: '1.1rem',
                        width: '100%',
                        outline: 'none'
                    }}
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list glass-panel" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 100,
                    padding: 0,
                    listStyle: 'none'
                }}>
                    {suggestions.map((company) => (
                        <li
                            key={company.symbol}
                            onClick={() => handleSelect(company)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{company.symbol}</span>
                            <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>{company.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AnalysisSearch;
