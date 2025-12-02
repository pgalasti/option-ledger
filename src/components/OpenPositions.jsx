import PositionSummary from './PositionSummary';

const OpenPositions = ({ positions, onNewTradeClick }) => {

    if (!positions || positions.length === 0) {
        return (
            <div>
                <h1 style={{ marginLeft: '0.5rem' }}>Open Positions</h1>
                <div className="card card-open-positions" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: '#888' }}>
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
        <div>
            <h1 style={{ marginLeft: '0.5rem' }}>Open Positions</h1>
            <div className="card card-open-positions" style={{ marginTop: '0.5rem' }}>
                {positions.map(position => (
                    <PositionSummary key={position.id} position={position} />
                ))}
            </div>
        </div>
    );
};

export default OpenPositions;
