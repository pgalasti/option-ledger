import PositionSummary from './PositionSummary';

const OpenPositions = ({ positions }) => {

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
