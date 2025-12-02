import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import NewTradeForm from './components/NewTradeForm';
import { positions as initialPositions } from './dummyData';

function App() {
  const [positions, setPositions] = useState(initialPositions);
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);

  const handleSaveTrade = (newTrade) => {
    setPositions([newTrade, ...positions]);
    // I'll need to write a service to persist the trade here.
    // I'll need to make it generic like interface so it can use for local storage or a back-end API
    setIsNewTradeOpen(false);
  };

  return (
    <div className="app-container">
      <Navbar onNewTradeClick={() => setIsNewTradeOpen(true)} />

      <main className="app-main" style={{ paddingTop: '2rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <Dashboard positions={positions} />
      </main>

      <NewTradeForm
        isOpen={isNewTradeOpen}
        onClose={() => setIsNewTradeOpen(false)}
        onSave={handleSaveTrade}
      />

      <Footer />
    </div>
  );
}

export default App;
