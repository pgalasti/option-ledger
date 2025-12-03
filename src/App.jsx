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
  const [tradeMode, setTradeMode] = useState('NEW'); // 'NEW', 'EDIT', 'CLOSE'

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
    setTradeMode('EDIT');
    setIsNewTradeOpen(true);
  };

  const handleClosePositionRequest = (position) => {
    setEditingPosition(position);
    setTradeMode('CLOSE');
    setIsNewTradeOpen(true);
  };

  const handleClosePosition = (closeData) => {
    // Remove from open positions
    const newPositions = repo.delete(closeData.id);
    setPositions(newPositions);

    // Record the close transaction
    transactionRepo.save({
      positionId: closeData.id,
      action: TransactionAction.CLOSE,
      data: closeData,
      date: closeData.dateClosed
    });

    setIsNewTradeOpen(false);
    setEditingPosition(null);
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

  const handleAssignPositionRequest = (position) => {
    setEditingPosition(position);
    setTradeMode('ASSIGN');
    setIsNewTradeOpen(true);
  };

  const handleAssignPosition = (assignmentData) => {
    // Remove from open positions
    const newPositions = repo.delete(assignmentData.id);
    setPositions(newPositions);

    // Record the assigned transaction
    transactionRepo.save({
      positionId: assignmentData.id,
      action: TransactionAction.ASSIGNED,
      data: assignmentData,
      date: assignmentData.dateAssigned || new Date().toISOString()
    });

    setEditingPosition(null);
    setIsNewTradeOpen(false);
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
        setTradeMode('NEW');
        setIsNewTradeOpen(true);
      }} />

      <main className="app-main" style={{ paddingTop: '2rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
        <Dashboard
          positions={positions}
          onNewTradeClick={() => {
            setEditingPosition(null);
            setTradeMode('NEW');
            setIsNewTradeOpen(true);
          }}
          onEditPosition={handleEditPosition}
          onDeletePosition={handleDeletePosition}
          onClosePosition={handleClosePositionRequest}
          onAssignPosition={handleAssignPositionRequest}
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
        onClosePosition={handleClosePosition}
        onAssign={handleAssignPosition}
        initialData={editingPosition}
        mode={tradeMode}
      />

      <Footer />
    </div>
  );
}

export default App;
