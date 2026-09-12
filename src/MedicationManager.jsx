import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Plus, Trash2, CheckCircle, Share2, List, Bell } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapApp } from '@capacitor/app';

export default function MedicationManager({ goHome }) {
  const [view, setView] = useState('list'); // 'list' or 'history'
  const [meds, setMeds] = useState([]);
  const [history, setHistory] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedHours, setNewMedHours] = useState('24');
  const [newMedInventory, setNewMedInventory] = useState('30');

  useEffect(() => {
    const savedMeds = localStorage.getItem('sovereign_meds');
    const savedHistory = localStorage.getItem('sovereign_med_history');
    if (savedMeds) setMeds(JSON.parse(savedMeds));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    // Request Android System Alarm Permissions
    LocalNotifications.requestPermissions();
  }, []);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (view === 'list' && goHome) goHome();
      else setView('list');
    });
    return () => { listener.remove(); };
  }, [view, goHome]);

  const saveMeds = (updated) => {
    localStorage.setItem('sovereign_meds', JSON.stringify(updated));
    setMeds(updated);
  };

  const saveHistory = (updated) => {
    localStorage.setItem('sovereign_med_history', JSON.stringify(updated));
    setHistory(updated);
  };

  const scheduleAlarms = async (medName, hoursInterval, remaining) => {
    try {
      // 1. Schedule Next Pill Alarm
      await LocalNotifications.schedule({
        notifications: [{
          title: "Pill Reminder",
          body: `It's time to take your ${medName}.`,
          id: Math.floor(Math.random() * 100000),
          schedule: { at: new Date(Date.now() + (parseInt(hoursInterval) * 60 * 60 * 1000)) },
          sound: null
        }]
      });

      // 2. Schedule Refill Alarm if getting low (<= 5 pills)
      if (remaining <= 5) {
        await LocalNotifications.schedule({
          notifications: [{
            title: "Refill Needed!",
            body: `You only have ${remaining} doses of ${medName} left. Call the pharmacy.`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 10000) } // Triggers shortly after for visibility
          }]
        });
      }
    } catch (error) { console.error("Alarm scheduling failed", error); }
  };

  const addMed = () => {
    if (!newMedName) return;
    const newMed = { id: Date.now(), name: newMedName, interval: newMedHours, remaining: parseInt(newMedInventory) || 0 };
    saveMeds([...meds, newMed]);
    setNewMedName(''); setNewMedHours('24'); setNewMedInventory('30');
  };

  const deleteMed = (id) => saveMeds(meds.filter(m => m.id !== id));

  const logDose = async (med) => {
    const now = new Date();
    const doseLog = { id: Date.now(), medName: med.name, date: now.toLocaleDateString(), time: now.toLocaleTimeString() };
    
    // Update History & Inventory
    saveHistory([doseLog, ...history]);
    const updatedRemaining = med.remaining - 1;
    saveMeds(meds.map(m => m.id === med.id ? { ...m, remaining: updatedRemaining } : m));

    // Native Android Background Alarms
    await scheduleAlarms(med.name, med.interval, updatedRemaining);
    alert(`Logged ${med.name}! Alarm set for ${med.interval} hours from now.`);
  };

  const exportHistory = () => {
    if (history.length === 0) return alert("No history to export.");
    let body = `Medication History Log\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
    history.forEach(log => {
      body += `[${log.date} @ ${log.time}] - Took: ${log.medName}\n`;
    });
    window.location.href = `mailto:?subject=Medication Log&body=${encodeURIComponent(body)}`;
  };

  if (view === 'history') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
            <ArrowLeft size={24} /> Back
          </button>
          <h2 style={{ margin: 0, color: 'var(--accent)', fontSize: '24px' }}>Dose History</h2>
        </div>
        
        <button onClick={exportHistory} style={{ backgroundColor: '#1E3A8A', color: '#FFF', padding: '20px', borderRadius: '16px', fontSize: '22px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <Share2 size={28} /> Export Log for Doctor
        </button>

        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '20px' }}>No doses logged yet.</p> : 
            history.map(log => (
              <div key={log.id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '16px', borderLeft: '6px solid #2E7D32' }}>
                <div style={{ fontSize: '24px', color: '#FFF', fontWeight: 'bold', marginBottom: '8px' }}>{log.medName}</div>
                <div style={{ fontSize: '18px', color: '#CCC', display: 'flex', gap: '16px' }}>
                  <span>{log.date}</span><span>{log.time}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <ArrowLeft size={24} /> Home
        </button>
        <button onClick={() => setView('history')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface)', border: '2px solid var(--accent)', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold' }}>
          <List size={24} color="var(--accent)" /> History
        </button>
      </div>

      <div style={{ backgroundColor: '#222', padding: '20px', borderRadius: '20px', border: '2px solid #555', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#FFF', fontSize: '24px' }}>Add New Pill</h3>
        <input value={newMedName} onChange={e => setNewMedName(e.target.value)} placeholder="Medication Name" style={{ width: '100%', padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#111', color: '#FFF', border: '1px solid #444', marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input type="number" value={newMedHours} onChange={e => setNewMedHours(e.target.value)} placeholder="Hours (e.g. 24)" style={{ flex: 1, padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#111', color: '#FFF', border: '1px solid #444' }} />
          <input type="number" value={newMedInventory} onChange={e => setNewMedInventory(e.target.value)} placeholder="Pill Count" style={{ flex: 1, padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#111', color: '#FFF', border: '1px solid #444' }} />
        </div>
        <button onClick={addMed} style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#000', padding: '16px', borderRadius: '12px', fontSize: '22px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Plus size={28} /> Add Pill
        </button>
      </div>

      <h3 style={{ margin: '0 0 16px 0', color: '#FFF', fontSize: '26px' }}>My Medications</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {meds.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '20px' }}>No meds added.</p> : 
          meds.map(med => (
            <div key={med.id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px', border: med.remaining <= 5 ? '2px solid var(--error)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '28px', color: '#FFF', fontWeight: 'bold' }}>{med.name}</div>
                <button onClick={() => deleteMed(med.id)} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--error)' }}><Trash2 size={28} /></button>
              </div>
              <div style={{ color: '#CCC', fontSize: '18px', display: 'flex', justifyContent: 'space-between' }}>
                <span><Clock size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Every {med.interval} hrs</span>
                <span style={{ color: med.remaining <= 5 ? 'var(--error)' : '#CCC', fontWeight: 'bold' }}>{med.remaining} Pills Left</span>
              </div>
              <button onClick={() => logDose(med)} style={{ backgroundColor: '#2E7D32', color: '#FFF', padding: '20px', borderRadius: '16px', fontSize: '24px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <CheckCircle size={28} /> Take Dose
              </button>
            </div>
          ))
        }
      </div>
    </div>
  );
}
