const https = require('https');
const url = 'https://www.payhere.lk/lib/payhere.js';
https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const arrMatch = data.match(/function _0x21c2\(\)\{var _0x2d730e=\[([\s\S]*?)\];return _0x2d730e;\}/);
    if (!arrMatch) {
      console.error('No obfuscated array found');
      process.exit(1);
    }
    const arrText = '[' + arrMatch[1] + ']';
    let arr;
    try {
      arr = eval(arrText);
    } catch (err) {
      console.error('Eval failed:', err.message);
      process.exit(1);
    }
    const decode = (v) => {
      const num = typeof v === 'string' && v.startsWith('0x') ? parseInt(v, 16) : Number(v);
      return arr[num - 0xa7];
    };
    const payhereIndex = data.indexOf('var payhere={');
    if (payhereIndex === -1) {
      console.error('No payhere object found');
      process.exit(1);
    }
    const payhereEnd = data.indexOf('};', payhereIndex);
    if (payhereEnd === -1) {
      console.error('No payhere end found');
      process.exit(1);
    }
    const payhereSource = data.slice(payhereIndex, payhereEnd + 2);

    const decoded = payhereSource.replace(/_0x[0-9a-fA-F]+\((0x[0-9a-fA-F]+|\d+)\)/g, (_, num) => {
      return JSON.stringify(decode(num));
    });
    console.log(decoded);
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
