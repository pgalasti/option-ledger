import React, { useState } from 'react';
import OpenPositions from './OpenPositions';
import PositionDetails from './PositionDetails';

const Dashboard = ({ positions, onNewTradeClick }) => {
    const [selectedPosition, setSelectedPosition] = useState(null);

    return (
        <div className="dashboard-grid" style={{ height: '100%' }}>
            <div className="dashboard-left">
                <OpenPositions
                    positions={positions}
                    onNewTradeClick={onNewTradeClick}
                    onPositionClick={setSelectedPosition}
                />
            </div>
            <div className="dashboard-right">
                {selectedPosition && <PositionDetails position={selectedPosition} />}
            </div>
        </div>
    );
};

export default Dashboard;
