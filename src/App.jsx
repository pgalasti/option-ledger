import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import NewTradeForm from './components/NewTradeForm';

import { LocalDataPersistence } from './services/storage/LocalDataPersistence';

const storage = new LocalDataPersistence();
const POSITIONS_KEY = 'positions';

function App() {
  const [positions, setPositions] = useState(() => {
    const saved = storage.load(POSITIONS_KEY);
    return saved || [];
  });
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);

  const handleSaveTrade = (newTrade) => {
    const newPositions = [newTrade, ...positions];
    setPositions(newPositions);
    storage.save(POSITIONS_KEY, newPositions);
    setIsNewTradeOpen(false);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setIsNewTradeOpen(true);
  };

  const handleUpdateTrade = (updatedTrade) => {
    const newPositions = positions.map(p => p.id === updatedTrade.id ? updatedTrade : p);
    setPositions(newPositions);
    storage.save(POSITIONS_KEY, newPositions);
    setIsNewTradeOpen(false);
    setEditingPosition(null);
  };

  const handleDeletePosition = (positionId) => {
    const newPositions = positions.filter(p => p.id !== positionId);
    setPositions(newPositions);
    storage.save(POSITIONS_KEY, newPositions);
    if (editingPosition && editingPosition.id === positionId) {
      setEditingPosition(null);
      setIsNewTradeOpen(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar onNewTradeClick={() => {
        setEditingPosition(null);
        setIsNewTradeOpen(true);
      }} />

      <main className="app-main" style={{ paddingTop: '2rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
        <Dashboard
          positions={positions}
          onNewTradeClick={() => {
            setEditingPosition(null);
            setIsNewTradeOpen(true);
          }}
          onEditPosition={handleEditPosition}
          onDeletePosition={handleDeletePosition}
        />
      </main>

      <NewTradeForm
        isOpen={isNewTradeOpen}
        onClose={() => {
          setIsNewTradeOpen(false);
          setEditingPosition(null);
        }}
        onSave={handleSaveTrade}
        onUpdate={handleUpdateTrade}
        initialData={editingPosition}
      />

      <Footer />
    </div>
  );
}

export default App;
