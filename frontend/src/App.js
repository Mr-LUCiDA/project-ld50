import React from 'react';
import './App.css';
import { Ld50Tool } from './components/Ld50Tool';
import { Dna, Github } from 'lucide-react';

function App() {
  return (
    <div className="container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'white' }}>
          <Dna color="#38bdf8" /> LD50 Calc
        </div>
        <a href="https://faizafadilla.my.id" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Portfolio
        </a>
      </nav>

      <header className="header">
        <h1 className="title">LD50 Probit Analyzer</h1>
        <p className="subtitle">
          Toxicology Screening Tool with Abbott's Correction & Log-Probit Regression
        </p>
      </header>

      <main>
        <Ld50Tool />
      </main>

      <footer style={{ textAlign: 'center', marginTop: '4rem', color: '#475569', fontSize: '0.8rem' }}>
        <p>Developed by Faiza Fadilla using Python (SciPy) & ReactJS.</p>
        <p>© 2025 Project.</p>
      </footer>
    </div>
  );
}

export default App;