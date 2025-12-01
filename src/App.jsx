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
