import React, { useState } from 'react';
import OpenPositions from './OpenPositions';
import PositionDetails from './PositionDetails';

const Dashboard = ({ positions, onNewTradeClick, onEditPosition, onDeletePosition, onClosePosition, onAssignPosition, onExpirePosition }) => {
    const [selectedPositionId, setSelectedPositionId] = useState(null);

    const selectedPosition = positions.find(p => p.id === selectedPositionId);

    // Clear selection if the selected position is deleted (not found in positions)
    if (selectedPositionId && !selectedPosition) {
        setSelectedPositionId(null);
    }

    return (
        <div className="dashboard-grid" style={{ height: '100%' }}>
            <div className="dashboard-left">
                <OpenPositions
                    positions={positions}
                    onNewTradeClick={onNewTradeClick}
                    onPositionClick={(position) => setSelectedPositionId(position.id)}
                    selectedPositionId={selectedPositionId}
                />
            </div>
            <div className="dashboard-right">
                {selectedPosition && (
                    <PositionDetails
                        position={selectedPosition}
                        onEdit={onEditPosition}
                        onDelete={onDeletePosition}
                        onClose={onClosePosition}
                        onAssign={onAssignPosition}
                        onExpire={onExpirePosition}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
