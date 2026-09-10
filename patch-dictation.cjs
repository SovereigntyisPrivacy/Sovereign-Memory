const fs = require('fs');

const updateDictation = (filePath, targetLogic) => {
  let code = fs.readFileSync(filePath, 'utf8');

  // Inject the native Capacitor import
  if (!code.includes('@capacitor-community/speech-recognition')) {
    code = code.replace(/import \{.*?\} from 'lucide-react';/, match => match + "\nimport { SpeechRecognition } from '@capacitor-community/speech-recognition';");
  }

  // Swap out the web dictation logic for the native logic
  const regex = /const toggleDictation = .*?alert\("Please use keyboard dictation\."\);\s*\}\s*};/s;
  code = code.replace(regex, targetLogic);

  // Inject the necessary state tracking refs
  if (!code.includes('originalTextRef = useRef')) {
    code = code.replace(/const recognitionRef = useRef\(null\);/, "const recognitionRef = useRef(null);\n  const originalTextRef = useRef('');\n  const activeTargetRef = useRef(null);");
  }

  fs.writeFileSync(filePath, code);
};

// 1. Patch Medication Manager
updateDictation('src/MedicationManager.jsx', `const toggleDictation = async (field) => {
    if (isListening) {
      await SpeechRecognition.stop();
      setIsListening(false);
      return;
    }
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return;
      setIsListening(true);
      activeTargetRef.current = field;
      originalTextRef.current = newMed[field] || '';
      
      SpeechRecognition.removeAllListeners();
      SpeechRecognition.addListener("partialResults", (data) => {
        if (data.matches && data.matches.length > 0) {
          setNewMed(prev => ({ ...prev, [activeTargetRef.current]: (originalTextRef.current + ' ' + data.matches[0]).trim() }));
        }
      });
      await SpeechRecognition.start({ language: "en-US", partialResults: true, popup: false });
    } catch (e) {
      setIsListening(false);
    }
  };`);

// 2. Patch Daily Tasks
updateDictation('src/DailyTasks.jsx', `const toggleDictation = async (target) => {
    if (isListening) {
      await SpeechRecognition.stop();
      setIsListening(false);
      return;
    }
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return;
      setIsListening(true);
      activeTargetRef.current = target;
      originalTextRef.current = target === 'title' ? newListTitle : newTaskText;
      
      SpeechRecognition.removeAllListeners();
      SpeechRecognition.addListener("partialResults", (data) => {
        if (data.matches && data.matches.length > 0) {
          const newText = (originalTextRef.current + ' ' + data.matches[0]).trim();
          if (activeTargetRef.current === 'title') setNewListTitle(newText);
          if (activeTargetRef.current === 'task') setNewTaskText(newText);
        }
      });
      await SpeechRecognition.start({ language: "en-US", partialResults: true, popup: false });
    } catch (e) {
      setIsListening(false);
    }
  };`);

// 3. Patch Numerology Workbench
updateDictation('src/NumerologyWorkbench.jsx', `const toggleDictation = async (setNotesFunc) => {
    if (isListening) {
      await SpeechRecognition.stop();
      setIsListening(false);
      return;
    }
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return;
      setIsListening(true);
      originalTextRef.current = document.querySelector('textarea')?.value || '';
      
      SpeechRecognition.removeAllListeners();
      SpeechRecognition.addListener("partialResults", (data) => {
        if (data.matches && data.matches.length > 0) {
           setNotesFunc((originalTextRef.current + ' ' + data.matches[0]).trim());
        }
      });
      await SpeechRecognition.start({ language: "en-US", partialResults: true, popup: false });
    } catch (e) {
      setIsListening(false);
    }
  };`);

console.log("All dictation engines successfully upgraded to native Android!");
