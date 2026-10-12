const fs = require('fs');

const files = fs.readdirSync('src/pages').filter(f => f.startsWith('Admin'));

for (const file of files) {
  const path = 'src/pages/' + file;
  let content = fs.readFileSync(path, 'utf8');

  // Skip if already has AdminSidebar
  if (content.includes('<AdminSidebar />')) continue;

  // 1. Add import statement
  if (!content.includes('AdminSidebar')) {
    const importStatement = `import AdminSidebar from "../components/AdminSidebar";\n`;
    // Insert after the last import
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, endOfLastImport) + importStatement + content.slice(endOfLastImport);
  }

  // 2. Remove old sidebar and insert <AdminSidebar />
  // The sidebar starts with <div className="w-72 bg-slate-950
  // The main content starts with <div className="flex-1 or <main className="flex-1
  const sidebarStart = content.indexOf('<div className="w-72 bg-slate-950');
  
  if (sidebarStart !== -1) {
    let mainStart = content.indexOf('<div className="flex-1', sidebarStart);
    if (mainStart === -1) {
      mainStart = content.indexOf('<main className="flex-1', sidebarStart);
    }
    
    if (mainStart !== -1) {
      // Find the last closing tag of the sidebar which is right before mainStart
      // Usually there are some spaces or comments
      let beforeMain = content.slice(0, sidebarStart);
      let afterMain = content.slice(mainStart);
      
      content = beforeMain + '<AdminSidebar />\n\n      ' + afterMain;
    }
  }

  fs.writeFileSync(path, content);
  console.log('Refactored', file);
}
