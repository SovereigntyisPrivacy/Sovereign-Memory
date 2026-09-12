const fs = require('fs');

const files = ['src/SecureJournal.jsx', 'src/NumerologyWorkbench.jsx', 'src/FamilyDirectory.jsx'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  // 1. Remove 'Home' from the Capacitor import
  code = code.replace(/import\s*\{\s*Home,\s*App as CapApp\s*\}/g, "import { App as CapApp }");
  
  // 2. Add 'Home' to the lucide-react import safely
  const lucideMatch = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  if (lucideMatch && !lucideMatch[1].includes('Home')) {
    code = code.replace(/(import\s*\{)([^}]*)(\}\s*from\s*['"]lucide-react['"])/, "$1 Home, $2$3");
  }

  fs.writeFileSync(file, code);
});

console.log("✅ Fixed mangled imports in older modules!");
