const fs = require('fs');

const files = ['src/SecureJournal.jsx', 'src/NumerologyWorkbench.jsx', 'src/FamilyDirectory.jsx'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  // Specifically target the "react" import line and filter out 'Home'
  code = code.replace(/import\s*\{([^}]*)\}\s*from\s*["']react["']/g, (match, importsStr) => {
    let cleanImports = importsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== 'Home' && s !== '')
      .join(', ');
    return `import { ${cleanImports} } from "react"`;
  });

  fs.writeFileSync(file, code);
});

console.log("✅ Duplicate Home imports scrubbed from React!");
