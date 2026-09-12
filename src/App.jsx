import { useState } from 'react';
import TarotReader from './TarotReader';
import { Home, CheckSquare, Phone, Clock, Brain, Hash, Lock } from 'lucide-react';
import BrainGamesHub from './BrainGamesHub';
import DailyTasks from "./DailyTasks";
import NumerologyWorkbench from './NumerologyWorkbench';
import MedicationManager from './MedicationManager';
import SecureJournal from './SecureJournal';
import FamilyDirectory from './FamilyDirectory';
import './index.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const goHome = () => setCurrentScreen('menu');

  return (
    <div className="app-container">
      <header className="top-bar">
        {currentScreen !== 'menu' ? (
          <button onClick={goHome} className="primary-btn" style={{ width: 'auto', padding: '16px 24px' }}>
            <Home size={36} color="#000" />
            GO HOME
          </button>
        ) : (
          <h1 style={{ fontSize: '32px' }}>Sovereign Memory</h1>
        )}
      </header>

      <main>
        {currentScreen === 'menu' && (
          <>
            {/* HER PERSONAL MESSAGE BLOCK */}
            <div style={{ 
              textAlign: 'center', 
              padding: '32px 24px', 
              marginBottom: '32px',
              backgroundColor: '#1a1a1a',
              border: '6px solid #FFD700',
              borderRadius: '24px',
              boxShadow: '0 8px 24px rgba(255, 59, 48, 0.3)'
            }}>
              <h2 style={{ 
                fontSize: '48px', 
                fontWeight: '900', 
                color: '#FF3B30', 
                textShadow: '3px 3px 0px #FFD700',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}>
                ❤️❤️ I love you mom. ❤️❤️
              </h2>
              <h3 style={{ 
                fontSize: '32px', 
                color: '#FFD700', 
                marginBottom: '20px',
                fontStyle: 'italic',
                fontWeight: 'bold'
              }}>
                Forever and always. ✨
              </h3>
              <p style={{ 
                fontSize: '24px', 
                color: '#FFF', 
                lineHeight: '1.5',
                fontWeight: '500'
              }}>
                May this help you bring joy back to your interests. 🌻💛
              </p>
            </div>

            <div className="grid-menu">
              <button onClick={() => setCurrentScreen('tasks')}>
                <CheckSquare size={48} color="var(--accent)" />
                Daily Tasks
              </button>
              
              <button onClick={() => setCurrentScreen('numerology')}>
                <Hash size={48} color="var(--accent)" />
                Numerology
              </button>

              <button onClick={() => setCurrentScreen('game')}>
                <Brain size={48} color="var(--accent)" />
                Brain Games
              </button>

              <button onClick={() => setCurrentScreen('meds')}>
                <Clock size={48} color="var(--accent)" />
                Medications
              </button>

              <button onClick={() => setCurrentScreen('journal')}>
                <Lock size={48} color="var(--accent)" />
                Private Journal
              </button>

              <button onClick={() => setCurrentScreen('contacts')}>
                <Phone size={48} color="var(--accent)" />
                Call Family
              </button>
            </div>
          </>
        )}

        {/* PLACEHOLDERS FOR REMAINING FEATURES */}
        {currentScreen === "tasks" && <DailyTasks />}
        
        {/* ACTIVE ROUTES */}
        {currentScreen === 'game' && <BrainGamesHub />}
        {currentScreen === 'numerology' && <NumerologyWorkbench />}
        {currentScreen === 'meds' && <MedicationManager />}
        {currentScreen === 'journal' && <SecureJournal />}
        {currentScreen === 'contacts' && <FamilyDirectory />}
      </main>
    </div>
  );
}

export default App;
