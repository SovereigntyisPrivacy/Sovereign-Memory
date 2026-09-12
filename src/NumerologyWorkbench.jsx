import { useState, useEffect, useRef } from 'react';
import { Calculator, ArrowRight, Delete, Volume2, RefreshCcw, Share2, User, Users, Sparkles, Mic } from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const MEANINGS = {
  1: "New beginnings, independence, and taking action.",
  2: "Balance, harmony, cooperation, and patience.",
  3: "Creativity, self-expression, joy, and communication.",
  4: "Stability, hard work, foundation, and organization.",
  5: "Change, freedom, adventure, and adaptability.",
  6: "Nurturing, family, responsibility, and healing.",
  7: "Spirituality, analysis, inner wisdom, and rest.",
  8: "Abundance, power, material success, and karma.",
  9: "Completion, humanitarianism, release, and endings.",
  11: "Master Number (The Illuminator): Highly intuitive, inspiring, and visionary.",
  22: "Master Number (The Master Builder): Turning dreams into reality, large-scale impact.",
  33: "Master Number (The Master Teacher): Compassionate, healing, and uplifting humanity."
};

const GODDESS_QUOTES = [
  "Just as Gaia roots the deepest trees, your energy grounds the world around you.",
  "In the cosmic dance of Shiva, we find the beautiful rhythm of creation and transformation.",
  "As Shakti flows through all living things, so does your infinite inner strength.",
  "Like Athena, your wisdom is a comforting shield, and your intuition a guiding light.",
  "Channel the endless abundance of Lakshmi; your spirit is rich with grace.",
  "Let the fierce love of Durga protect your peace and empower your daily steps."
];

const reduceNum = (val) => {
  let num = parseInt(val, 10);
  if (!num) return 0;
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return num;
};

export default function NumerologyWorkbench() {
  const [activeTab, setActiveTab] = useState('Mine'); 
  
  const [myBirthday, setMyBirthday] = useState(''); 
  const [myBdayInput, setMyBdayInput] = useState(''); 
  const [myNotes, setMyNotes] = useState('');

  const [otherStep, setOtherStep] = useState('bday'); 
  const [otherBday, setOtherBday] = useState(''); 
  const [otherDate, setOtherDate] = useState(''); 
  const [readingNotes, setReadingNotes] = useState('');

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const originalTextRef = useRef('');
  const activeTargetRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sovereign_my_bday');
    if (saved && saved.length === 8) setMyBirthday(saved);
  }, []);

  const saveMyBirthday = () => {
    if (myBdayInput.length === 8) {
      localStorage.setItem('sovereign_my_bday', myBdayInput);
      setMyBirthday(myBdayInput);
    }
  };

  const handlePadTap = (num, target) => {
    if (target === 'myBday' && myBdayInput.length < 8) setMyBdayInput(myBdayInput + num);
    if (target === 'otherBday' && otherBday.length < 8) setOtherBday(otherBday + num);
    if (target === 'otherDate' && otherDate.length < 8) setOtherDate(otherDate + num);
  };

  const handleBackspace = (target) => {
    if (target === 'myBday') setMyBdayInput(myBdayInput.slice(0, -1));
    if (target === 'otherBday') setOtherBday(otherBday.slice(0, -1));
    if (target === 'otherDate') setOtherDate(otherDate.slice(0, -1));
  };

  const getTodayStr = () => {
    const d = new Date();
    return String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + d.getFullYear();
  };

  const calculateChart = (bday, tdate) => {
    if (bday.length !== 8 || tdate.length !== 8) return null;
    
    const rBMonth = reduceNum(bday.slice(0, 2));
    const rBDay = reduceNum(bday.slice(2, 4));
    const rBYear = reduceNum(bday.slice(4, 8));

    const rTMonth = reduceNum(tdate.slice(0, 2));
    const rTDay = reduceNum(tdate.slice(2, 4));
    const rTYear = reduceNum(tdate.slice(4, 8));

    const lifePath = reduceNum(rBMonth + rBDay + rBYear);
    const universalYear = rTYear;
    const universalMonth = reduceNum(universalYear + rTMonth);
    const personalYear = reduceNum(rBMonth + rBDay + universalYear);
    const personalMonth = reduceNum(personalYear + rTMonth);
    const personalDay = reduceNum(personalMonth + rTDay);

    return { lifePath, universalYear, universalMonth, personalYear, personalMonth, personalDay, tdate };
  };

  const toggleDictation = async (setNotesFunc) => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return;
      setIsListening(true);
      const result = await SpeechRecognition.start({
        language: "en-US", prompt: "Speak your thoughts...", partialResults: false, popup: true
      });
      if (result && result.matches && result.matches.length > 0) {
        setNotesFunc(prev => (prev + ' ' + result.matches[0]).trim());
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const generateReportText = (chart, notes, quote) => {
    if (!chart) return "";
    const dateFormatted = `${chart.tdate.slice(0,2)}/${chart.tdate.slice(2,4)}/${chart.tdate.slice(4,8)}`;
    return `Numerology Reading for ${dateFormatted}\n\n"${quote}"\n\nLife Path Number (${chart.lifePath}): ${MEANINGS[chart.lifePath]}\n\nUniversal Year (${chart.universalYear}): ${MEANINGS[chart.universalYear]}\nUniversal Month (${chart.universalMonth}): ${MEANINGS[chart.universalMonth]}\n\nPersonal Year (${chart.personalYear}): ${MEANINGS[chart.personalYear]}\nPersonal Month (${chart.personalMonth}): ${MEANINGS[chart.personalMonth]}\nPersonal Day (${chart.personalDay}): ${MEANINGS[chart.personalDay]}\n\nNotes:\n${notes || "No notes added for this reading."}`;
  };

  const exportReading = (chart, notes, quote) => {
    const text = generateReportText(chart, notes, quote);
    window.location.href = `mailto:?subject=Numerology Reading&body=${encodeURIComponent(text)}`;
  };

  const formatInput = (val) => {
    let m = val.slice(0,2).padEnd(2, '_');
    let d = val.slice(2,4).padEnd(2, '_');
    let y = val.slice(4,8).padEnd(4, '_');
    return `${m} / ${d} / ${y}`;
  };

  const renderChart = (chart, notes, setNotes) => {
    const quote = GODDESS_QUOTES[chart.personalDay % GODDESS_QUOTES.length];

    return (
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        <div style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', borderLeft: '6px solid #FFD700', padding: '24px', borderRadius: '0 16px 16px 0', marginBottom: '32px' }}>
          <Sparkles size={28} color="#FFD700" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '26px', fontStyle: 'italic', color: '#FFF', margin: 0, lineHeight: '1.4' }}>"{quote}"</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'var(--surface)', border: '2px solid #FFD700', padding: '24px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)' }}>
            <div style={{ color: '#FFD700', fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Life Path Number</div>
            <div style={{ color: '#FFF', fontSize: '56px', fontWeight: '900', margin: '12px 0' }}>{chart.lifePath}</div>
            <div style={{ fontSize: '22px', color: '#E0E0E0', lineHeight: '1.4' }}>{MEANINGS[chart.lifePath]}</div>
          </div>
          <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>Universal Year</div>
              <div style={{ color: 'var(--accent)', fontSize: '36px', fontWeight: 'bold' }}>{chart.universalYear}</div>
              <div style={{ fontSize: '20px', color: '#CCC' }}>{MEANINGS[chart.universalYear]}</div>
            </div>
            <hr style={{ borderColor: '#333', margin: '8px 0' }} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>Universal Month</div>
              <div style={{ color: 'var(--accent)', fontSize: '36px', fontWeight: 'bold' }}>{chart.universalMonth}</div>
              <div style={{ fontSize: '20px', color: '#CCC' }}>{MEANINGS[chart.universalMonth]}</div>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>Personal Year</div>
              <div style={{ color: 'var(--accent)', fontSize: '36px', fontWeight: 'bold' }}>{chart.personalYear}</div>
              <div style={{ fontSize: '20px', color: '#CCC' }}>{MEANINGS[chart.personalYear]}</div>
            </div>
            <hr style={{ borderColor: '#333', margin: '8px 0' }} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>Personal Month</div>
              <div style={{ color: 'var(--accent)', fontSize: '36px', fontWeight: 'bold' }}>{chart.personalMonth}</div>
              <div style={{ fontSize: '20px', color: '#CCC' }}>{MEANINGS[chart.personalMonth]}</div>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)', border: '2px solid var(--accent)', padding: '24px', borderRadius: '24px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '22px', textTransform: 'uppercase', letterSpacing: '1px' }}>Personal Day</div>
            <div style={{ color: 'var(--accent)', fontSize: '56px', fontWeight: '900', margin: '12px 0' }}>{chart.personalDay}</div>
            <div style={{ fontSize: '22px', color: '#FFF', lineHeight: '1.4' }}>{MEANINGS[chart.personalDay]}</div>
          </div>
        </div>

        <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>Journal your thoughts:</h3>
        
        {/* MASSIVE DICTATION LAYOUT */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <textarea 
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Tap to type or use Dictate..."
            style={{ flex: 1, minHeight: '160px', padding: '20px', fontSize: '24px', borderRadius: '20px', backgroundColor: '#222', color: '#FFF', border: '2px solid #555', resize: 'none', lineHeight: '1.4' }}
          />
          <button onClick={() => toggleDictation(setNotes)} style={{ width: '90px', backgroundColor: isListening ? 'var(--error)' : 'var(--surface)', border: isListening ? 'none' : '2px solid #555', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
            <Mic size={32} color={isListening ? '#000' : 'var(--accent)'} />
            <span style={{ fontSize: '14px', marginTop: '8px', color: isListening ? '#000' : '#FFF' }}>{isListening ? 'Stop' : 'Dictate'}</span>
          </button>
        </div>

        <button onClick={() => exportReading(chart, notes, quote)} className="primary-btn" style={{ justifyContent: 'center', padding: '24px', fontSize: '24px', backgroundColor: '#2E7D32', color: '#FFF', border: 'none', borderRadius: '20px' }}>
          <Share2 size={32} style={{ marginRight: '12px' }} /> Export Reading
        </button>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('Mine')} style={{ backgroundColor: activeTab === 'Mine' ? 'var(--accent)' : 'var(--surface)', color: activeTab === 'Mine' ? '#000' : '#FFF', fontSize: '20px', padding: '16px', flex: 1, justifyContent: 'center', borderRadius: '16px' }}>
          <User size={24} /> My Daily Numbers
        </button>
        <button onClick={() => setActiveTab('Others')} style={{ backgroundColor: activeTab === 'Others' ? 'var(--accent)' : 'var(--surface)', color: activeTab === 'Others' ? '#000' : '#FFF', fontSize: '20px', padding: '16px', flex: 1, justifyContent: 'center', borderRadius: '16px' }}>
          <Users size={24} /> Read for Others
        </button>
      </div>

      {activeTab === 'Mine' && (
        <>
          {!myBirthday || myBirthday.length !== 8 ? (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ backgroundColor: 'var(--surface)', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--accent)', fontSize: '28px' }}>Dashboard Setup</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '22px', marginBottom: '16px' }}>Enter your Birthday (MM/DD/YYYY):</p>
                <div style={{ fontSize: '48px', letterSpacing: '4px' }}>{formatInput(myBdayInput)}</div>
              </div>
              <button className="primary-btn" disabled={myBdayInput.length < 8} onClick={saveMyBirthday} style={{ justifyContent: 'center', padding: '24px', fontSize: '24px', marginBottom: '24px', borderRadius: '20px' }}>Save & Auto-Calculate <ArrowRight size={28} /></button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: 'auto' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button key={num} onClick={() => handlePadTap(num, 'myBday')} style={{ height: '80px', fontSize: '40px', backgroundColor: '#333', borderRadius: '16px' }}>{num}</button>)}
                <button onClick={() => handleBackspace('myBday')} style={{ height: '80px', backgroundColor: 'var(--error)', justifyContent: 'center', borderRadius: '16px' }}><Delete size={36} color="#000" /></button>
                <button onClick={() => handlePadTap(0, 'myBday')} style={{ height: '80px', fontSize: '40px', backgroundColor: '#333', borderRadius: '16px' }}>0</button>
              </div>
            </div>
          ) : (
            <>
              {renderChart(calculateChart(myBirthday, getTodayStr()), myNotes, setMyNotes)}
            </>
          )}
        </>
      )}

      {activeTab === 'Others' && (
        <>
          {otherStep === 'bday' && (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ backgroundColor: 'var(--surface)', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '22px', marginBottom: '16px' }}>Enter Their Birthday (MM/DD/YYYY):</p>
                <div style={{ fontSize: '40px', letterSpacing: '4px' }}>{formatInput(otherBday)}</div>
              </div>
              <button className="primary-btn" disabled={otherBday.length < 8} onClick={() => setOtherStep('date')} style={{ justifyContent: 'center', padding: '24px', fontSize: '24px', marginBottom: '24px', borderRadius: '20px' }}>Next: Enter Date <ArrowRight size={28} /></button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: 'auto' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button key={num} onClick={() => handlePadTap(num, 'otherBday')} style={{ height: '80px', fontSize: '40px', backgroundColor: '#333', borderRadius: '16px' }}>{num}</button>)}
                <button onClick={() => handleBackspace('otherBday')} style={{ height: '80px', backgroundColor: 'var(--error)', justifyContent: 'center', borderRadius: '16px' }}><Delete size={36} color="#000" /></button>
                <button onClick={() => handlePadTap(0, 'otherBday')} style={{ height: '80px', fontSize: '40px', backgroundColor: '#333', borderRadius: '16px' }}>0</button>
              </div>
            </div>
          )}
          {otherStep === 'date' && (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ backgroundColor: 'var(--surface)', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '22px', marginBottom: '16px' }}>Enter Date for Reading (MM/DD/YYYY):</p>
                <div style={{ fontSize: '40px', letterSpacing: '4px' }}>{formatInput(otherDate)}</div>
              </div>
              <button className="primary-btn" disabled={otherDate.length < 8} onClick={() => { setOtherStep('reading'); setReadingNotes(''); }} style={{ justifyContent: 'center', padding: '24px', fontSize: '24px', marginBottom: '24px', borderRadius: '20px' }}>Generate Reading <ArrowRight size={28} /></button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: 'auto' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button key={num} onClick={() => handlePadTap(num, 'otherDate')} style={{ height: '80px', fontSize: '40px', backgroundColor: '#333', borderRadius: '16px' }}>{num}</button>)}
                <button onClick={() => handleBackspace('otherDate')} style={{ height: '80px', backgroundColor: 'var(--error)', justifyContent: 'center', borderRadius: '16px' }}><Delete size={36} color="#000" /></button>
                <button onClick={() => handlePadTap(0, 'otherDate')} style={{ height: '80px', fontSize: '40px', backgroundColor: '#333', borderRadius: '16px' }}>0</button>
              </div>
            </div>
          )}
          {otherStep === 'reading' && (
            <>
              <button onClick={() => { setOtherStep('bday'); setOtherBday(''); setOtherDate(''); }} style={{ backgroundColor: '#333', padding: '16px', marginBottom: '24px', borderRadius: '16px', fontSize: '20px', color: '#FFF', border: 'none' }}>
                <RefreshCcw size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> Start New Reading
              </button>
              {renderChart(calculateChart(otherBday, otherDate), readingNotes, setReadingNotes)}
            </>
          )}
        </>
      )}
    </div>
  );
}
