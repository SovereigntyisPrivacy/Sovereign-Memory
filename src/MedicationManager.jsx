import { useState, useEffect, useRef } from 'react';
import { Calculator, List, Plus, Delete, ArrowRight, RotateCcw, Check, Mic, Trash2, Share2, User, AlertTriangle, Clock, ChevronDown, ChevronUp, Repeat, ArrowDownUp, BellRing } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';

const FREQUENCIES = [
  { label: 'Once daily', timesNeeded: 1 },
  { label: 'Twice daily', timesNeeded: 2 },
  { label: '3 times a day', timesNeeded: 3 },
  { label: 'As needed', timesNeeded: 0 }
];

export default function MedicationManager() {
  const [view, setView] = useState('tracker'); 
  const [medications, setMedications] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Medication Form State
  const [newMed, setNewMed] = useState({ 
    name: '', 
    mgPerPill: '', 
    pillCount: '1', 
    totalPills: '', 
    frequency: 'Once daily', 
    times: ['08:00'], 
    purpose: '', 
    doctor: '', 
    takenLogs: [] 
  });
  
  const [addStep, setAddStep] = useState('name'); 
  const [expandedId, setExpandedId] = useState(null); 
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Calculator State
  const [calcStep, setCalcStep] = useState('input1'); 
  const [calcMode, setCalcMode] = useState('up'); 
  const [val1, setVal1] = useState(''); 
  const [val2, setVal2] = useState(''); 

  useEffect(() => {
    const saved = localStorage.getItem('sovereign_meds');
    let loadedMeds = saved ? JSON.parse(saved) : [];
    
    // Auto-reset checkmarks at midnight
    const todayStr = new Date().toLocaleDateString();
    const lastOpened = localStorage.getItem('sovereign_med_date');
    if (lastOpened !== todayStr) {
      loadedMeds = loadedMeds.map(med => ({ ...med, takenLogs: [] }));
      localStorage.setItem('sovereign_med_date', todayStr);
      localStorage.setItem('sovereign_meds', JSON.stringify(loadedMeds));
    }
    
    setMedications(loadedMeds);
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try { await LocalNotifications.requestPermissions(); } 
    catch (e) { console.log("Native notifications initialize in APK."); }
  };

  const scheduleAlarmsForMed = async (med) => {
    if (!med.times || med.times.length === 0) return;
    try {
      const notifications = med.times.map((timeStr, idx) => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return {
          title: `Medication Reminder: ${med.name}`,
          body: `Take ${med.pillCount} pill(s) (${parseInt(med.pillCount) * (parseInt(med.mgPerPill) || 0)}mg total)`,
          id: Math.floor(Math.random() * 100000) + idx,
          schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true }
        };
      });
      await LocalNotifications.schedule({ notifications });
    } catch (e) {
      console.log("Alarms will trigger on Android build.");
    }
  };

  const saveMeds = (newMedsList) => {
    localStorage.setItem('sovereign_meds', JSON.stringify(newMedsList));
    setMedications(newMedsList);
  };

  const formatClockDisplay = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleCalcTap = (num) => { 
    if (calcStep === 'input1') setVal1(val1 + num); 
    if (calcStep === 'input2') setVal2(val2 + num); 
  };
  const clearCalcLast = () => { 
    if (calcStep === 'input1') setVal1(val1.slice(0, -1)); 
    if (calcStep === 'input2') setVal2(val2.slice(0, -1)); 
  };
  const resetCalc = () => { setCalcStep('input1'); setVal1(''); setVal2(''); };
  
  const getCalcResult = () => {
    const v1 = parseFloat(val1) || 0;
    const v2 = parseFloat(val2) || 0;
    if (!v2) return 0;
    if (calcMode === 'up') return Math.round((v1 / v2) * 10) / 10; 
    if (calcMode === 'down') return Math.round((v1 * v2) * 10) / 10; 
  };

  const toggleDictation = (field) => {
    if (isListening && recognitionRef.current) { 
      recognitionRef.current.stop(); 
      setIsListening(false); 
      return; 
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.onstart = () => setIsListening(true);
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setNewMed(prev => ({ ...prev, [field]: prev[field] ? prev[field] + ' ' + text : text }));
      };
      rec.onend = () => setIsListening(false);
      rec.start();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => { setView('tracker'); setIsAdding(false); }} style={{ backgroundColor: view === 'tracker' ? 'var(--accent)' : 'var(--surface)', color: view === 'tracker' ? '#000' : '#FFF', fontSize: '20px', padding: '16px', flex: 1, justifyContent: 'center' }}>
          <List size={24} /> My Tracker
        </button>
        <button onClick={() => { setView('calculator'); resetCalc(); }} style={{ backgroundColor: view === 'calculator' ? 'var(--accent)' : 'var(--surface)', color: view === 'calculator' ? '#000' : '#FFF', fontSize: '20px', padding: '16px', flex: 1, justifyContent: 'center' }}>
          <Calculator size={24} /> Dosage Math
        </button>
      </div>

      {view === 'calculator' && (
        <>
          {calcStep === 'input1' && (
            <button onClick={() => { setCalcMode(calcMode === 'up' ? 'down' : 'up'); resetCalc(); }} style={{ width: '100%', marginBottom: '16px', padding: '16px', backgroundColor: '#333', border: '2px solid var(--accent)', color: 'var(--accent)', justifyContent: 'center', fontSize: '20px' }}>
              <ArrowDownUp size={24} /> Switch to {calcMode === 'up' ? 'Pills → mg (Multiply)' : 'mg → Pills (Divide)'}
            </button>
          )}
          <div style={{ minHeight: '160px', backgroundColor: 'var(--surface)', border: '4px solid #555', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
            {calcStep === 'input1' && (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '20px' }}>{calcMode === 'up' ? 'Prescribed Target (mg):' : 'Number of pills taking:'}</p>
                <div style={{ fontSize: '48px', letterSpacing: '4px' }}>{val1 || '_'} {calcMode === 'up' ? 'mg' : 'pills'}</div>
              </>
            )}
            {calcStep === 'input2' && (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '20px' }}>Pill strength (mg per pill):</p>
                <div style={{ fontSize: '48px', letterSpacing: '4px' }}>{val2 || '_'} mg</div>
              </>
            )}
            {calcStep === 'result' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '24px', color: 'var(--text-muted)' }}>{calcMode === 'up' ? 'You need to take:' : 'Total dosage is:'}</p>
                <h1 style={{ fontSize: '64px', color: 'var(--accent)', margin: '16px 0' }}>{getCalcResult()} {calcMode === 'up' ? 'Pills' : 'mg'}</h1>
                <p style={{ fontSize: '20px', color: 'var(--text-muted)' }}>{calcMode === 'up' ? `(${val1}mg ÷ ${val2}mg)` : `(${val1} pills × ${val2}mg)`}</p>
              </div>
            )}
          </div>
          {calcStep === 'input1' && <button className="primary-btn" onClick={() => setCalcStep('input2')} disabled={!val1} style={{ marginTop: '24px', justifyContent: 'center' }}>Next <ArrowRight size={28} /></button>}
          {calcStep === 'input2' && <button className="primary-btn" onClick={() => setCalcStep('result')} disabled={!val2} style={{ marginTop: '24px', justifyContent: 'center' }}>Calculate <Check size={28} /></button>}
          {calcStep === 'result' && <button className="primary-btn" onClick={resetCalc} style={{ marginTop: '24px', justifyContent: 'center' }}><RotateCcw size={28} /> Calculate Another</button>}
          
          {calcStep !== 'result' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => <button key={num} onClick={() => handleCalcTap(num)} style={{ height: '80px', justifyContent: 'center', fontSize: '40px', backgroundColor: '#333' }}>{num}</button>)}
              <button onClick={clearCalcLast} style={{ height: '80px', justifyContent: 'center', backgroundColor: 'var(--error)' }}><Delete size={36} color="#000" /></button>
              <button onClick={() => handleCalcTap(0)} style={{ height: '80px', justifyContent: 'center', fontSize: '40px', backgroundColor: '#333' }}>0</button>
              <button onClick={() => handleCalcTap('.')} style={{ height: '80px', justifyContent: 'center', fontSize: '40px', backgroundColor: '#333' }}>.</button>
            </div>
          )}
        </>
      )}

      {view === 'tracker' && !isAdding && (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <button className="primary-btn" onClick={() => setIsAdding(true)} style={{ marginBottom: '24px', justifyContent: 'center' }}>
            <Plus size={28} /> Add New Medication
          </button>

          {medications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No medications tracked yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {medications.map((med, index) => {
                const isExpanded = expandedId === index;
                const totalDoseMg = (parseInt(med.pillCount) || 1) * (parseInt(med.mgPerPill) || 0);
                const isRefillNeeded = parseInt(med.totalPills) <= 6;
                const hasTakenDose = med.takenLogs && med.takenLogs.length > 0;

                return (
                  <div key={index} style={{ backgroundColor: hasTakenDose ? '#2E7D32' : 'var(--surface)', border: isRefillNeeded ? '4px solid var(--error)' : '4px solid #444', borderRadius: '20px', overflow: 'hidden' }}>
                    
                    {/* Collapsed Header */}
                    <div onClick={() => setExpandedId(isExpanded ? null : index)} style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div>
                        <h3 style={{ fontSize: '32px', margin: 0, color: hasTakenDose ? '#FFF' : 'var(--accent)' }}>{med.name}</h3>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', color: '#E0E0E0', fontSize: '18px' }}>
                          <span>{med.pillCount} pill(s) {med.mgPerPill ? `(${totalDoseMg}mg)` : ''}</span>
                          <span>•</span>
                          <span>{med.frequency}</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={36} /> : <ChevronDown size={36} />}
                    </div>

                    {/* Refill Alert Banner */}
                    {isRefillNeeded && (
                      <div style={{ backgroundColor: 'var(--error)', color: '#000', padding: '12px 24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                        <AlertTriangle size={24} /> REFILL ALERT: Only {med.totalPills} pills left in bottle!
                      </div>
                    )}

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div style={{ padding: '0 24px 24px 24px' }}>
                        
                        {/* Timestamps */}
                        {hasTakenDose && (
                          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '18px', color: '#FFF', marginBottom: '8px' }}>Taken Today:</div>
                            {med.takenLogs.map((logTime, idx) => (
                              <div key={idx} style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                                ✅ {logTime}
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newMeds = [...medications];
                                newMeds[index].takenLogs.pop();
                                const restored = (parseFloat(newMeds[index].totalPills) || 0) + (parseFloat(newMeds[index].pillCount) || 1);
                                newMeds[index].totalPills = restored.toString();
                                saveMeds(newMeds);
                              }}
                              style={{ marginTop: '12px', width: 'auto', padding: '8px 16px', backgroundColor: '#333', border: '1px solid #777', color: '#FFF', fontSize: '16px' }}
                            >
                              <RotateCcw size={16} /> Undo Last Dose
                            </button>
                          </div>
                        )}

                        <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                          <p style={{ fontSize: '20px', margin: '4px 0' }}><strong>Strength per pill:</strong> {med.mgPerPill ? `${med.mgPerPill} mg` : 'Not specified'}</p>
                          <p style={{ fontSize: '20px', margin: '4px 0' }}><strong>Total dose:</strong> {med.pillCount} pill(s) {med.mgPerPill ? `(${totalDoseMg} mg)` : ''}</p>
                          <p style={{ fontSize: '20px', margin: '4px 0' }}><strong>Scheduled Alarm(s):</strong> {med.times && med.times.length > 0 ? med.times.map(t => formatClockDisplay(t)).join(', ') : 'As needed'}</p>
                          <p style={{ fontSize: '20px', margin: '4px 0' }}><strong>Remaining supply:</strong> {med.totalPills} pills</p>
                          <p style={{ fontSize: '20px', margin: '4px 0' }}><strong>Purpose:</strong> {med.purpose || 'None listed'}</p>
                          <p style={{ fontSize: '20px', margin: '4px 0' }}><strong>Prescribing Doctor:</strong> {med.doctor || 'None listed'}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                          <button onClick={() => {
                            const newMeds = [...medications];
                            newMeds.splice(index, 1);
                            saveMeds(newMeds);
                          }} style={{ flex: 1, backgroundColor: 'transparent', border: '2px solid var(--error)', color: 'var(--error)', justifyContent: 'center' }}>
                            <Trash2 size={24} />
                          </button>
                          <button onClick={() => {
                            const newMeds = [...medications];
                            if (!newMeds[index].takenLogs) newMeds[index].takenLogs = [];
                            newMeds[index].takenLogs.push(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                            const remaining = Math.max(0, (parseFloat(newMeds[index].totalPills) || 0) - (parseFloat(newMeds[index].pillCount) || 1));
                            newMeds[index].totalPills = remaining.toString();
                            saveMeds(newMeds);
                          }} style={{ flex: 3, backgroundColor: 'var(--accent)', color: '#000', fontSize: '22px', justifyContent: 'center' }}>
                            <Check size={28} /> Log Dose Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Structured Wizard */}
      {view === 'tracker' && isAdding && (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'auto' }}>
          
          {addStep === 'name' && (
            <div>
              <h3 style={{ fontSize: '26px', marginBottom: '16px' }}>Medication Name</h3>
              <input 
                type="text" placeholder="e.g., Excedrin" value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                style={{ width: '100%', padding: '20px', fontSize: '24px', borderRadius: '16px', backgroundColor: '#222', color: '#FFF', border: '2px solid #555', marginBottom: '16px' }}
              />
              <button onClick={() => toggleDictation('name')} style={{ width: '100%', padding: '16px', backgroundColor: isListening ? 'var(--error)' : '#333', color: '#FFF', borderRadius: '16px', justifyContent: 'center', marginBottom: '24px' }}>
                <Mic size={24} /> {isListening ? 'Listening...' : 'Or Tap to Dictate Name'}
              </button>
              <button className="primary-btn" onClick={() => setAddStep('dosage')} disabled={!newMed.name} style={{ width: '100%', justifyContent: 'center' }}>Next <ArrowRight size={24} /></button>
            </div>
          )}

          {addStep === 'dosage' && (
            <div>
              <h3 style={{ fontSize: '26px', marginBottom: '16px' }}>Dosage Breakdown</h3>
              <label style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Strength of ONE pill (mg):</label>
              <input 
                type="number" placeholder="e.g., 250" value={newMed.mgPerPill}
                onChange={(e) => setNewMed({ ...newMed, mgPerPill: e.target.value })}
                style={{ width: '100%', padding: '18px', fontSize: '24px', borderRadius: '16px', backgroundColor: '#222', color: '#FFF', border: '2px solid #555', marginTop: '8px', marginBottom: '20px' }}
              />

              <label style={{ fontSize: '18px', color: 'var(--text-muted)' }}>How many pills taken per dose?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '8px', marginBottom: '24px' }}>
                {['0.5', '1', '2', '3'].map((count) => (
                  <button 
                    key={count} 
                    onClick={() => setNewMed({ ...newMed, pillCount: count })}
                    style={{ height: '64px', fontSize: '24px', justifyContent: 'center', backgroundColor: newMed.pillCount === count ? 'var(--accent)' : '#333', color: newMed.pillCount === count ? '#000' : '#FFF' }}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <button className="primary-btn" onClick={() => setAddStep('inventory')} style={{ width: '100%', justifyContent: 'center' }}>Next <ArrowRight size={24} /></button>
            </div>
          )}

          {addStep === 'inventory' && (
            <div>
              <h3 style={{ fontSize: '26px', marginBottom: '16px' }}>Bottle Inventory</h3>
              <label style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Total pills currently in bottle:</label>
              <input 
                type="number" placeholder="e.g., 50" value={newMed.totalPills}
                onChange={(e) => setNewMed({ ...newMed, totalPills: e.target.value })}
                style={{ width: '100%', padding: '18px', fontSize: '24px', borderRadius: '16px', backgroundColor: '#222', color: '#FFF', border: '2px solid #555', marginTop: '8px', marginBottom: '24px' }}
              />
              <button className="primary-btn" onClick={() => setAddStep('schedule')} disabled={!newMed.totalPills} style={{ width: '100%', justifyContent: 'center' }}>Next <ArrowRight size={24} /></button>
            </div>
          )}

          {addStep === 'schedule' && (
            <div>
              <h3 style={{ fontSize: '26px', marginBottom: '16px' }}>How often is it taken?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {FREQUENCIES.map((freq) => (
                  <button 
                    key={freq.label}
                    onClick={() => {
                      const initialTimes = freq.timesNeeded === 2 ? ['08:00', '20:00'] : freq.timesNeeded === 3 ? ['08:00', '13:00', '20:00'] : ['08:00'];
                      setNewMed({ ...newMed, frequency: freq.label, times: initialTimes });
                    }}
                    style={{ height: '70px', fontSize: '20px', justifyContent: 'center', backgroundColor: newMed.frequency === freq.label ? 'var(--accent)' : '#333', color: newMed.frequency === freq.label ? '#000' : '#FFF' }}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>

              {newMed.frequency !== 'As needed' && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-muted)' }}>Reminder Clock(s):</h4>
                  {newMed.times.map((t, idx) => (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '16px', color: '#BBB' }}>Alarm {idx + 1}:</label>
                      <input 
                        type="time" value={t}
                        onChange={(e) => {
                          const updatedTimes = [...newMed.times];
                          updatedTimes[idx] = e.target.value;
                          setNewMed({ ...newMed, times: updatedTimes });
                        }}
                        style={{ width: '100%', padding: '16px', fontSize: '24px', borderRadius: '16px', backgroundColor: '#222', color: '#FFF', border: '2px solid var(--accent)', marginTop: '4px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <button className="primary-btn" onClick={() => setAddStep('details')} style={{ width: '100%', justifyContent: 'center' }}>Next <ArrowRight size={24} /></button>
            </div>
          )}

          {addStep === 'details' && (
            <div>
              <h3 style={{ fontSize: '26px', marginBottom: '16px' }}>Additional Details</h3>
              <input 
                type="text" placeholder="Purpose (e.g., Blood Pressure)" value={newMed.purpose}
                onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                style={{ width: '100%', padding: '18px', fontSize: '22px', borderRadius: '16px', backgroundColor: '#222', color: '#FFF', border: '2px solid #555', marginBottom: '16px' }}
              />
              <input 
                type="text" placeholder="Prescribing Doctor (e.g., Dr. Smith)" value={newMed.doctor}
                onChange={(e) => setNewMed({ ...newMed, doctor: e.target.value })}
                style={{ width: '100%', padding: '18px', fontSize: '22px', borderRadius: '16px', backgroundColor: '#222', color: '#FFF', border: '2px solid #555', marginBottom: '24px' }}
              />
              <button 
                className="primary-btn" 
                onClick={() => {
                  saveMeds([...medications, { ...newMed, takenLogs: [] }]);
                  scheduleAlarmsForMed(newMed);
                  setIsAdding(false);
                  setAddStep('name');
                  setNewMed({ name: '', mgPerPill: '', pillCount: '1', totalPills: '', frequency: 'Once daily', times: ['08:00'], purpose: '', doctor: '', takenLogs: [] });
                }} 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Save Medication <Check size={24} />
              </button>
            </div>
          )}

          <button onClick={() => { setIsAdding(false); setAddStep('name'); }} style={{ marginTop: '16px', backgroundColor: '#222', color: 'var(--text-muted)', justifyContent: 'center' }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
