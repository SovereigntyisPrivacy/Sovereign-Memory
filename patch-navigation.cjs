const fs = require('fs');

// 1. Patch App.jsx (Handle App Exit on Home Screen)
let appCode = fs.readFileSync('src/App.jsx', 'utf8');
if (!appCode.includes("addListener('backButton'")) {
  if (!appCode.includes('@capacitor/app')) appCode = "import { App as CapApp } from '@capacitor/app';\n" + appCode;
  if (!appCode.includes('useEffect')) appCode = "import { useEffect } from 'react';\n" + appCode;
  
  const appEffect = `\n  useEffect(() => {\n    const listener = CapApp.addListener('backButton', () => {\n      if (activeTab === 'home') CapApp.exitApp();\n    });\n    return () => { listener.remove(); };\n  }, [activeTab]);\n`;
  appCode = appCode.replace(/(const \[activeTab, setActiveTab\] = useState\('home'\);)/, "$1" + appEffect);
  fs.writeFileSync('src/App.jsx', appCode);
}

// 2. Patch BrainGames.jsx (Handle internal mini-game navigation)
let bgCode = fs.readFileSync('src/BrainGames.jsx', 'utf8');
if (!bgCode.includes("addListener('backButton'")) {
  if (!bgCode.includes('@capacitor/app')) bgCode = "import { App as CapApp } from '@capacitor/app';\n" + bgCode;
  if (!bgCode.includes('useEffect')) bgCode = "import { useEffect } from 'react';\n" + bgCode;

  const bgEffect = `\n  useEffect(() => {\n    const listener = CapApp.addListener('backButton', () => {\n      if (activeGame === 'menu' && typeof goHome === 'function') goHome();\n      else setActiveGame('menu');\n    });\n    return () => { listener.remove(); };\n  }, [activeGame, goHome]);\n`;
  bgCode = bgCode.replace(/(const \[activeGame, setActiveGame\] = useState\('menu'\);)/, "$1" + bgEffect);
  fs.writeFileSync('src/BrainGames.jsx', bgCode);
}

// 3. Patch the Older Modules (Journal, Numerology, Family)
const rest = ['src/SecureJournal.jsx', 'src/NumerologyWorkbench.jsx', 'src/FamilyDirectory.jsx'];
rest.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('@capacitor/app')) code = "import { App as CapApp } from '@capacitor/app';\n" + code;
  if (!code.includes('useEffect')) code = "import { useEffect } from 'react';\n" + code;
  if (!code.includes('Home,')) code = code.replace(/import \{/, "import { Home, ");

  // Inject hardware back listener
  if (!code.includes("addListener('backButton'")) {
    const effect = `\n  useEffect(() => {\n    const listener = CapApp.addListener('backButton', () => {\n      if (typeof goHome === 'function') goHome();\n    });\n    return () => { listener.remove(); };\n  }, [goHome]);\n`;
    code = code.replace(/(return \()/, effect + "$1");
  }

  // Inject UI "GO HOME" button if missing
  if (!code.includes('GO HOME') && !code.includes('onClick={goHome}')) {
    const btn = `\n      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FF9500', padding: '16px 24px', borderRadius: '16px', color: '#000', fontSize: '22px', fontWeight: 'bold', border: 'none', marginBottom: '24px' }}><Home size={24} /> GO HOME</button>\n`;
    code = code.replace(/(return \(\n?\s*<div[^>]*>)/, "$1" + btn);
  }
  fs.writeFileSync(file, code);
});

console.log("✅ Native Hardware Back logic & visual Home buttons dynamically injected!");
