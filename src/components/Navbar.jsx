import React from 'react';

const Navbar = ({ onNewTradeClick, setCurrentView, onClearData }) => {
    return (
        <nav className="nav-bar glass-panel" style={{ margin: 0, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
            <div className="nav-logo" onClick={() => setCurrentView('DASHBOARD')} style={{ cursor: 'pointer' }}>
                Option-<span style={{ color: 'var(--color-text-main)' }}>Ledger.io</span>
            </div>
            <div className="nav-links">
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('HISTORY'); }}>History</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('ANALYSIS'); }}>Analysis</a>
                <a href="#">Export</a>
                <a className="warning" href="#" onClick={(e) => { e.preventDefault(); onClearData(); }}>Clear Data</a>
            </div>
            <button className="btn btn-primary" onClick={onNewTradeClick}>New Trade</button>
        </nav>
    );
};

export default Navbar;
