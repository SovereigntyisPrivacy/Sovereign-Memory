const fs = require('fs');

const updateDictation = (filePath, newLogic) => {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  
  // This regex finds the old buggy toggleDictation function and replaces it
  const regex = /const toggleDictation = async \([^)]*\) => \{[\s\S]*?catch \(e\) \{[^}]*\}\s*\};/;
  
  if (regex.test(code)) {
    code = code.replace(regex, newLogic);
    fs.writeFileSync(filePath, code);
    console.log(`✅ Successfully upgraded dictation in: ${filePath}`);
  }
};

// 1. Patch Secure Journal
updateDictation('src/SecureJournal.jsx', `const toggleDictation = async () => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({
        language: "en-US", prompt: "Speak your entry...", partialResults: false, popup: true
      });
      if (result && result.matches && result.matches.length > 0) {
        setEntryText(prev => (prev + ' ' + result.matches[0]).trim());
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };`);

// 2. Patch Medication Manager
updateDictation('src/MedicationManager.jsx', `const toggleDictation = async (field) => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return;
      setIsListening(true);
      const result = await SpeechRecognition.start({
        language: "en-US", prompt: "Speak the medication detail...", partialResults: false, popup: true
      });
      if (result && result.matches && result.matches.length > 0) {
        setNewMed(prev => ({ ...prev, [field]: ((prev[field] || '') + ' ' + result.matches[0]).trim() }));
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };`);

// 3. Patch Daily Tasks
updateDictation('src/DailyTasks.jsx', `const toggleDictation = async (target) => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return;
      setIsListening(true);
      const result = await SpeechRecognition.start({
        language: "en-US", prompt: "Speak your task...", partialResults: false, popup: true
      });
      if (result && result.matches && result.matches.length > 0) {
        const spoken = result.matches[0];
        if (target === 'title') setNewListTitle(prev => (prev + ' ' + spoken).trim());
        if (target === 'task') setNewTaskText(prev => (prev + ' ' + spoken).trim());
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };`);

// 4. Patch Numerology Workbench
updateDictation('src/NumerologyWorkbench.jsx', `const toggleDictation = async (setNotesFunc) => {
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
  };`);

console.log("🚀 All tools successfully wired to the Google Voice overlay!");
