import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trash2, Mic } from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { App as CapApp } from '@capacitor/app';

export default function SecureJournal({ goHome }) {
  const [entryText, setEntryText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [mood, setMood] = useState('😊');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  
  const originalTextRef = useRef('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString());
      setTimeStr(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // NATIVE HARDWARE BACK BUTTON LISTENER
  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (goHome) goHome();
    });
    return () => { listener.remove(); };
  }, [goHome]);

  const toggleDictation = async () => {
    if (isListening) {
      await SpeechRecognition.stop();
      setIsListening(false);
      return;
    }

    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') {
        alert("Microphone permission is required to dictate.");
        return;
      }

      // Save the current text so we can seamlessly append new speech to it
      originalTextRef.current = entryText;
      setIsListening(true);
      
      SpeechRecognition.removeAllListeners();
      SpeechRecognition.addListener("partialResults", (data) => {
        if (data.matches && data.matches.length > 0) {
          setEntryText((originalTextRef.current + ' ' + data.matches[0]).trim());
        }
      });

      await SpeechRecognition.start({
        language: "en-US",
        partialResults: true,
        popup: false
      });
    } catch (e) {
      console.error("Dictation error:", e);
      setIsListening(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
      
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '16px 24px', borderRadius: '16px', color: '#FFF', fontSize: '24px', fontWeight: 'bold', border: 'none' }}>
          <ArrowLeft size={28} /> Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--accent)', fontSize: '20px', fontWeight: 'bold' }}>{dateStr}</div>
          <div style={{ color: '#CCC', fontSize: '16px' }}>{timeStr}</div>
        </div>
        <button onClick={() => setEntryText('')} style={{ backgroundColor: 'transparent', border: '2px solid var(--error)', padding: '16px', borderRadius: '16px', color: 'var(--error)' }}>
          <Trash2 size={28} />
        </button>
      </div>

      {/* Quote Box */}
      <div style={{ border: '2px dashed var(--accent)', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ color: 'var(--accent)', fontSize: '22px', fontStyle: 'italic', margin: 0 }}>"Your words matter. Take your time."</p>
      </div>

      {/* Mood Selectors */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {['😊', '😌', '😢', '😠', '💖'].map(m => (
          <button key={m} onClick={() => setMood(m)} style={{ flex: 1, height: '70px', fontSize: '40px', backgroundColor: mood === m ? 'var(--accent)' : '#222', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
            {m}
          </button>
        ))}
      </div>

      {/* Color Selectors */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {['#FFFFFF', '#FCD34D', '#86EFAC', '#93C5FD', '#F9A8D4'].map(c => (
          <button key={c} onClick={() => setBgColor(c)} style={{ flex: 1, height: '70px', backgroundColor: c, borderRadius: '16px', border: bgColor === c ? '4px solid var(--accent)' : 'none' }} />
        ))}
      </div>

      {/* Text Area */}
      <textarea 
        value={entryText}
        onChange={(e) => setEntryText(e.target.value)}
        placeholder="Tap to type, or hit Dictate to speak your mind..."
        style={{ flexGrow: 1, width: '100%', minHeight: '200px', backgroundColor: '#222', color: '#FFF', fontSize: '26px', padding: '24px', borderRadius: '24px', border: 'none', resize: 'none', marginBottom: '24px' }}
      />

      {/* Massive Dictate Button */}
      <button onClick={toggleDictation} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: isListening ? 'var(--accent)' : 'transparent', border: '3px solid var(--accent)', borderRadius: '20px', padding: '24px', color: isListening ? '#000' : '#FFF', fontSize: '28px', fontWeight: 'bold' }}>
        <Mic size={36} color={isListening ? '#000' : 'var(--accent)'} />
        {isListening ? 'Listening...' : 'Tap to Dictate'}
      </button>

    </div>
  );
}
