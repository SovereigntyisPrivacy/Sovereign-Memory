import { useState, useEffect } from 'react';
import { Home, Mic, Trash2, CheckSquare, RotateCcw, Calculator, List, Plus, Clock, User, ChevronUp, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { App as CapApp } from '@capacitor/app';

const WIZARD_STEPS = [
  { q: "What is the name of the medication?", key: 'name', ph: "e.g., Excedrin", type: 'text' },
  { q: "How many mg is one pill?", key: 'mgPerPill', ph: "e.g., 250", type: 'number' },
  { q: "How many pills to take at once?", key: 'pillsAtOnce', ph: "e.g., 2", type: 'number' },
  { q: "How often?", key: 'frequency', type: 'select', options: ['Once daily', 'Twice daily', 'Three times daily', 'As needed'] },
  { q: "What time is the first dose?", key: 'time', ph: "e.g., 8:00 AM", type: 'text' },
  { q: "What is it for?", key: 'reason', ph: "e.g., Migraine", type: 'text' },
  { q: "Who prescribed it?", key: 'doctor', ph: "e.g., Dr. Smith", type: 'text' },
  { q: "Total pills in the bottle right now?", key: 'remaining', ph: "e.g., 50", type: 'number' }
];

export default function MedicationManager({ goHome }) {
  const [view, setView] = useState('list'); 
  const [meds, setMeds] = useState([]);
  const [wizardStep, setWizardStep] = useState(0);
  const [newMed, setNewMed] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [expandedMeds, setExpandedMeds] = useState({});

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

  const toggleExpand = (id) => {
    setExpandedMeds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak now...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) {
        setNewMed({ ...newMed, [WIZARD_STEPS[wizardStep].key]: result.matches[0] });
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const scheduleAlarms = async (med) => {
    if (med.frequency === 'As needed') return []; // No exact alarms for PRN meds

    const match = (med.time || '8:00 AM').match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
    let h = 8, m = 0;
    if (match) {
      h = parseInt(match[1]);
      m = parseInt(match[2] || 0);
      const ampm = (match[3] || '').toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
    }

    const baseId = Math.floor(Math.random() * 100000);
    const totalMg = (parseFloat(med.pillsAtOnce) || 1) * (parseFloat(med.mgPerPill) || 0);
    const bodyText = `Time to take ${med.pillsAtOnce} pills (${totalMg}mg total) of ${med.name}`;
    
    const notifications = [{
      title: "Medication Reminder",
      body: bodyText,
      id: baseId,
      schedule: { on: { hour: h, minute: m }, repeats: true },
      sound: null
    }];

    if (med.frequency === 'Twice daily') {
      notifications.push({
        title: "Medication Reminder", body: bodyText, id: baseId + 1,
        schedule: { on: { hour: (h + 12) % 24, minute: m }, repeats: true }, sound: null
      });
    } else if (med.frequency === 'Three times daily') {
      notifications.push({
        title: "Medication Reminder", body: bodyText, id: baseId + 1,
        schedule: { on: { hour: (h + 8) % 24, minute: m }, repeats: true }, sound: null
      });
      notifications.push({
        title: "Medication Reminder", body: bodyText, id: baseId + 2,
        schedule: { on: { hour: (h + 16) % 24, minute: m }, repeats: true }, sound: null
      });
    }

    await LocalNotifications.schedule({ notifications });
    return notifications.map(n => n.id);
  };

  const finalizeMed = async () => {
    // Set default drop-down value if user didn't change it
    if (!newMed.frequency) newMed.frequency = 'Once daily';

    const alarmIds = await scheduleAlarms(newMed);
    const finalMed = { 
      ...newMed, 
      id: Date.now(), 
      remaining: parseInt(newMed.remaining) || 0,
      pillsAtOnce: parseInt(newMed.pillsAtOnce) || 1,
      mgPerPill: parseFloat(newMed.mgPerPill) || 0,
      logs: [],
      alarmIds 
    };
    saveMeds([...meds, finalMed]);
    setNewMed({});
    setWizardStep(0);
    setView('list');
  };

  const logDose = (med) => {
    const now = new Date();
    const logEntry = { id: Date.now(), timestamp: now.getTime(), timeStr: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), dateStr: now.toLocaleDateString() };
    
    const updated = meds.map(m => {
      if (m.id === med.id) {
        const newRem = m.remaining - m.pillsAtOnce;
        if (newRem <= (m.pillsAtOnce * 3) && newRem >= 0) {
          LocalNotifications.schedule({
            notifications: [{ title: "Refill Needed", body: `Only ${newRem} pills of ${m.name} left in the bottle.`, id: Math.floor(Math.random()*1000), schedule: { at: new Date(Date.now() + 5000) } }]
          });
        }
        return { ...m, remaining: newRem, logs: [...(m.logs || []), logEntry] };
      }
      return m;
    });
    saveMeds(updated);
  };

  const undoDose = (med) => {
    const updated = meds.map(m => {
      if (m.id === med.id && m.logs.length > 0) {
        const newLogs = [...m.logs];
        newLogs.pop();
        return { ...m, remaining: m.remaining + m.pillsAtOnce, logs: newLogs };
      }
      return m;
    });
    saveMeds(updated);
  };

  const deleteMed = (id) => {
    if(window.confirm("Remove this medication?")) {
      // Need to cancel alarms here ideally
      saveMeds(meds.filter(m => m.id !== id));
    }
  };

  const isToday = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  if (view === 'add') {
    const currentQ = WIZARD_STEPS[wizardStep];
    const val = newMed[currentQ.key] || '';
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px' }}>
        <button onClick={() => setView('list')} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
          <Home size={24} /> GO HOME
        </button>

        <h1 style={{ color: '#FFF', fontSize: '32px', margin: '0 0 32px 0' }}>Adding Medication</h1>
        <h2 style={{ color: '#CCC', fontSize: '22px', fontWeight: 'normal', margin: '0 0 16px 0' }}>{currentQ.q}</h2>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          {currentQ.type === 'select' ? (
            <select 
              value={val || 'Once daily'} 
              onChange={e => setNewMed({...newMed, [currentQ.key]: e.target.value})}
              style={{ flexGrow: 1, backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #FF9500', outline: 'none' }}
            >
              {currentQ.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <>
              <input 
                type={currentQ.type === 'number' ? 'number' : 'text'}
                value={val} 
                onChange={e => setNewMed({...newMed, [currentQ.key]: e.target.value})} 
                placeholder={isListening ? "Listening..." : currentQ.ph} 
                style={{ flexGrow: 1, backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none' }} 
              />
              {currentQ.type !== 'number' && (
                <button onClick={toggleDictation} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: isListening ? '#FF9500' : '#222', border: '2px solid #FF9500', borderRadius: '16px', width: '100px', color: isListening ? '#000' : '#FFF', fontWeight: 'bold' }}>
                  <Mic size={32} color={isListening ? '#000' : '#FF9500'} /> Dictate
                </button>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
          <button onClick={() => wizardStep === 0 ? setView('list') : setWizardStep(wizardStep - 1)} style={{ flex: 1, backgroundColor: '#444', color: '#FFF', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px' }}>
            {wizardStep === 0 ? 'Cancel' : 'Back'}
          </button>
          <button onClick={() => wizardStep === WIZARD_STEPS.length - 1 ? finalizeMed() : setWizardStep(wizardStep + 1)} style={{ flex: 1, backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px' }}>
            {wizardStep === WIZARD_STEPS.length - 1 ? 'Save Med →' : 'Next →'}
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
            const isExpanded = expandedMeds[med.id];
            const totalMg = med.pillsAtOnce * med.mgPerPill;
            
            return (
              <div key={med.id} style={{ backgroundColor: '#2E7D32', borderRadius: '24px', border: '2px solid #1c4a1e', overflow: 'hidden' }}>
                
                {/* Always Visible Header Card */}
                <div onClick={() => toggleExpand(med.id)} style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#266929' }}>
                  <div>
                    <div style={{ fontSize: '32px', color: '#FFF', fontWeight: 'bold', marginBottom: '8px' }}>{med.name}</div>
                    <div style={{ fontSize: '20px', color: '#E0E0E0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={20} color="#FF9500" /> {med.time} | {med.frequency}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={40} color="#FFF" /> : <ChevronDown size={40} color="#FFF" />}
                </div>

                {/* Collapsible Details Area */}
                {isExpanded && (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '2px solid #1c4a1e' }}>
                    
                    <div style={{ backgroundColor: '#215c23', padding: '20px', borderRadius: '16px' }}>
                      <div style={{ fontSize: '20px', color: '#FFF', fontWeight: 'bold', marginBottom: '16px' }}>Taken Today:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        {todaysLogs.length === 0 ? <div style={{ color: '#AAA', fontStyle: 'italic' }}>None yet</div> : 
                          todaysLogs.map(log => (
                            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', color: '#FFF', fontWeight: 'bold' }}>
                              <CheckSquare size={28} color="#FF9500" /> {log.timeStr}
                            </div>
                          ))
                        }
                      </div>
                      <button onClick={() => undoDose(med)} style={{ backgroundColor: 'transparent', border: '2px solid #FFF', borderRadius: '24px', color: '#FFF', padding: '12px 20px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RotateCcw size={20} /> Undo Last Dose
                      </button>
                    </div>

                    <div style={{ backgroundColor: '#215c23', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#FFF', fontSize: '20px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '22px' }}>Dose: <span style={{ fontWeight: 'normal', color: '#FF9500' }}>{med.pillsAtOnce} pills ({totalMg}mg)</span></div>
                      <div style={{ fontSize: '18px', color: '#CCC' }}>Pill Size: {med.mgPerPill}mg</div>
                      <div style={{ fontWeight: 'bold', fontSize: '22px', borderBottom: '1px solid #444', paddingBottom: '16px', marginBottom: '4px' }}>Remaining in Bottle: <span style={{ fontWeight: 'normal' }}>{med.remaining}</span></div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}><Activity size={24} color="#FF9500" /> <strong>For:</strong> {med.reason}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><User size={24} color="#FF9500" /> <strong>Dr:</strong> {med.doctor}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button onClick={() => deleteMed(med.id)} style={{ backgroundColor: 'transparent', border: '2px solid #ff6b6b', borderRadius: '16px', padding: '16px 24px', display: 'flex', gap: '12px', color: '#ff6b6b', fontWeight: 'bold', fontSize: '20px', alignItems: 'center' }}>
                        <Trash2 size={24} /> Delete Bottle
                      </button>
                    </div>
                  </div>
                )}

                {/* Always Visible Action Footer */}
                <div style={{ padding: '16px 24px', backgroundColor: '#1c4a1e' }}>
                  <button onClick={() => logDose(med)} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '26px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                    <CheckSquare size={32} /> Log Dose Now
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
