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

  const handleSaveTrade = (newTrade) => {
    const newPositions = [newTrade, ...positions];
    setPositions(newPositions);
    storage.save(POSITIONS_KEY, newPositions);
    setIsNewTradeOpen(false);
  };

  return (
    <div className="app-container">
      <Navbar onNewTradeClick={() => setIsNewTradeOpen(true)} />

      <main className="app-main" style={{ paddingTop: '2rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
        <Dashboard positions={positions} onNewTradeClick={() => setIsNewTradeOpen(true)} />
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
