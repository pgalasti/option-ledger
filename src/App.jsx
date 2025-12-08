import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import History from './components/History';
import NewTradeForm from './components/NewTradeForm';
import Analysis from './components/Analysis';

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
  const [currentView, setCurrentView] = useState('DASHBOARD'); // 'DASHBOARD', 'HISTORY'

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

  const handleExpirePosition = (position) => {
    if (window.confirm(`Are you sure you want to mark the position for ${position.symbol} as expired worthless?`)) {
      // Remove from open positions
      const newPositions = repo.delete(position.id);
      setPositions(newPositions);

      // Record the expired transaction
      transactionRepo.save({
        positionId: position.id,
        action: TransactionAction.EXPIRED,
        data: position,
        date: position.expirationDate || new Date().toISOString()
      });

      if (editingPosition && editingPosition.id === position.id) {
        setEditingPosition(null);
        setIsNewTradeOpen(false);
      }
    }
  };

  const handleRollPositionRequest = (position) => {
    setEditingPosition(position);
    setTradeMode('ROLL');
    setIsNewTradeOpen(true);
  };

  const handleRollPosition = (rollData) => {
    // 1. Close the old position
    const oldPosition = positions.find(p => p.id === rollData.oldPositionId);
    let newPositions = repo.delete(rollData.oldPositionId);

    // Record the ROLL transaction for the old position
    transactionRepo.save({
      positionId: rollData.oldPositionId,
      action: TransactionAction.ROLL,
      data: {
        ...oldPosition,
        priceClosed: rollData.closePrice,
        dateClosed: rollData.closeDate,
        fees: rollData.closeFees
      },
      date: rollData.closeDate
    });

    // 2. Open the new position
    const oldCumulative = oldPosition.cumulativePremium !== undefined
      ? oldPosition.cumulativePremium
      : ((oldPosition.priceSold * 100) - (oldPosition.fees || 0));

    const closeDebit = (rollData.closePrice * 100) + (rollData.closeFees || 0);
    const openCredit = (rollData.newPosition.priceSold * 100) - (rollData.newPosition.fees || 0);
    const newCumulative = oldCumulative - closeDebit + openCredit;

    const newPosition = {
      ...rollData.newPosition,
      id: Date.now(), // Generate new ID
      rollCount: (oldPosition.rollCount || 0) + 1,
      cumulativePremium: newCumulative
    };

    newPositions = repo.save(newPosition);
    setPositions(newPositions);

    // Record the OPEN transaction for the new position
    transactionRepo.save({
      positionId: newPosition.id,
      action: TransactionAction.OPEN,
      data: newPosition,
      date: newPosition.sellDate
    });

    setEditingPosition(null);
    setIsNewTradeOpen(false);
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear ALL data? This action cannot be undone.")) {
      repo.delete('*');
      transactionRepo.delete('*');
      setPositions([]);
      setEditingPosition(null);
      setIsNewTradeOpen(false);
      alert("All data has been cleared.");
    }
  };

  return (
    <div className="app-container">
      <Navbar
        onNewTradeClick={() => {
          setEditingPosition(null);
          setTradeMode('NEW');
          setIsNewTradeOpen(true);
        }}
        setCurrentView={setCurrentView}
        onClearData={handleClearData}
      />

      <main className="app-main" style={{ paddingTop: '2rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
        {currentView === 'DASHBOARD' ? (
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
            onExpirePosition={handleExpirePosition}
            onRollPosition={handleRollPositionRequest}
          />
        ) : currentView === 'HISTORY' ? (
          <History transactionRepo={transactionRepo} />
        ) : (
          <Analysis transactionRepo={transactionRepo} positions={positions} />
        )}
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
        onRoll={handleRollPosition}
        initialData={editingPosition}
        mode={tradeMode}
      />

      <Footer />
    </div>
  );
}

export default App;
