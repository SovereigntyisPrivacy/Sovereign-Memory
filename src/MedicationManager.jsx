import { useState, useEffect } from 'react';
import { Home, Mic, Trash2, CheckSquare, RotateCcw, Calculator, List, Plus, Clock, User, ChevronUp } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { App as CapApp } from '@capacitor/app';

const QUESTIONS = [
  { q: "What is the name of the medication?", key: 'name', ph: "e.g., Excedrin" },
  { q: "How much to take at once?", key: 'dose', ph: "e.g., 2 pills" },
  { q: "What time to take it?", key: 'time', ph: "e.g., 8:00 AM" },
  { q: "How often?", key: 'often', ph: "e.g., Twice daily" },
  { q: "What is it for?", key: 'reason', ph: "e.g., Migraine" },
  { q: "Prescribing Doctor?", key: 'doctor', ph: "e.g., Dr. Smith" },
  { q: "Total pills in the bottle right now?", key: 'remaining', ph: "e.g., 50", type: "number" }
];

export default function MedicationManager({ goHome }) {
  const [view, setView] = useState('list'); // 'list', 'add'
  const [meds, setMeds] = useState([]);
  const [wizardStep, setWizardStep] = useState(0);
  const [newMed, setNewMed] = useState({});
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sovereign_meds_detailed');
    if (saved) setMeds(JSON.parse(saved));
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
    localStorage.setItem('sovereign_meds_detailed', JSON.stringify(updated));
    setMeds(updated);
  };

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak now...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) {
        setNewMed({ ...newMed, [QUESTIONS[wizardStep].key]: result.matches[0] });
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const scheduleAlarms = async (med) => {
    // Parse time naturally
    const match = med.time.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
    let h = 8, m = 0;
    if (match) {
      h = parseInt(match[1]);
      m = parseInt(match[2] || 0);
      const ampm = (match[3] || '').toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
    }

    const baseId = Math.floor(Math.random() * 100000);
    const notifications = [{
      title: "Medication Reminder",
      body: `Time to take ${med.dose} of ${med.name} (${med.reason})`,
      id: baseId,
      schedule: { on: { hour: h, minute: m } },
      sound: null
    }];

    // Automatic Twice Daily Math (+12 hours)
    if (med.often.toLowerCase().includes('twice') || med.often.toLowerCase().includes('2 times')) {
      const h2 = (h + 12) % 24;
      notifications.push({
        title: "Medication Reminder",
        body: `Time to take ${med.dose} of ${med.name} (${med.reason})`,
        id: baseId + 1,
        schedule: { on: { hour: h2, minute: m } },
        sound: null
      });
    }

    await LocalNotifications.schedule({ notifications });
    return [baseId, baseId + 1];
  };

  const finalizeMed = async () => {
    const alarmIds = await scheduleAlarms(newMed);
    const finalMed = { 
      ...newMed, 
      id: Date.now(), 
      remaining: parseInt(newMed.remaining) || 0,
      logs: [],
      alarmIds 
    };
    saveMeds([...meds, finalMed]);
    setNewMed({});
    setWizardStep(0);
    setView('list');
  };

  const logDose = (med) => {
    const doseCount = parseInt(med.dose.replace(/[^0-9]/g, '')) || 1;
    const now = new Date();
    const logEntry = { id: Date.now(), timestamp: now.getTime(), timeStr: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    
    const updated = meds.map(m => {
      if (m.id === med.id) {
        const newRem = m.remaining - doseCount;
        if (newRem <= 5 && newRem >= 0) {
          LocalNotifications.schedule({
            notifications: [{ title: "Refill Needed", body: `Only ${newRem} doses of ${m.name} left.`, id: Math.floor(Math.random()*1000), schedule: { at: new Date(Date.now() + 5000) } }]
          });
        }
        return { ...m, remaining: newRem, logs: [...(m.logs || []), logEntry] };
      }
      return m;
    });
    saveMeds(updated);
  };

  const undoDose = (med) => {
    const doseCount = parseInt(med.dose.replace(/[^0-9]/g, '')) || 1;
    const updated = meds.map(m => {
      if (m.id === med.id && m.logs.length > 0) {
        const newLogs = [...m.logs];
        newLogs.pop();
        return { ...m, remaining: m.remaining + doseCount, logs: newLogs };
      }
      return m;
    });
    saveMeds(updated);
  };

  const deleteMed = (id) => {
    if(window.confirm("Remove this medication?")) saveMeds(meds.filter(m => m.id !== id));
  };

  const isToday = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  if (view === 'add') {
    const currentQ = QUESTIONS[wizardStep];
    const val = newMed[currentQ.key] || '';
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
        <button onClick={() => setView('list')} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
          <Home size={24} /> GO HOME
        </button>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button style={{ flex: 1, backgroundColor: '#FF9500', color: '#000', padding: '16px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><List size={24}/> My Tracker</button>
          <button style={{ flex: 1, backgroundColor: '#222', color: '#FFF', padding: '16px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Calculator size={24}/> Dosage Math</button>
        </div>

        <h1 style={{ color: '#FFF', fontSize: '32px', margin: '0 0 32px 0' }}>Adding Medication</h1>
        <h2 style={{ color: '#CCC', fontSize: '22px', fontWeight: 'normal', margin: '0 0 16px 0' }}>{currentQ.q}</h2>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <textarea 
            value={val} 
            onChange={e => setNewMed({...newMed, [currentQ.key]: e.target.value})} 
            placeholder={isListening ? "Listening..." : "Tap to type or use Dictate..."} 
            style={{ flexGrow: 1, backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #555', resize: 'none', minHeight: '120px' }} 
          />
          <button onClick={toggleDictation} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: isListening ? '#FF9500' : '#222', border: '2px solid #FF9500', borderRadius: '16px', width: '100px', color: isListening ? '#000' : '#FFF', fontWeight: 'bold' }}>
            <Mic size={32} color={isListening ? '#000' : '#FF9500'} /> Dictate
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
          <button onClick={() => wizardStep === 0 ? setView('list') : setWizardStep(wizardStep - 1)} style={{ flex: 1, backgroundColor: '#444', color: '#FFF', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px' }}>
            {wizardStep === 0 ? 'Cancel' : 'Back'}
          </button>
          <button onClick={() => wizardStep === QUESTIONS.length - 1 ? finalizeMed() : setWizardStep(wizardStep + 1)} style={{ flex: 1, backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px' }}>
            {wizardStep === QUESTIONS.length - 1 ? 'Save Med →' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button style={{ flex: 1, backgroundColor: '#FF9500', color: '#000', padding: '16px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><List size={24}/> My Tracker</button>
        <button onClick={() => setView('add')} style={{ flex: 1, backgroundColor: '#222', border: '2px solid #FF9500', color: '#FFF', padding: '16px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Plus size={24} color="#FF9500"/> Add Med</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {meds.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '22px' }}>No medications added.</p> : 
          meds.map(med => {
            const todaysLogs = (med.logs || []).filter(l => isToday(l.timestamp));
            
            return (
              <div key={med.id} style={{ backgroundColor: '#2E7D32', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '32px', color: '#FFF', fontWeight: 'bold' }}>{med.name}</div>
                  <ChevronUp size={32} color="#FFF" />
                </div>
                <div style={{ fontSize: '20px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} /> {med.time}
                </div>

                <div style={{ backgroundColor: '#215c23', padding: '20px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '20px', color: '#FFF', fontWeight: 'bold', marginBottom: '16px' }}>Taken Today:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {todaysLogs.length === 0 ? <div style={{ color: '#AAA', fontStyle: 'italic' }}>None yet</div> : 
                      todaysLogs.map(log => (
                        <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', color: '#FF9500', fontWeight: 'bold' }}>
                          <CheckSquare size={28} color="#00FF00" /> {log.timeStr}
                        </div>
                      ))
                    }
                  </div>
                  <button onClick={() => undoDose(med)} style={{ backgroundColor: 'transparent', border: '2px solid #FFF', borderRadius: '24px', color: '#FFF', padding: '12px 20px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RotateCcw size={20} /> Undo Last Dose
                  </button>
                </div>

                <div style={{ backgroundColor: '#215c23', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#FFF', fontSize: '20px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '22px' }}>Dose: <span style={{ fontWeight: 'normal' }}>{med.dose}</span></div>
                  <div style={{ fontWeight: 'bold', fontSize: '22px', borderBottom: '1px solid #444', paddingBottom: '16px', marginBottom: '4px' }}>Remaining: <span style={{ fontWeight: 'normal' }}>{med.remaining}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span>🔁</span> <strong>Often:</strong> {med.often}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span>📝</span> <strong>For:</strong> {med.reason}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><User size={20} /> <strong>Dr:</strong> {med.doctor}</div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <button onClick={() => deleteMed(med.id)} style={{ backgroundColor: 'transparent', border: '2px solid #ff6b6b', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Trash2 size={32} color="#ff6b6b" />
                  </button>
                  <button onClick={() => logDose(med)} style={{ flexGrow: 1, backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                    <CheckSquare size={28} /> Log Dose Now
                  </button>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
