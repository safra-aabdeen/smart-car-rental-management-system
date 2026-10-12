const fs = require('fs');
const files = fs.readdirSync('src/pages').filter(f => f.startsWith('Admin'));
for (const file of files) {
  const path = 'src/pages/' + file;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace('import AdminSidebar from "../components/AdminSidebar";\n', '');
  content = 'import AdminSidebar from "../components/AdminSidebar";\n' + content;
  fs.writeFileSync(path, content);
  console.log('Fixed import in', file);
}
