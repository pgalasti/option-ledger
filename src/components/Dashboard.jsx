import React from 'react';
import OpenPositions from './OpenPositions';

const Dashboard = () => {
    return (
        <div className="dashboard-grid">
            <div className="dashboard-left">
                <OpenPositions />
            </div>
            <div className="dashboard-right">
            </div>
        </div>
    );
};

export default Dashboard;
