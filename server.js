// server.js (updated, CJS only)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// DB connector
const connectDB = require('./config/db');

// Routers (CJS)
const formRoutes = require('./routes/formRoutes');
const maintenanceRoutes = require('./routes/MaintRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const projectRoutes = require('./routes/Project');
const roomRoutes = require('./routes/roomRoutes');
const lightBillRoutes = require('./routes/lightBillRoutes');
const otherExpenseRoutes = require('./routes/otherExpenseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const formWithDocsRoutes = require('./routes/formWithDocs');     // optional extra form endpoints
const documentRoutes = require('./routes/documentRoutes');       // /api/documents
const inviteRoutes = require('./routes/invites');                // /api/invites

dotenv.config();

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// Static files for uploaded content (so /uploads/** works)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// (Optional) quiet Chrome DevTools CSP probe in dev (cosmetic)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => res.sendStatus(204));

// Simple health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ---------- API Routes (mount once each) ----------
app.use('/api', authRoutes);
app.use('/api', formRoutes);
app.use('/api', formWithDocsRoutes);                 // keep only if you use these
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api', projectRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/light-bill', lightBillRoutes);
app.use('/api/other-expense', otherExpenseRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/invites', inviteRoutes);

// ---------- (Optional) Route listing helper ----------
function listRoutes(appInst) {
  const routes = [];
  if (!appInst._router) {
    console.log('No router mounted yet.');
    return;
  }
  appInst._router.stack.forEach((m) => {
    if (m.route) {
      routes.push(`${Object.keys(m.route.methods).join(',').toUpperCase()} ${m.route.path}`);
    } else if (m.name === 'router' && m.handle?.stack) {
      m.handle.stack.forEach((h) => {
        if (h.route) {
          routes.push(`[mounted] ${Object.keys(h.route.methods).join(',').toUpperCase()} ${h.route.path}`);
        }
      });
    }
  });
  console.log('== Registered routes ==');
  routes.forEach((r) => console.log(r));
}
listRoutes(app);

// ---------- DB + Server ----------
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
