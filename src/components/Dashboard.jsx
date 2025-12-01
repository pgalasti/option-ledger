import React from 'react';
import OpenPositions from './OpenPositions';

const Dashboard = ({ positions }) => {
    return (
        <div className="dashboard-grid">
            <div className="dashboard-left">
                <OpenPositions positions={positions} />
            </div>
            <div className="dashboard-right">
            </div>
        </div>
    );
};

export default Dashboard;
