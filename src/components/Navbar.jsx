import React from 'react';

const Navbar = ({ onNewTradeClick }) => {
    return (
        <nav className="nav-bar glass-panel" style={{ margin: 0, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
            <div className="nav-logo">
                Option-<span style={{ color: 'var(--color-text-main)' }}>Ledger.io</span>
            </div>
            <div className="nav-links">
                <a href="#">History</a>
                <a href="#">Analysis</a>
            </div>
            <button className="btn btn-primary" onClick={onNewTradeClick}>New Trade</button>
        </nav>
    );
};

export default Navbar;
