const fs = require('fs');
const files = fs.readdirSync('src/pages').filter(f => f.startsWith('Admin'));
for (const file of files) {
  const path = 'src/pages/' + file;
  let content = fs.readFileSync(path, 'utf8');
  
  const importMatch = content.match(/import\s*{([^}]+)}\s*from\s*["']react-icons\/fa["']/);
  if (importMatch) {
    let imports = importMatch[1];
    if (!imports.includes('FaMoneyCheckAlt')) {
      const newImports = imports + ', FaMoneyCheckAlt';
      content = content.replace(importMatch[0], `import {${newImports}} from 'react-icons/fa'`);
      fs.writeFileSync(path, content);
      console.log('Fixed imports in', file);
    }
  }
}
