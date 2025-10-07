// // server.js
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');

// dotenv.config();

// // DB (named export)
// const { connectDB } = require('./config/db');

// // Routers
// const formRoutes = require('./routes/formRoutes');
// const maintenanceRoutes = require('./routes/MaintRoutes');
// const supplierRoutes = require('./routes/supplierRoutes');
// const projectRoutes = require('./routes/Project');
// const roomRoutes = require('./routes/roomRoutes');
// const lightBillRoutes = require('./routes/lightBillRoutes');
// const otherExpenseRoutes = require('./routes/otherExpenseRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');
// const authRoutes = require('./routes/authRoutes');
// const formWithDocsRoutes = require('./routes/formWithDocs');
// const documentRoutes = require('./routes/documentRoutes');

// const app = express();
// const PORT = process.env.PORT || 8000;

// /* ----------------------------- Middleware ------------------------------ */
// app.use(cors());
// app.use(express.json());

// // Static files for uploaded content (so /uploads/** works)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // (Optional) quiet Chrome DevTools CSP probe in dev (cosmetic)
// app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => res.sendStatus(204));

// // Simple health check
// app.get('/api/health', (_req, res) => res.json({ ok: true }));

// /* -------------------------------- Routes ------------------------------- */
// app.use('/api', authRoutes);
// app.use('/api', formRoutes);
// app.use('/api', formWithDocsRoutes);
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/suppliers', supplierRoutes);
// app.use('/api', projectRoutes);
// app.use('/api/rooms', roomRoutes);
// app.use('/api/light-bill', lightBillRoutes);
// app.use('/api/other-expense', otherExpenseRoutes);
// app.use('/api/uploads', uploadRoutes);
// app.use('/api/documents', documentRoutes);

// /* -------- Optional: list all registered routes for quick debugging ------ */
// function listRoutes(appRef) {
//   const routes = [];
//   if (!appRef._router) {
//     console.log('No router mounted yet.');
//     return;
//   }
//   appRef._router.stack.forEach((m) => {
//     if (m.route) {
//       routes.push(
//         `${Object.keys(m.route.methods).join(',').toUpperCase()} ${m.route.path}`
//       );
//     } else if (m.name === 'router' && m.handle?.stack) {
//       m.handle.stack.forEach((h) => {
//         if (h.route) {
//           routes.push(
//             `[mounted] ${Object.keys(h.route.methods).join(',').toUpperCase()} ${h.route.path}`
//           );
//         }
//       });
//     }
//   });
//   console.log('== Registered routes ==');
//   routes.forEach((r) => console.log(r));
// }
// listRoutes(app);

// /* -------------------------- Error handler ------------------------------- */
// app.use((err, _req, res, _next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Server error' });
// });

// /* ---------------------------- DB + Server ------------------------------- */
// // Fire-and-forget connect (your connectDB logs failures and only exits if URI missing)
// connectDB();

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });











// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');
// const fs = require('fs');

// const { connectDB } = require('./config/db');

// // Routers
// const formRoutes = require('./routes/formRoutes');
// const maintenanceRoutes = require('./routes/MaintRoutes');
// const supplierRoutes = require('./routes/supplierRoutes');
// const projectRoutes = require('./routes/Project');
// const roomRoutes = require('./routes/roomRoutes');
// const lightBillRoutes = require('./routes/lightBillRoutes');
// const otherExpenseRoutes = require('./routes/otherExpenseRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');
// const authRoutes = require('./routes/authRoutes');
// const formWithDocsRoutes = require('./routes/formWithDocs');   // if this exposes extra form endpoints
// const documentRoutes = require('./routes/documentRoutes');      // <-- single import name for /api/documents

// dotenv.config();

// // const { connectDB } = require('./config/db'); // ✅ single import

// const app = express();
// const SECRET_KEY = '.pnmINFOtech.';

// /* ----------------------------- Middleware ------------------------------ */
// app.use(cors());
// app.use(express.json());

// // Static files for uploaded content (so /uploads/** works)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // (Optional) quiet Chrome DevTools CSP probe in dev (cosmetic)
// app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => res.sendStatus(204));

// // Simple health check
// app.get('/api/health', (_req, res) => res.json({ ok: true }));

// // ---------- API Routes (mount once each) ----------
// app.use('/api', authRoutes);
// app.use('/api', formRoutes);
// app.use('/api', formWithDocsRoutes);            // keep if you actually use these routes
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/suppliers', supplierRoutes);
// app.use('/api', projectRoutes);
// app.use('/api/rooms', roomRoutes);
// app.use('/api/light-bill', lightBillRoutes);
// app.use('/api/other-expense', otherExpenseRoutes);
// app.use('/api/uploads', uploadRoutes);
// app.use('/api/documents', documentRoutes);      // <-- single mount for document download/view

// // ---------- (Optional) Route listing helper ----------
// function listRoutes(app) {
//   const routes = [];
//   if (!appInst._router) {
//     console.log('No router mounted yet.');
//     return;
//   }
//   appInst._router.stack.forEach((m) => {
//     if (m.route) {
//       routes.push(`${Object.keys(m.route.methods).join(',').toUpperCase()} ${m.route.path}`);
//     } else if (m.name === 'router' && m.handle?.stack) {
//       m.handle.stack.forEach((h) => {
//         if (h.route) {
//           routes.push(`[mounted] ${Object.keys(h.route.methods).join(',').toUpperCase()} ${h.route.path}`);
//         }
//       });
//     }
//   });
//   console.log('== Registered routes ==');
//   routes.forEach((r) => console.log(r));
// }
// listRoutes(app);

// /* -------------------------- Global error guard ------------------------- */
// // Keeps the process alive on unexpected errors
// app.use((err, _req, res, _next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Server error' });
// });

// /* ---------------------------- DB + Server ------------------------------ */
// connectDB(); // ✅ call once

// const PORT = process.env.PORT || 8000; // match your earlier usage
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });














// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const { connectDB } = require('./config/db');

// Routers
const formRoutes = require('./routes/formRoutes');
const maintenanceRoutes = require('./routes/MaintRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const projectRoutes = require('./routes/Project');
const roomRoutes = require('./routes/roomRoutes');
const lightBillRoutes = require('./routes/lightBillRoutes');
const otherExpenseRoutes = require('./routes/otherExpenseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const formWithDocsRoutes = require('./routes/formWithDocs');
const documentRoutes = require('./routes/documentRoutes');
const tenantRoutes = require('./routes/tenant'); // ✅ add this (your OTP/me/rents/etc.)


const leaveRoutes = require("./routes/leaveRoutes");
dotenv.config();

const app = express();

/* ----------------------------- Middleware ------------------------------ */
app.use(cors());
app.use(express.json());

// Static files for uploaded content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Optional: quiet Chrome DevTools CSP probe in dev (cosmetic)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => res.sendStatus(204));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));
app.use("/api", leaveRoutes);
/* ------------------------------- Routes -------------------------------- */
// Mount base collections under /api
app.use('/api', authRoutes);
app.use('/api', formRoutes);
app.use('/api', formWithDocsRoutes);
app.use('/api', projectRoutes);

// Namespaced mounts
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/light-bill', lightBillRoutes);
app.use('/api/other-expense', otherExpenseRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/documents', documentRoutes);

// ✅ Tenant module (this fixes your 404 for /api/tenant/auth/request-otp)
app.use('/api/tenant', tenantRoutes);

/* ----------------------- Route listing (optional) ---------------------- */
// Safe helper to log registered routes (dev only)
function listRoutes(appInstance) {
  if (!appInstance?._router?.stack) {
    console.log('No routes mounted yet.');
    return;
  }
  const rows = [];
  appInstance._router.stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods)
        .map((m) => m.toUpperCase())
        .join(',');
      rows.push(`${methods.padEnd(10)} ${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle?.stack) {
      // nested routers (mounted with app.use(prefix, router))
      const mountPath = layer.regexp?.toString().replace(/\\/g, '').match(/^\/\^\\(.*)\\\/\?\$\//)?.[1] || '';
      layer.handle.stack.forEach((h) => {
        if (h.route) {
          const methods = Object.keys(h.route.methods)
            .map((m) => m.toUpperCase())
            .join(',');
          rows.push(`${methods.padEnd(10)} /${mountPath}${h.route.path === '/' ? '' : h.route.path}`);
        }
      });
    }
  });
  console.log('== Registered routes ==');
  rows.forEach((r) => console.log(r));
}

// Call it only in dev
if (process.env.NODE_ENV !== 'production') {
  listRoutes(app);
}

/* ---------------------------- DB + Server ------------------------------ */
connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/api/tenant/auth/ping (if you added ping)`);
});
