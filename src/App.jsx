import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import NewTradeForm from './components/NewTradeForm';

import { LocalDataPersistence } from './services/util/LocalDataPersistence';
import { PositionRepo } from './services/storage/PositionRepo';
import { TransactionRepo, TransactionAction } from './services/storage/TransactionRepo';

const persistence = new LocalDataPersistence();
const repo = new PositionRepo(persistence);
const transactionRepo = new TransactionRepo(persistence);

function App() {
  const [positions, setPositions] = useState(() => {
    return repo.load();
  });
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);

  const handleSaveTrade = (newTrade) => {
    const newPositions = repo.save(newTrade);
    // Record the opening transaction
    transactionRepo.save({
      positionId: newTrade.id,
      action: TransactionAction.OPEN,
      data: newTrade,
      date: newTrade.sellDate
    });
    setPositions(newPositions);
    setIsNewTradeOpen(false);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setIsNewTradeOpen(true);
  };

  const handleUpdateTrade = (updatedTrade) => {
    const newPositions = repo.save(updatedTrade);
    // Update the original transaction to reflect the correction
    transactionRepo.save({
      positionId: updatedTrade.id,
      action: TransactionAction.OPEN,
      data: updatedTrade,
      date: updatedTrade.sellDate
    });
    setPositions(newPositions);
    setIsNewTradeOpen(false);
    setEditingPosition(null);
  };

  const handleDeletePosition = (positionId) => {
    const newPositions = repo.delete(positionId);
    transactionRepo.delete(positionId);
    setPositions(newPositions);
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
