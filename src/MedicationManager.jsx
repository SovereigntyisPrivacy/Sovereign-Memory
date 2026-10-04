import { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Home, Plus, Check, History as HistoryIcon, Pill, RotateCcw, Trash2, Calendar, Link } from 'lucide-react';

export default function MedicationManager({ goHome }) {
  const [view, setView] = useState('active'); 
  const [meds, setMeds] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [medName, setMedName] = useState('');
  const [medInstructions, setMedInstructions] = useState('');
  const [medDoses, setMedDoses] = useState('');
  
  const [isCombo, setIsCombo] = useState(false);
  const [b1Name, setB1Name] = useState('5mg');
  const [b2Name, setB2Name] = useState('2mg');
  const [b1Doses, setB1Doses] = useState('');
  const [b2Doses, setB2Doses] = useState('');

  useEffect(() => {
    const savedMeds = localStorage.getItem('sovereign_meds');
    const savedHistory = localStorage.getItem('sovereign_meds_history');
    if (savedMeds) setMeds(JSON.parse(savedMeds));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const listener = CapApp.addListener('backButton', () => {
      if (view === 'active' && typeof goHome === 'function') goHome();
      else setView('active');
    });
    return () => { listener.remove(); };
  }, [view, goHome]);

  const saveMeds = (updated) => { setMeds(updated); localStorage.setItem('sovereign_meds', JSON.stringify(updated)); };
  const saveHistory = (updated) => { setHistory(updated); localStorage.setItem('sovereign_meds_history', JSON.stringify(updated)); };

  const addMedication = () => {
    if (!medName.trim()) return alert("Please enter a medication name.");
    const newMed = { 
      id: Date.now(), name: medName, instructions: medInstructions, isCombo,
      doses: !isCombo ? (parseInt(medDoses) || 0) : null,
      bottle1: isCombo ? { name: b1Name, doses: parseInt(b1Doses) || 0 } : null,
      bottle2: isCombo ? { name: b2Name, doses: parseInt(b2Doses) || 0 } : null
    };
    saveMeds([...meds, newMed]);
    setMedName(''); setMedInstructions(''); setMedDoses(''); setIsCombo(false); setB1Name('5mg'); setB2Name('2mg'); setB1Doses(''); setB2Doses('');
    setView('active');
  };

  const deleteMed = (id) => { if (window.confirm("Remove this medication from your active list?")) saveMeds(meds.filter(m => m.id !== id)); };

  const takeDose = (med) => {
    const updatedMeds = meds.map(m => {
      if (m.id === med.id) {
        if (m.isCombo) return { ...m, bottle1: { ...m.bottle1, doses: Math.max(0, m.bottle1.doses - 1) }, bottle2: { ...m.bottle2, doses: Math.max(0, m.bottle2.doses - 1) } };
        return { ...m, doses: Math.max(0, m.doses - 1) };
      }
      return m;
    });
    saveMeds(updatedMeds);
    saveHistory([{ id: Date.now(), medId: med.id, name: med.name, timestamp: Date.now() }, ...history]);
  };

  const handleRefill = (med, target) => {
    const namePrompt = target === 'bottle1' ? med.bottle1.name : (target === 'bottle2' ? med.bottle2.name : med.name);
    const amount = window.prompt(`How many pills are you adding to ${namePrompt}?`);
    if (!amount || isNaN(amount)) return;
    const updated = meds.map(m => {
      if (m.id === med.id) {
        if (target === 'bottle1') return { ...m, bottle1: { ...m.bottle1, doses: m.bottle1.doses + parseInt(amount) } };
        if (target === 'bottle2') return { ...m, bottle2: { ...m.bottle2, doses: m.bottle2.doses + parseInt(amount) } };
        return { ...m, doses: m.doses + parseInt(amount) };
      }
      return m;
    });
    saveMeds(updated);
  };

  const groupHistoryByDate = () => {
    const groups = {};
    history.forEach(log => {
      const dateStr = new Date(log.timestamp).toLocaleDateString();
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(log);
    });
    return groups;
  };
  const groupedHistory = groupHistoryByDate();

  const renderActive = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, overflowY: 'auto', paddingBottom: '24px' }}>
      {meds.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '24px', marginTop: '40px' }}>No medications added.</p> : meds.map(med => (
        <div key={med.id} style={{ backgroundColor: '#111', border: '3px solid #333', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFF', lineHeight: '1.2' }}>{med.name}</div>
          {med.instructions && <div style={{ fontSize: '24px', color: '#FF9500', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '12px' }}>{med.instructions}</div>}
          
          {med.isCombo ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, backgroundColor: '#222', border: '2px solid #555', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '20px', color: '#CCC', fontWeight: 'bold' }}>{med.bottle1.name}</div>
                <div style={{ fontSize: '42px', fontWeight: 'bold', color: med.bottle1.doses <= 5 ? '#FF3B30' : '#FFF' }}>{med.bottle1.doses}</div>
                <button onClick={() => handleRefill(med, 'bottle1')} style={{ width: '100%', backgroundColor: '#112244', border: '2px solid #3B82F6', borderRadius: '12px', padding: '12px', color: '#3B82F6', fontSize: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><RotateCcw size={20} /> Refill</button>
              </div>
              <div style={{ flex: 1, backgroundColor: '#222', border: '2px solid #555', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '20px', color: '#CCC', fontWeight: 'bold' }}>{med.bottle2.name}</div>
                <div style={{ fontSize: '42px', fontWeight: 'bold', color: med.bottle2.doses <= 5 ? '#FF3B30' : '#FFF' }}>{med.bottle2.doses}</div>
                <button onClick={() => handleRefill(med, 'bottle2')} style={{ width: '100%', backgroundColor: '#112244', border: '2px solid #3B82F6', borderRadius: '12px', padding: '12px', color: '#3B82F6', fontSize: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><RotateCcw size={20} /> Refill</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', border: '2px solid #555', borderRadius: '20px', padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <div style={{ fontSize: '20px', color: '#CCC', fontWeight: 'bold' }}>Remaining</div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: med.doses <= 5 ? '#FF3B30' : '#FFF' }}>{med.doses}</div>
              </div>
              <button onClick={() => handleRefill(med, 'doses')} style={{ backgroundColor: '#112244', border: '3px solid #3B82F6', borderRadius: '16px', padding: '20px', color: '#3B82F6', fontSize: '22px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}><RotateCcw size={28} /> Refill</button>
            </div>
          )}

          <button onClick={() => takeDose(med)} style={{ width: '100%', backgroundColor: '#2E7D32', border: 'none', borderRadius: '20px', padding: '24px', color: '#FFF', fontSize: '28px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <Check size={36} /> Take {med.isCombo ? 'Combo' : 'Dose'}
          </button>
          
          <button onClick={() => deleteMed(med.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#666', fontSize: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <Trash2 size={24} /> Remove Med
          </button>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setView('active')} style={{ flex: 1, backgroundColor: view === 'active' ? '#FF9500' : '#222', color: view === 'active' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><Pill size={24} /> My Meds</button>
        <button onClick={() => setView('history')} style={{ flex: 1, backgroundColor: view === 'history' ? '#FF9500' : '#222', color: view === 'history' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><HistoryIcon size={24} /> History</button>
        <button onClick={() => setView('new')} style={{ flex: 1, backgroundColor: view === 'new' ? '#FF9500' : '#222', color: view === 'new' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><Plus size={24} /> Add Med</button>
      </div>

      {view === 'active' && renderActive()}

      {view === 'history' && (
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
          {Object.keys(groupedHistory).length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '24px' }}>No history yet.</p> : 
            Object.keys(groupedHistory).map(date => (
              <div key={date} style={{ backgroundColor: '#111', border: '2px solid #444', borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#333', borderBottom: '2px solid #FF9500', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={28} color="#FF9500" />
                  <div style={{ color: '#FFF', fontSize: '26px', fontWeight: 'bold' }}>{date}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {groupedHistory[date].map(log => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #222' }}>
                      <div style={{ fontSize: '24px', color: '#FFF', fontWeight: 'bold' }}>{log.name}</div>
                      <div style={{ fontSize: '22px', color: '#AAA' }}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {view === 'new' && (
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
          <div style={{ backgroundColor: '#111', border: '3px solid #333', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ color: '#FF9500', margin: '0 0 8px 0', fontSize: '32px' }}>Add Medication</h2>
            
            <button onClick={() => setIsCombo(!isCombo)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: isCombo ? '#2E7D32' : '#222', border: isCombo ? 'none' : '2px solid #555', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '22px', fontWeight: 'bold' }}>
              <Link size={28} /> {isCombo ? "Combo Pill Mode ON" : "Turn On Combo Mode"}
            </button>

            <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="Name (e.g. Blood Pressure)" style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '26px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none', boxSizing: 'border-box' }} />
            <textarea value={medInstructions} onChange={(e) => setMedInstructions(e.target.value)} placeholder="Instructions (e.g. Take daily in AM)" style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '26px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none', boxSizing: 'border-box', minHeight: '120px', resize: 'none' }} />
            
            {isCombo ? (
              <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '16px', border: '2px dashed #FF9500', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ color: '#FF9500', fontSize: '20px', fontWeight: 'bold' }}>Bottle 1</div>
                <input value={b1Name} onChange={(e) => setB1Name(e.target.value)} placeholder="Name (e.g. 5mg)" style={{ width: '100%', backgroundColor: '#111', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none', boxSizing: 'border-box' }} />
                <input type="number" value={b1Doses} onChange={(e) => setB1Doses(e.target.value)} placeholder="Total Pills Remaining..." style={{ width: '100%', backgroundColor: '#111', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none', boxSizing: 'border-box' }} />
                
                <div style={{ borderBottom: '2px dashed #444', margin: '8px 0' }} />
                
                <div style={{ color: '#FF9500', fontSize: '20px', fontWeight: 'bold' }}>Bottle 2</div>
                <input value={b2Name} onChange={(e) => setB2Name(e.target.value)} placeholder="Name (e.g. 2mg)" style={{ width: '100%', backgroundColor: '#111', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none', boxSizing: 'border-box' }} />
                <input type="number" value={b2Doses} onChange={(e) => setB2Doses(e.target.value)} placeholder="Total Pills Remaining..." style={{ width: '100%', backgroundColor: '#111', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ) : (
              <input type="number" value={medDoses} onChange={(e) => setMedDoses(e.target.value)} placeholder="Total Pills remaining..." style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '26px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none', boxSizing: 'border-box' }} />
            )}
            
            <button onClick={addMedication} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '28px', fontWeight: 'bold', border: 'none', borderRadius: '20px', padding: '24px', marginTop: '12px' }}>Save Medication</button>
          </div>
        </div>
      )}
    </div>
  );
}
