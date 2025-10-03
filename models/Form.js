// models/Form.js
function tryRequire(p) {
  try { return require(p); } catch (_) { return null; }
}

// 👇 Put your actual file FIRST (you import it elsewhere as "../models/formModels")
const candidates = [
  './formModels',   // ✅ your real model file
  './formModel',
  './FormModel',
  './forms',
  './form',
  './tenantForm',
  './TenantForm',
];

let mod = null;
for (const rel of candidates) {
  const m = tryRequire(rel);
  if (m) { mod = m; break; }
}

if (!mod) {
  throw new Error(
    'models/Form.js shim could not find your real Form model. ' +
    'Edit the candidates array to include the correct filename.'
  );
}

module.exports = mod.default || mod;
module.exports = require('./formModels');