import { useState, useEffect } from 'react';
import { Home, Sparkles, Calculator, User, Users, Edit3, Save, History as HistoryIcon, Trash2, Share2, Mic } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const SHORT_MEANINGS = {
  1: "New beginnings, independence, and taking action.",
  2: "Balance, partnership, intuition, and diplomacy.",
  3: "Creativity, self-expression, joy, and communication.",
  4: "Structure, stability, hard work, and foundations.",
  5: "Change, freedom, adventure, and adaptability.",
  6: "Nurturing, family, responsibility, and healing.",
  7: "Spirituality, introspection, analysis, and inner wisdom.",
  8: "Abundance, power, material success, and karma.",
  9: "Completion, humanitarianism, release, and endings.",
  11: "Spiritual illumination, intense intuition, and visionary ideas.",
  22: "Master building, large-scale projects, and manifesting dreams.",
  33: "Master teaching, profound healing, and universal love."
};

const NUMEROLOGY_DATA = {
  1: { meaning: "The Leader: Fiercely independent, creative, and meant to pioneer new paths.", planet: "Sun", sign: "Leo" },
  2: { meaning: "The Peacemaker: Highly intuitive, diplomatic, and deeply values harmony.", planet: "Moon", sign: "Cancer" },
  3: { meaning: "The Communicator: Expressive, artistic, and brings joy and optimism to those around you.", planet: "Jupiter", sign: "Sagittarius" },
  4: { meaning: "The Builder: Practical, grounded, and the reliable foundation others depend on.", planet: "Uranus", sign: "Aquarius" },
  5: { meaning: "The Free Spirit: Craves adventure, freedom, and is highly adaptable to change.", planet: "Mercury", sign: "Gemini & Virgo" },
  6: { meaning: "The Nurturer: A natural caregiver, deeply protective, and values family and home.", planet: "Venus", sign: "Taurus & Libra" },
  7: { meaning: "The Seeker: Analytical, spiritual, and constantly searching for truth and inner wisdom.", planet: "Neptune", sign: "Pisces" },
  8: { meaning: "The Powerhouse: Driven, ambitious, and meant to master the material and financial world.", planet: "Saturn", sign: "Capricorn" },
  9: { meaning: "The Humanitarian: Compassionate, deeply empathetic, and meant to serve the greater good.", planet: "Mars", sign: "Aries & Scorpio" },
  11: { meaning: "The Illuminator (Master): Highly intuitive, a spiritual messenger, and carries immense inner strength.", planet: "Uranus / Neptune", sign: "Aquarius / Pisces" },
  22: { meaning: "The Master Builder (Master): You have the unique ability to turn grand dreams into tangible realities.", planet: "Pluto", sign: "Scorpio" },
  33: { meaning: "The Master Teacher (Master): An avatar of pure compassion, meant to uplift and heal humanity.", planet: "Venus", sign: "Libra" }
};

export default function NumerologyWorkbench({ goHome }) {
  const [view, setView] = useState('mine'); 
  
  const [myBday, setMyBday] = useState('');
  const [myFullName, setMyFullName] = useState('');
  const [isEditingMine, setIsEditingMine] = useState(false);
  
  const [otherName, setOtherName] = useState('');
  const [otherFullName, setOtherFullName] = useState('');
  const [otherBday, setOtherBday] = useState('');
  const [otherNumbers, setOtherNumbers] = useState(null);

  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const savedBday = localStorage.getItem('sovereign_my_bday');
    const savedName = localStorage.getItem('sovereign_my_fullname');
    if (savedBday) setMyBday(savedBday);
    if (savedName) setMyFullName(savedName);

    const savedHistory = localStorage.getItem('sovereign_num_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const listener = CapApp.addListener('backButton', () => {
      if (typeof goHome === 'function') goHome();
    });
    return () => { listener.remove(); };
  }, [goHome]);

  const switchView = (newView) => {
    setView(newView);
    setNotes('');
  };

  const reduceNum = (num) => {
    if (!num) return 0;
    let sum = num.toString().replace(/\D/g, '').split('').map(Number).reduce((a, b) => a + b, 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    return sum;
  };

  const getLetterValue = (char) => {
    const map = {
      a:1, j:1, s:1, b:2, k:2, t:2, c:3, l:3, u:3,
      d:4, m:4, v:4, e:5, n:5, w:5, f:6, o:6, x:6,
      g:7, p:7, y:7, h:8, q:8, z:8, i:9, r:9
    };
    return map[char] || 0;
  };

  const calculateAll = (dateString, fullNameString = '') => {
    if (!dateString) return null;
    const [y, m, d] = dateString.split('-').map(Number);
    const today = new Date();
    const curY = today.getFullYear();
    const curM = today.getMonth() + 1;
    const curD = today.getDate();

    const lifePath = reduceNum(dateString);
    const birthDayNum = reduceNum(d);
    const attitudeNum = reduceNum(reduceNum(m) + reduceNum(d));

    const personalYear = reduceNum(reduceNum(m) + reduceNum(d) + reduceNum(curY));
    const personalMonth = reduceNum(personalYear + curM);
    const personalDay = reduceNum(personalMonth + curD);
    
    const universalYear = reduceNum(curY);
    const universalMonth = reduceNum(universalYear + curM);
    const universalDay = reduceNum(universalMonth + curD);

    let destinyNum = null, soulUrgeNum = null, personalityNum = null;

    if (fullNameString.trim()) {
      const cleanName = fullNameString.toLowerCase().replace(/[^a-z]/g, '');
      let vowelSum = 0, consonantSum = 0, totalSum = 0;

      for (let char of cleanName) {
        const val = getLetterValue(char);
        totalSum += val;
        if (['a', 'e', 'i', 'o', 'u'].includes(char)) vowelSum += val;
        else consonantSum += val;
      }
      destinyNum = reduceNum(totalSum);
      soulUrgeNum = reduceNum(vowelSum);
      personalityNum = reduceNum(consonantSum);
    }

    return { 
      lifePath, birthDayNum, attitudeNum, 
      personalYear, personalMonth, personalDay, 
      universalYear, universalMonth, universalDay,
      destinyNum, soulUrgeNum, personalityNum
    };
  };

  const saveMyInfo = () => {
    if (!myBday) return;
    localStorage.setItem('sovereign_my_bday', myBday);
    localStorage.setItem('sovereign_my_fullname', myFullName);
    setIsEditingMine(false);
  };

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak your notes...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) {
        setNotes(prev => (prev + ' ' + result.matches[0]).trim());
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const saveReadingToHistory = (type) => {
    const isMine = type === 'mine';
    const nums = isMine ? calculateAll(myBday, myFullName) : otherNumbers;
    const name = isMine ? "My Path" : (otherName || "Unknown Friend");
    const date = isMine ? myBday : otherBday;

    if (!nums) return;

    const newEntry = {
      id: Date.now(),
      type: type,
      name: name,
      birthdate: date,
      numbers: nums,
      notes: notes,
      savedAt: new Date().toLocaleDateString()
    };

    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem('sovereign_num_history', JSON.stringify(updated));
    setNotes('');
    alert("Reading secured in History!");
  };

  const deleteReading = (id) => {
    if (window.confirm("Delete this reading permanently?")) {
      const updated = history.filter(h => h.id !== id);
      setHistory(updated);
      localStorage.setItem('sovereign_num_history', JSON.stringify(updated));
    }
  };

  const exportReading = (name, date, nums, userNotes) => {
    const data = NUMEROLOGY_DATA[nums.lifePath] || { meaning: "A unique path.", planet: "?", sign: "?" };
    let body = `Numerology Chart: ${name}\nBirthdate: ${date}\n\n`;
    
    body += `--- CORE PROFILE ---\n`;
    body += `Life Path: ${nums.lifePath} (${data.planet} / ${data.sign})\n${data.meaning}\n\n`;
    body += `Birth Day Number: ${nums.birthDayNum}\n${SHORT_MEANINGS[nums.birthDayNum]}\n\n`;
    body += `Attitude Number: ${nums.attitudeNum}\n${SHORT_MEANINGS[nums.attitudeNum]}\n\n`;
    
    if (nums.destinyNum) {
      body += `--- NAME NUMBERS ---\n`;
      body += `Destiny: ${nums.destinyNum}\n${SHORT_MEANINGS[nums.destinyNum]}\n\n`;
      body += `Soul Urge: ${nums.soulUrgeNum}\n${SHORT_MEANINGS[nums.soulUrgeNum]}\n\n`;
      body += `Personality: ${nums.personalityNum}\n${SHORT_MEANINGS[nums.personalityNum]}\n\n`;
    }

    body += `--- CURRENT CYCLES ---\n`;
    body += `Universal Year: ${nums.universalYear}\n${SHORT_MEANINGS[nums.universalYear]}\n\n`;
    body += `Universal Month: ${nums.universalMonth}\n${SHORT_MEANINGS[nums.universalMonth]}\n\n`;
    body += `Universal Day: ${nums.universalDay}\n${SHORT_MEANINGS[nums.universalDay]}\n\n`;
    body += `Personal Year: ${nums.personalYear}\n${SHORT_MEANINGS[nums.personalYear]}\n\n`;
    body += `Personal Month: ${nums.personalMonth}\n${SHORT_MEANINGS[nums.personalMonth]}\n\n`;
    body += `Personal Day: ${nums.personalDay}\n${SHORT_MEANINGS[nums.personalDay]}\n\n`;
    
    if (userNotes) body += `--- NOTES ---\n${userNotes}`;
    
    window.location.href = `mailto:?subject=Numerology Reading: ${encodeURIComponent(name)}&body=${encodeURIComponent(body)}`;
  };

  const NumRow = ({ title, num, highlight = false }) => (
    <div style={{ backgroundColor: '#222', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: highlight ? '2px solid #FFD700' : 'none' }}>
      <div style={{ color: highlight ? '#FFD700' : '#CCC', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</div>
      <div style={{ color: '#FF9500', fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{num}</div>
      <div style={{ color: '#FFF', fontSize: '18px', lineHeight: '1.4' }}>{SHORT_MEANINGS[num] || "A unique energetic path."}</div>
    </div>
  );

  const ReadingCard = ({ nums, name, onSave }) => {
    const data = NUMEROLOGY_DATA[nums.lifePath] || { meaning: "A beautiful and unique path awaits you.", planet: "Unknown", sign: "Unknown" };
    return (
      <div style={{ paddingBottom: '24px' }}>
        <h2 style={{ color: '#FFF', fontSize: '28px', textAlign: 'center', margin: '0 0 24px 0' }}>
          Today's Energies for {name}
        </h2>

        <div style={{ border: '2px solid #FF9500', borderRadius: '24px', padding: '24px', backgroundColor: '#111' }}>
          <h3 style={{ color: '#FFF', fontSize: '24px', marginTop: 0, marginBottom: '24px' }}>Full Numerology Chart</h3>

          <div style={{ backgroundColor: '#222', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '2px solid #FFD700' }}>
            <div style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Life Path Number</div>
            <div style={{ color: '#FF9500', fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>{nums.lifePath}</div>
            <div style={{ color: '#FFF', fontSize: '18px', lineHeight: '1.4', marginBottom: '12px' }}>{data.meaning}</div>
            <div style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>Planet: {data.planet} | Sign: {data.sign}</div>
          </div>

          <NumRow title="Birth Day Number" num={nums.birthDayNum} />
          <NumRow title="Attitude Number" num={nums.attitudeNum} />
          
          {nums.destinyNum > 0 && (
            <>
              <div style={{ borderTop: '2px dashed #444', margin: '24px 0' }} />
              <NumRow title="Destiny Number" num={nums.destinyNum} />
              <NumRow title="Soul Urge Number" num={nums.soulUrgeNum} />
              <NumRow title="Personality Number" num={nums.personalityNum} />
            </>
          )}

          <div style={{ borderTop: '2px dashed #444', margin: '24px 0' }} />
          
          <NumRow title="Universal Year" num={nums.universalYear} />
          <NumRow title="Universal Month" num={nums.universalMonth} />
          <NumRow title="Universal Day" num={nums.universalDay} />
          
          <NumRow title="Personal Year" num={nums.personalYear} />
          <NumRow title="Personal Month" num={nums.personalMonth} />
          <NumRow title="Personal Day" num={nums.personalDay} />
        </div>

        <h3 style={{ margin: '24px 0 12px 0', fontSize: '24px', color: '#FFF' }}>Notes on this reading:</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Tap here to write down your thoughts..." 
            style={{ flexGrow: 1, minHeight: '120px', backgroundColor: '#222', color: '#FFF', fontSize: '20px', padding: '16px', borderRadius: '16px', border: '2px solid #444', resize: 'none', outline: 'none' }} 
          />
          <button onClick={toggleDictation} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: isListening ? '#FF9500' : '#222', border: '2px solid #FF9500', borderRadius: '16px', width: '80px', color: isListening ? '#000' : '#FFF', fontWeight: 'bold' }}>
            <Mic size={28} color={isListening ? '#000' : '#FF9500'} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={() => exportReading(name, name === 'You' ? myBday : otherBday, nums, notes)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: '#2E7D32', border: 'none', borderRadius: '16px', padding: '20px', color: '#FFF', fontSize: '22px', fontWeight: 'bold' }}>
            <Share2 size={28} /> Export Full Reading
          </button>
          <button onClick={onSave} style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: '2px solid #555', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <Save size={24} /> Save to History
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button onClick={() => switchView('mine')} style={{ flex: 1, backgroundColor: view === 'mine' ? '#FF9500' : '#222', color: view === 'mine' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <User size={24} /> My Daily<br/>Numbers
        </button>
        <button onClick={() => switchView('other')} style={{ flex: 1, backgroundColor: view === 'other' ? '#FF9500' : '#222', color: view === 'other' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Users size={24} /> Read for<br/>Others
        </button>
        <button onClick={() => switchView('history')} style={{ flex: 1, backgroundColor: view === 'history' ? '#FF9500' : '#222', color: view === 'history' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <HistoryIcon size={24} /> History
        </button>
      </div>

      {view === 'mine' && (
        <>
          {(!myBday || isEditingMine) ? (
            <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '20px', border: '2px solid #444' }}>
              <h2 style={{ color: '#FFF', margin: '0 0 16px 0', fontSize: '24px' }}>Enter Your Birthdate:</h2>
              <input 
                type="date" value={myBday} onChange={(e) => setMyBday(e.target.value)}
                style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '28px', padding: '20px', borderRadius: '16px', border: '2px solid #FF9500', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
              />
              <h2 style={{ color: '#FFF', margin: '0 0 16px 0', fontSize: '24px' }}>Full Birth Name (Optional):</h2>
              <input 
                type="text" value={myFullName} onChange={(e) => setMyFullName(e.target.value)} placeholder="For Destiny numbers..."
                style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '20px', borderRadius: '16px', border: '2px solid #555', outline: 'none', marginBottom: '24px', boxSizing: 'border-box' }}
              />
              <button onClick={saveMyInfo} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px' }}>
                Lock in My Blueprint
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsEditingMine(true)} style={{ position: 'absolute', top: '0px', right: '16px', backgroundColor: '#333', border: 'none', color: '#FFF', padding: '12px', borderRadius: '12px', zIndex: 10 }}>
                <Edit3 size={24} />
              </button>
              <ReadingCard nums={calculateAll(myBday, myFullName)} name="You" onSave={() => saveReadingToHistory('mine')} />
            </div>
          )}
        </>
      )}

      {view === 'other' && (
        <>
          <div style={{ backgroundColor: '#111', padding: '24px', borderRadius: '20px', border: '2px solid #444', marginBottom: '24px' }}>
            <h2 style={{ color: '#FFF', margin: '0 0 12px 0', fontSize: '22px' }}>Name:</h2>
            <input 
              type="text" value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="e.g. Will"
              style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '16px', borderRadius: '12px', border: '2px solid #555', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            <h2 style={{ color: '#FFF', margin: '0 0 12px 0', fontSize: '22px' }}>Birthdate:</h2>
            <input 
              type="date" value={otherBday} onChange={(e) => setOtherBday(e.target.value)}
              style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '16px', borderRadius: '12px', border: '2px solid #FF9500', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            <h2 style={{ color: '#FFF', margin: '0 0 12px 0', fontSize: '22px' }}>Full Birth Name (Optional):</h2>
            <input 
              type="text" value={otherFullName} onChange={(e) => setOtherFullName(e.target.value)} placeholder="For Destiny numbers..."
              style={{ width: '100%', backgroundColor: '#222', color: '#FFF', fontSize: '24px', padding: '16px', borderRadius: '12px', border: '2px solid #555', outline: 'none', marginBottom: '24px', boxSizing: 'border-box' }}
            />
            <button onClick={() => setOtherNumbers(calculateAll(otherBday, otherFullName))} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
              <Calculator size={28} /> Calculate Blueprint
            </button>
          </div>

          {otherNumbers && (
            <ReadingCard nums={otherNumbers} name={otherName || "Friend"} onSave={() => saveReadingToHistory('other')} />
          )}
        </>
      )}

      {view === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '20px' }}>No saved readings.</p> : 
            history.map(entry => {
              return (
                <div key={entry.id} style={{ backgroundColor: '#222', border: '2px solid #444', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{entry.name}</div>
                      <div style={{ color: '#888', fontSize: '18px' }}>{entry.savedAt}</div>
                    </div>
                    <div style={{ backgroundColor: '#FF9500', color: '#000', fontSize: '28px', fontWeight: 'bold', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {entry.numbers.lifePath}
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div style={{ backgroundColor: '#111', padding: '12px', borderRadius: '12px', marginBottom: '16px', borderLeft: '4px solid #3B82F6' }}>
                      <div style={{ fontSize: '16px', color: '#CCC', fontStyle: 'italic' }}>"{entry.notes}"</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => exportReading(entry.name, entry.birthdate, entry.numbers, entry.notes)} style={{ flex: 1, backgroundColor: '#112244', border: '2px solid #3B82F6', color: '#3B82F6', padding: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Share2 size={20} /> Export
                    </button>
                    <button onClick={() => deleteReading(entry.id)} style={{ backgroundColor: 'transparent', border: '2px solid #FF3B30', color: '#FF3B30', padding: '12px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
