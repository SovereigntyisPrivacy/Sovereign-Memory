import { useState } from 'react';
import { Shield, CheckSquare, Hash, Brain, Clock, Lock, Phone, Layers } from 'lucide-react';
import DailyTasks from './DailyTasks';
import NumerologyWorkbench from './NumerologyWorkbench';
import MedicationManager from './MedicationManager';
import SecureJournal from './SecureJournal';
import FamilyDirectory from './FamilyDirectory';
import TarotReader from './TarotReader';
import BrainGames from './BrainGames';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '16px', boxSizing: 'border-box' }}>
      
      {activeTab === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Shield size={64} color="var(--accent)" style={{ marginBottom: '12px' }} />
            <h1 style={{ fontSize: '36px', fontWeight: '900', margin: 0, color: '#FFF' }}>Sovereign Tools</h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '8px' }}>Private & Secure Offline Suite</p>
          </div>

          <button onClick={() => setActiveTab('tasks')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <CheckSquare size={32} color="var(--accent)" /> Daily Tasks
          </button>
          
          <button onClick={() => setActiveTab('numerology')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <Hash size={32} color="var(--accent)" /> Numerology
          </button>

          <button onClick={() => setActiveTab('tarot')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <Layers size={32} color="var(--accent)" /> Tarot Reader
          </button>

          <button onClick={() => setActiveTab('brain')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <Brain size={32} color="var(--accent)" /> Brain Games
          </button>

          <button onClick={() => setActiveTab('meds')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <Clock size={32} color="var(--accent)" /> Medications
          </button>

          <button onClick={() => setActiveTab('journal')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <Lock size={32} color="var(--accent)" /> Private Journal
          </button>

          <button onClick={() => setActiveTab('family')} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '16px', padding: '24px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <Phone size={32} color="var(--accent)" /> Call Family
          </button>
        </div>
      )}

      {activeTab === 'tasks' && <DailyTasks goHome={() => setActiveTab('home')} />}
      {activeTab === 'numerology' && <NumerologyWorkbench goHome={() => setActiveTab('home')} />}
      {activeTab === 'tarot' && <TarotReader goHome={() => setActiveTab('home')} />}
      {activeTab === 'brain' && <BrainGames goHome={() => setActiveTab('home')} />}
      {activeTab === 'meds' && <MedicationManager goHome={() => setActiveTab('home')} />}
      {activeTab === 'journal' && <SecureJournal goHome={() => setActiveTab('home')} />}
      {activeTab === 'family' && <FamilyDirectory goHome={() => setActiveTab('home')} />}

    </div>
  );
}
