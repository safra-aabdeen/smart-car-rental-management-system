const fs = require('fs');
const files = fs.readdirSync('src/pages').filter(f => f.startsWith('Admin') && f !== 'AdminRefunds.jsx');
for (const file of files) {
  const path = 'src/pages/' + file;
  let content = fs.readFileSync(path, 'utf8');
  if (content.includes('Refunds')) continue;
  
  const refundMenu = `{/* REFUNDS */}

            <button
              onClick={() => navigate("/admin/refunds")}
              className={\`
                flex items-center gap-3 w-full p-4 rounded-xl transition
                \${
                  location.pathname === "/admin/refunds"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800"
                  }
              \`}
            >
              <FaMoneyCheckAlt />
                Refunds
            </button>

            {/* REVIEWS */}`;

  content = content.replace('{/* REVIEWS */}', refundMenu);
  
  if (!content.includes('FaMoneyCheckAlt')) {
     content = content.replace('FaSignOutAlt,', 'FaSignOutAlt,\n  FaMoneyCheckAlt,');
  }
  
  fs.writeFileSync(path, content);
  console.log('Updated ' + file);
}
