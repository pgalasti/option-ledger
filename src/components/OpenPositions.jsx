import PositionSummary from './PositionSummary';

const OpenPositions = ({ positions, onNewTradeClick, onPositionClick, selectedPositionId }) => {

    if (!positions || positions.length === 0) {
        return (
            <div className="card card-open-positions" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Open Positions</h1>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No open positions</p>
                    <button
                        onClick={onNewTradeClick}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.5rem' }}
                    >
                        New Trade
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card card-open-positions" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Open Positions</h1>
            <div className="positions-list" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {positions.map(position => (
                    <div key={position.id} onClick={() => onPositionClick(position)} style={{ cursor: 'pointer' }}>
                        <PositionSummary
                            position={position}
                            isSelected={position.id === selectedPositionId}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OpenPositions;
