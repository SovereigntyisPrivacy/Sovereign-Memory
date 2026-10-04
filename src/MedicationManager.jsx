import { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Home, Plus, Check, History as HistoryIcon, Pill, RotateCcw, Trash2, Calendar, AlarmClock, AlertTriangle } from 'lucide-react';

export default function MedicationManager({ goHome }) {
  const [view, setView] = useState('active'); 
  const [meds, setMeds] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [medName, setMedName] = useState('');
  const [medMg, setMedMg] = useState('');
  const [medPrescriber, setMedPrescriber] = useState('');
  const [medPurpose, setMedPurpose] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medTime, setMedTime] = useState('');
  
  const [comboMode, setComboMode] = useState('none');
  const [b1Name, setB1Name] = useState('');
  const [b2Name, setB2Name] = useState('');
  const [b3Name, setB3Name] = useState('');
  const [b1Doses, setB1Doses] = useState('');
  const [b2Doses, setB2Doses] = useState('');
  const [b3Doses, setB3Doses] = useState('');

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
      id: Date.now(), name: medName, type: comboMode,
      mg: medMg, prescriber: medPrescriber, purpose: medPurpose,
      dosage: medDosage, frequency: medFrequency, time: medTime,
      doses: (comboMode === 'none' || comboMode === 'mixed3') ? (parseInt(b1Doses) || 0) : null,
      bottle1: comboMode !== 'none' ? { name: b1Name || 'Pill 1', doses: parseInt(b1Doses) || 0 } : null,
      bottle2: comboMode !== 'none' ? { name: b2Name || 'Pill 2', doses: parseInt(b2Doses) || 0 } : null,
      bottle3: (comboMode === 'combo3' || comboMode === 'mixed3') ? { name: b3Name || 'Pill 3', doses: parseInt(b3Doses) || 0 } : null
    };
    saveMeds([...meds, newMed]);
    setMedName(''); setMedMg(''); setMedPrescriber(''); setMedPurpose(''); setMedDosage(''); setMedFrequency(''); setMedTime('');
    setComboMode('none'); setB1Name(''); setB2Name(''); setB3Name(''); setB1Doses(''); setB2Doses(''); setB3Doses('');
    setView('active');
  };

  const deleteMed = (id) => { if (window.confirm("Remove this medication?")) saveMeds(meds.filter(m => m.id !== id)); };

  const takeDose = (med) => {
    const takeAmount = parseInt(med.dosage) || 1; 
    const updatedMeds = meds.map(m => {
      if (m.id === med.id) {
        if (m.type === 'combo3') return { ...m, bottle1: { ...m.bottle1, doses: Math.max(0, m.bottle1.doses - takeAmount) }, bottle2: { ...m.bottle2, doses: Math.max(0, m.bottle2.doses - takeAmount) }, bottle3: { ...m.bottle3, doses: Math.max(0, m.bottle3.doses - takeAmount) } };
        if (m.type === 'combo2') return { ...m, bottle1: { ...m.bottle1, doses: Math.max(0, m.bottle1.doses - takeAmount) }, bottle2: { ...m.bottle2, doses: Math.max(0, m.bottle2.doses - takeAmount) } };
        return { ...m, doses: Math.max(0, m.doses - takeAmount) };
      }
      return m;
    });
    saveMeds(updatedMeds);
    saveHistory([{ id: Date.now(), medId: med.id, name: med.name, timestamp: Date.now() }, ...history]);
  };

  const handleRefill = (med, target) => {
    const namePrompt = target === 'bottle1' ? med.bottle1.name : (target === 'bottle2' ? med.bottle2.name : (target === 'bottle3' ? med.bottle3.name : med.name));
    const amount = window.prompt(`How many pills are you adding to ${namePrompt}?`);
    if (!amount || isNaN(amount)) return;
    const updated = meds.map(m => {
      if (m.id === med.id) {
        if (target === 'bottle1') return { ...m, bottle1: { ...m.bottle1, doses: m.bottle1.doses + parseInt(amount) } };
        if (target === 'bottle2') return { ...m, bottle2: { ...m.bottle2, doses: m.bottle2.doses + parseInt(amount) } };
        if (target === 'bottle3') return { ...m, bottle3: { ...m.bottle3, doses: m.bottle3.doses + parseInt(amount) } };
        return { ...m, doses: m.doses + parseInt(amount) };
      }
      return m;
    });
    saveMeds(updated);
  };

  const setNativeAlarm = (name, timeStr) => {
    if (!timeStr) return;
    const [hour, min] = timeStr.split(':');
    const intentUrl = `intent://#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${parseInt(hour)};i.android.intent.extra.alarm.MINUTES=${parseInt(min)};S.android.intent.extra.alarm.MESSAGE=Take%20${encodeURIComponent(name)};end`;
    window.location.href = intentUrl;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const val = parseInt(h);
    const ampm = val >= 12 ? 'PM' : 'AM';
    const hr12 = val % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
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
      {meds.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '24px', marginTop: '40px' }}>No medications added.</p> : meds.map(med => {
        const isMultiBottle = med.type === 'combo2' || med.type === 'combo3';
        const isMixedBottle = med.type === 'mixed3';
        
        // Math Engine: Check if ANY bottle is below 10 pills
        const lowWarnings = [];
        if (isMultiBottle) {
           if (med.bottle1.doses <= 10) lowWarnings.push(med.bottle1.name);
           if (med.bottle2.doses <= 10) lowWarnings.push(med.bottle2.name);
           if (med.type === 'combo3' && med.bottle3.doses <= 10) lowWarnings.push(med.bottle3.name);
        } else {
           if (med.doses <= 10) lowWarnings.push(med.name);
        }

        return (
        <div key={med.id} style={{ backgroundColor: '#111', border: lowWarnings.length > 0 ? '4px solid #FF3B30' : '3px solid #333', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFF', lineHeight: '1.2' }}>{med.name} {med.mg && <span style={{fontSize: '24px', color: '#CCC'}}>({med.mg})</span>}</div>
              {med.purpose && <div style={{ fontSize: '22px', color: '#AAA', fontStyle: 'italic', marginTop: '4px' }}>For: {med.purpose}</div>}
              {med.prescriber && <div style={{ fontSize: '20px', color: '#888', marginTop: '4px' }}>Prescribed by {med.prescriber}</div>}
            </div>
          </div>

          <div style={{ backgroundColor: '#222', borderRadius: '16px', padding: '16px', borderLeft: '4px solid #FF9500', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <div style={{ fontSize: '24px', color: '#FFF', fontWeight: 'bold' }}>Take {med.dosage || '1'} {med.frequency && `• ${med.frequency}`}</div>
             {med.time && <div style={{ fontSize: '22px', color: '#FF9500', fontWeight: 'bold' }}>at {formatTime(med.time)}</div>}
          </div>

          {med.time && (
            <button onClick={() => setNativeAlarm(med.name, med.time)} style={{ backgroundColor: '#112244', border: '3px solid #3B82F6', borderRadius: '16px', padding: '20px', color: '#3B82F6', fontSize: '24px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
              <AlarmClock size={32} /> Set Phone Alarm
            </button>
          )}

          {lowWarnings.length > 0 && (
             <div style={{ backgroundColor: '#441111', border: '2px solid #FF3B30', borderRadius: '16px', padding: '16px', color: '#FF3B30', fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={28} /> Low Supply: {lowWarnings.join(', ')}
             </div>
          )}
          
          {isMultiBottle ? (
            <div style={{ display: 'grid', gridTemplateColumns: med.type === 'combo3' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ backgroundColor: '#222', border: '2px solid #555', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', color: '#CCC', fontWeight: 'bold', minHeight: '44px', display: 'flex', alignItems: 'center' }}>{med.bottle1.name}</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: med.bottle1.doses <= 10 ? '#FF3B30' : '#FFF' }}>{med.bottle1.doses}</div>
                <button onClick={() => handleRefill(med, 'bottle1')} style={{ width: '100%', backgroundColor: '#112244', border: '2px solid #3B82F6', borderRadius: '12px', padding: '12px', color: '#3B82F6', fontSize: '18px', fontWeight: 'bold' }}><RotateCcw size={18} /> Refill</button>
              </div>
              <div style={{ backgroundColor: '#222', border: '2px solid #555', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', color: '#CCC', fontWeight: 'bold', minHeight: '44px', display: 'flex', alignItems: 'center' }}>{med.bottle2.name}</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: med.bottle2.doses <= 10 ? '#FF3B30' : '#FFF' }}>{med.bottle2.doses}</div>
                <button onClick={() => handleRefill(med, 'bottle2')} style={{ width: '100%', backgroundColor: '#112244', border: '2px solid #3B82F6', borderRadius: '12px', padding: '12px', color: '#3B82F6', fontSize: '18px', fontWeight: 'bold' }}><RotateCcw size={18} /> Refill</button>
              </div>
              {med.type === 'combo3' && (
                <div style={{ backgroundColor: '#222', border: '2px solid #555', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', color: '#CCC', fontWeight: 'bold', minHeight: '44px', display: 'flex', alignItems: 'center' }}>{med.bottle3.name}</div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: med.bottle3.doses <= 10 ? '#FF3B30' : '#FFF' }}>{med.bottle3.doses}</div>
                  <button onClick={() => handleRefill(med, 'bottle3')} style={{ width: '100%', backgroundColor: '#112244', border: '2px solid #3B82F6', borderRadius: '12px', padding: '12px', color: '#3B82F6', fontSize: '18px', fontWeight: 'bold' }}><RotateCcw size={18} /> Refill</button>
                </div>
              )}
            </div>
          ) : isMixedBottle ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', border: '2px solid #555', borderRadius: '20px', padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ color: '#FF9500', fontWeight: 'bold', fontSize: '20px' }}>Bottle Contains:</div>
                <div style={{ color: '#CCC', fontSize: '20px' }}>• {med.bottle1?.name}</div>
                <div style={{ color: '#CCC', fontSize: '20px' }}>• {med.bottle2?.name}</div>
                <div style={{ color: '#CCC', fontSize: '20px' }}>• {med.bottle3?.name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: med.doses <= 10 ? '#FF3B30' : '#FFF' }}>{med.doses}</div>
                <button onClick={() => handleRefill(med, 'doses')} style={{ backgroundColor: '#112244', border: '3px solid #3B82F6', borderRadius: '12px', padding: '12px', color: '#3B82F6', fontSize: '18px', fontWeight: 'bold' }}><RotateCcw size={20} /> Refill</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', border: '2px solid #555', borderRadius: '20px', padding: '16px' }}>
              <div style={{ fontSize: '20px', color: '#CCC', fontWeight: 'bold' }}>Inventory Remaining</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: med.doses <= 10 ? '#FF3B30' : '#FFF' }}>{med.doses}</div>
                <button onClick={() => handleRefill(med, 'doses')} style={{ backgroundColor: '#112244', border: '3px solid #3B82F6', borderRadius: '16px', padding: '20px', color: '#3B82F6', fontSize: '22px', fontWeight: 'bold' }}><RotateCcw size={28} /></button>
              </div>
            </div>
          )}

          <button onClick={() => takeDose(med)} style={{ width: '100%', backgroundColor: '#2E7D32', border: 'none', borderRadius: '20px', padding: '24px', color: '#FFF', fontSize: '28px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <Check size={36} /> Log Dose
          </button>
          
          <button onClick={() => deleteMed(med.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#666', fontSize: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <Trash2 size={24} /> Remove Med
          </button>
        </div>
      )})}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setView('active')} style={{ flex: 1, backgroundColor: view === 'active' ? '#FF9500' : '#222', color: view === 'active' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><Pill size={24} /> My Meds</button>
        <button onClick={() => setView('history')} style={{ flex: 1, backgroundColor: view === 'history' ? '#FF9500' : '#222', color: view === 'history' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><HistoryIcon size={24} /> History</button>
        <button onClick={() => setView('new')} style={{ flex: 1, backgroundColor: view === 'new' ? '#FF9500' : '#222', color: view === 'new' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><Plus size={24} /> Add Med</button>
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
          <div style={{ backgroundColor: '#111', border: '3px solid #333', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#FF9500', margin: '0 0 8px 0', fontSize: '32px' }}>Add Medication</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <button onClick={() => setComboMode('none')} style={{ backgroundColor: comboMode === 'none' ? '#FF9500' : '#222', color: comboMode === 'none' ? '#000' : '#FFF', border: '2px solid #555', borderRadius: '12px', padding: '16px 8px', fontSize: '18px', fontWeight: 'bold' }}>1 Pill<br/><span style={{fontSize:'14px', fontWeight:'normal'}}>(1 Bottle)</span></button>
              <button onClick={() => setComboMode('mixed3')} style={{ backgroundColor: comboMode === 'mixed3' ? '#FF9500' : '#222', color: comboMode === 'mixed3' ? '#000' : '#FFF', border: '2px solid #555', borderRadius: '12px', padding: '16px 8px', fontSize: '18px', fontWeight: 'bold' }}>3 Pills<br/><span style={{fontSize:'14px', fontWeight:'normal'}}>(1 Mixed Bottle)</span></button>
              <button onClick={() => setComboMode('combo2')} style={{ backgroundColor: comboMode === 'combo2' ? '#FF9500' : '#222', color: comboMode === 'combo2' ? '#000' : '#FFF', border: '2px solid #555', borderRadius: '12px', padding: '16px 8px', fontSize: '18px', fontWeight: 'bold' }}>2 Pills<br/><span style={{fontSize:'14px', fontWeight:'normal'}}>(2 Bottles)</span></button>
              <button onClick={() => setComboMode('combo3')} style={{ backgroundColor: comboMode === 'combo3' ? '#FF9500' : '#222', color: comboMode === 'combo3' ? '#000' : '#FFF', border: '2px solid #555', borderRadius: '12px', padding: '16px 8px', fontSize: '18px', fontWeight: 'bold' }}>3 Pills<br/><span style={{fontSize:'14px', fontWeight:'normal'}}>(3 Bottles)</span></button>
            </div>

            <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="Medication Name" style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none' }} />
            <input value={medMg} onChange={(e) => setMedMg(e.target.value)} placeholder="How many mg?" style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none' }} />
            <input value={medPrescriber} onChange={(e) => setMedPrescriber(e.target.value)} placeholder="Who prescribed it?" style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none' }} />
            <input value={medPurpose} onChange={(e) => setMedPurpose(e.target.value)} placeholder="What is it for?" style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none' }} />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <input type="number" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} placeholder="Qty to take?" style={{ flex: 1, backgroundColor: '#222', color: '#FFF', fontSize: '20px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none' }} />
              <input value={medFrequency} onChange={(e) => setMedFrequency(e.target.value)} placeholder="How often?" style={{ flex: 1, backgroundColor: '#222', color: '#FFF', fontSize: '20px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#222', border: '2px solid #555', borderRadius: '16px', padding: '8px 16px' }}>
              <div style={{ color: '#CCC', fontSize: '20px', fontWeight: 'bold' }}>Time:</div>
              <input type="time" value={medTime} onChange={(e) => setMedTime(e.target.value)} style={{ flex: 1, backgroundColor: 'transparent', color: '#FFF', fontSize: '24px', padding: '12px 0', border: 'none', outline: 'none' }} />
            </div>
            
            {comboMode === 'mixed3' ? (
              <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '16px', border: '2px dashed #FF9500', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={{ color: '#FF9500', fontSize: '20px', fontWeight: 'bold' }}>What's inside?</div>
                <input value={b1Name} onChange={(e) => setB1Name(e.target.value)} placeholder="Pill 1 Name" style={{ width: '100%', backgroundColor: '#111', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                <input value={b2Name} onChange={(e) => setB2Name(e.target.value)} placeholder="Pill 2 Name" style={{ width: '100%', backgroundColor: '#111', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                <input value={b3Name} onChange={(e) => setB3Name(e.target.value)} placeholder="Pill 3 Name" style={{ width: '100%', backgroundColor: '#111', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                <div style={{ borderBottom: '2px dashed #444', margin: '4px 0' }} />
                <input type="number" value={b1Doses} onChange={(e) => setB1Doses(e.target.value)} placeholder="Total Pills in Bottle..." style={{ width: '100%', backgroundColor: '#111', color: '#FFF', fontSize: '22px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
              </div>
            ) : comboMode === 'combo2' || comboMode === 'combo3' ? (
              <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '16px', border: '2px dashed #FF9500', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={{ color: '#FF9500', fontSize: '20px', fontWeight: 'bold' }}>Bottle 1</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={b1Name} onChange={(e) => setB1Name(e.target.value)} placeholder="Name" style={{ flex: 1, backgroundColor: '#111', color: '#FFF', fontSize: '20px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                  <input type="number" value={b1Doses} onChange={(e) => setB1Doses(e.target.value)} placeholder="Qty..." style={{ width: '100px', backgroundColor: '#111', color: '#FFF', fontSize: '20px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                </div>
                
                <div style={{ borderBottom: '2px dashed #444', margin: '4px 0' }} />
                
                <div style={{ color: '#FF9500', fontSize: '20px', fontWeight: 'bold' }}>Bottle 2</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={b2Name} onChange={(e) => setB2Name(e.target.value)} placeholder="Name" style={{ flex: 1, backgroundColor: '#111', color: '#FFF', fontSize: '20px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                  <input type="number" value={b2Doses} onChange={(e) => setB2Doses(e.target.value)} placeholder="Qty..." style={{ width: '100px', backgroundColor: '#111', color: '#FFF', fontSize: '20px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                </div>

                {comboMode === 'combo3' && (
                  <>
                    <div style={{ borderBottom: '2px dashed #444', margin: '4px 0' }} />
                    <div style={{ color: '#FF9500', fontSize: '20px', fontWeight: 'bold' }}>Bottle 3</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input value={b3Name} onChange={(e) => setB3Name(e.target.value)} placeholder="Name" style={{ flex: 1, backgroundColor: '#111', color: '#FFF', fontSize: '20px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                      <input type="number" value={b3Doses} onChange={(e) => setB3Doses(e.target.value)} placeholder="Qty..." style={{ width: '100px', backgroundColor: '#111', color: '#FFF', fontSize: '20px', padding: '16px', borderRadius: '12px', border: '2px solid #444', outline: 'none' }} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <input type="number" value={b1Doses} onChange={(e) => setB1Doses(e.target.value)} placeholder="Total Pills remaining..." style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none', marginTop: '12px' }} />
            )}
            
            <button onClick={addMedication} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '28px', fontWeight: 'bold', border: 'none', borderRadius: '20px', padding: '24px', marginTop: '12px' }}>Save Medication</button>
          </div>
        </div>
      )}
    </div>
  );
}
