import { useState, useEffect } from 'react';
import { ArrowLeft, Home, Mic, Trash2, Copy, BookOpen, Languages, Sparkles } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Clipboard } from '@capacitor/clipboard';

const ELDER_FUTHARK = [
  { id: 'fehu', rune: 'ᚠ', name: 'Fehu', letter: 'F', meaning: 'Wealth, abundance, energy, foresight, fertility, and creation. The primal fire.' },
  { id: 'uruz', rune: 'ᚢ', name: 'Uruz', letter: 'U', meaning: 'Physical strength, endurance, untamed potential, courage, and vitality.' },
  { id: 'thurisaz', rune: 'ᚦ', name: 'Thurisaz', letter: 'TH', meaning: 'Reactive force, directed power, conflict, defense, and destruction of enemies.' },
  { id: 'ansuz', rune: 'ᚨ', name: 'Ansuz', letter: 'A', meaning: 'Communication, divine inspiration, wisdom, truth, and the breath of life.' },
  { id: 'raidho', rune: 'ᚱ', name: 'Raidho', letter: 'R', meaning: 'The journey, destiny, rhythm, physical or spiritual travel, and the cycles of nature.' },
  { id: 'kenaz', rune: 'ᚲ', name: 'Kenaz', letter: 'K / C', meaning: 'Knowledge, creativity, inspiration, the controlled fire of the torch, and revelation.' },
  { id: 'gebo', rune: 'ᚷ', name: 'Gebo', letter: 'G', meaning: 'Gifts, generosity, partnerships, balance in exchange, and sacred contracts.' },
  { id: 'wunjo', rune: 'ᚹ', name: 'Wunjo', letter: 'W / V', meaning: 'Joy, harmony, fellowship, comfort, pleasure, and the fulfillment of wishes.' },
  { id: 'hagalaz', rune: 'ᚺ', name: 'Hagalaz', letter: 'H', meaning: 'Sudden change, crisis, radical disruption, the destructive forces of nature, and testing.' },
  { id: 'nauthiz', rune: 'ᚾ', name: 'Nauthiz', letter: 'N', meaning: 'Need, friction, restriction, survival, and the fire kindled through hard work.' },
  { id: 'isa', rune: 'ᛁ', name: 'Isa', letter: 'I', meaning: 'Ice, stillness, patience, concentration, psychological blocks, and turning inward.' },
  { id: 'jera', rune: 'ᛃ', name: 'Jera', letter: 'J / Y', meaning: 'The harvest, peaceful cycles, reaping what you sow, and the turning of the year.' },
  { id: 'eihwaz', rune: 'ᛇ', name: 'Eihwaz', letter: 'EI', meaning: 'The Yew tree, the world tree (Yggdrasil), life and death, defense, and spiritual resilience.' },
  { id: 'perthro', rune: 'ᛈ', name: 'Perthro', letter: 'P', meaning: 'Mystery, fate, chance, the unknown, hidden things, and the womb.' },
  { id: 'algiz', rune: 'ᛉ', name: 'Algiz', letter: 'Z', meaning: 'Protection, sanctuary, the elk sedge, defense, and connection to the divine or higher self.' },
  { id: 'sowilo', rune: 'ᛊ', name: 'Sowilo', letter: 'S', meaning: 'The sun, success, goals achieved, honor, life-force, and victory.' },
  { id: 'tiwaz', rune: 'ᛏ', name: 'Tiwaz', letter: 'T', meaning: 'Justice, sacrifice, leadership, the warrior spirit, honor, and logical strategy.' },
  { id: 'berkano', rune: 'ᛒ', name: 'Berkano', letter: 'B', meaning: 'Birth, sanctuary, new beginnings, healing, growth, and the Birch goddess.' },
  { id: 'ehwaz', rune: 'ᛖ', name: 'Ehwaz', letter: 'E', meaning: 'The horse, trust, teamwork, steady progress, and harmonious partnership.' },
  { id: 'mannaz', rune: 'ᛗ', name: 'Mannaz', letter: 'M', meaning: 'Mankind, the self, social order, awareness, intelligence, and human connection.' },
  { id: 'laguz', rune: 'ᛚ', name: 'Laguz', letter: 'L', meaning: 'Water, the subconscious, intuition, dreams, the flow of life, and emotional depths.' },
  { id: 'ingwaz', rune: 'ᛜ', name: 'Ingwaz', letter: 'NG', meaning: 'Internal growth, gestation, male fertility, completion, and stored energy ready to burst.' },
  { id: 'othala', rune: 'ᛟ', name: 'Othala', letter: 'O', meaning: 'Ancestral property, heritage, inherited wisdom, home, and ingrained values.' },
  { id: 'dagaz', rune: 'ᛞ', name: 'Dagaz', letter: 'D', meaning: 'Dawn, awakening, clarity, breakthrough, the balance of light and dark, and a new day.' }
];

const TRANSLATION_MAP = {
  'a': 'ᚨ', 'b': 'ᛒ', 'c': 'ᚲ', 'd': 'ᛞ', 'e': 'ᛖ', 'f': 'ᚠ', 'g': 'ᚷ', 'h': 'ᚺ',
  'i': 'ᛁ', 'j': 'ᛃ', 'k': 'ᚲ', 'l': 'ᛚ', 'm': 'ᛗ', 'n': 'ᚾ', 'o': 'ᛟ', 'p': 'ᛈ',
  'q': 'ᚲ', 'r': 'ᚱ', 's': 'ᛊ', 't': 'ᛏ', 'u': 'ᚢ', 'v': 'ᚹ', 'w': 'ᚹ', 'y': 'ᛃ', 'z': 'ᛉ'
};
export default function RuneWorkbench({ goHome }) {
  const [view, setView] = useState('translator'); 
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedRune, setSelectedRune] = useState(null);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (typeof goHome === 'function') goHome();
    });
    return () => { listener.remove(); };
  }, [goHome]);

  const translateToRunes = (text) => {
    if (!text) return "";
    let str = text.toLowerCase();
    str = str.replace(/th/g, 'ᚦ');
    str = str.replace(/ng/g, 'ᛜ');
    str = str.replace(/x/g, 'ᚲᛊ');
    str = str.replace(/ /g, ' ᛫ ');
    let runicString = "";
    for (let char of str) {
      if (TRANSLATION_MAP[char]) runicString += TRANSLATION_MAP[char];
      else if (['ᚦ', 'ᛜ', 'ᚲ', 'ᛊ', ' ᛫ '].includes(char) || char === '᛫' || char === ' ') runicString += char;
      else runicString += char; 
    }
    return runicString;
  };

  const runicOutput = translateToRunes(inputText);

  const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak to carve runes...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) {
        setInputText(prev => (prev + ' ' + result.matches[0]).trim());
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const copyRunes = async () => {
    if (!runicOutput) return;
    await Clipboard.write({ string: runicOutput });
    alert("Runes copied to clipboard!");
  };

  const renderTranslator = () => (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '24px' }}>
      <textarea 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)} 
        placeholder="Type English here to carve Runes..." 
        style={{ width: "100%", minHeight: "20vh", fontSize: "32px", padding: "24px", lineHeight: "1.6", borderRadius: "24px", backgroundColor: "#222", color: "#FFF", border: "2px solid #555", outline: "none", boxSizing: "border-box", resize: "none" }} 
      />
      
      <div style={{ width: "100%", minHeight: "25vh", padding: "24px", borderRadius: "24px", backgroundColor: "#111", border: "4px solid #FF9500", display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#FF9500", fontSize: "18px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "16px" }}>Runic Translation</div>
        <div style={{ color: "#FFF", fontSize: "42px", fontWeight: "bold", letterSpacing: "4px", lineHeight: "1.6", wordBreak: "break-word" }}>
          {runicOutput || <span style={{ color: '#555' }}>ᛏᚺᛖ ᛫ ᚱᚢᚾᛖᛊ ᛫ ᚨᚹᚨᛁᛏ</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <button onClick={toggleDictation} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: isListening ? '#FF9500' : '#333', border: '2px solid #FF9500', borderRadius: '24px', color: isListening ? '#000' : '#FFF', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Mic size={36} color={isListening ? '#000' : '#FF9500'} /></button>
        <button onClick={copyRunes} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#112244', border: '2px solid #3B82F6', borderRadius: '24px', color: '#3B82F6', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Copy size={36} /></button>
        <button onClick={() => setInputText('')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#441111', border: '2px solid #FF3B30', borderRadius: '24px', color: '#FF3B30', fontSize: '24px', fontWeight: 'bold', minHeight: '90px' }}><Trash2 size={36} /></button>
      </div>
    </div>
  );
  const renderPicker = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {selectedRune && (
        <div style={{ backgroundColor: '#1E1E1E', border: '4px solid #FF9500', borderRadius: '24px', padding: '32px', textAlign: 'center', position: 'relative' }}>
          <button onClick={() => setSelectedRune(null)} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#333', border: 'none', color: '#FFF', padding: '12px', borderRadius: '16px' }}>Close</button>
          <div style={{ fontSize: '80px', color: '#FF9500', fontWeight: 'bold', lineHeight: '1', marginBottom: '16px' }}>{selectedRune.rune}</div>
          <h3 style={{ color: '#FFF', fontSize: '36px', margin: '0 0 8px 0' }}>{selectedRune.name}</h3>
          <div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Letter: {selectedRune.letter}</div>
          <p style={{ color: '#E0E0E0', fontSize: '24px', lineHeight: '1.5', margin: 0 }}>{selectedRune.meaning}</p>
        </div>
      )}
      
      {!selectedRune && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {ELDER_FUTHARK.map(r => (
            <button key={r.id} onClick={() => setSelectedRune(r)} style={{ backgroundColor: '#111', border: '2px solid #444', borderRadius: '16px', padding: '24px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '48px', color: '#FF9500', fontWeight: 'bold' }}>{r.rune}</div>
              <div style={{ fontSize: '16px', color: '#FFF', fontWeight: 'bold' }}>{r.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px', overflowY: 'auto' }}>
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}>
        <Home size={24} /> GO HOME
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setView('translator')} style={{ flex: 1, backgroundColor: view === 'translator' ? '#FF9500' : '#222', color: view === 'translator' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Languages size={24} /> Translator
        </button>
        <button onClick={() => setView('picker')} style={{ flex: 1, backgroundColor: view === 'picker' ? '#FF9500' : '#222', color: view === 'picker' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={24} /> Rune Meanings
        </button>
      </div>

      {view === 'translator' ? renderTranslator() : renderPicker()}
    </div>
  );
}
