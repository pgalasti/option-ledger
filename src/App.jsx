import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="app-main" style={{ paddingTop: '2rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <Dashboard />
      </main>

      <Footer />
    </div>
  );
}

export default App;
