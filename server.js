// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require("path");
// const fs = require('fs');

// const connectDB = require('./config/db');
// const formRoutes = require('./routes/formRoutes');
// const maintenanceRoutes = require('./routes/MaintRoutes');
// const supplierRoutes = require('./routes/supplierRoutes');
// const ProjectRoutes = require('./routes/Project');
// const roomRoutes = require('./routes/roomRoutes');
// const lightBillRoutes = require("./routes/lightBillRoutes");
// const otherExpenseRoutes = require('./routes/otherExpenseRoutes');
// const uploadRoutes = require("./routes/uploadRoutes");
// console.log("✅ uploadRoutes required from:", require.resolve("./routes/uploadRoutes"));       // <-- your uploads router
// const authRoutes = require('./routes/authRoutes');
// const documentRoutes = require("./routes/formWithDocs");
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const formWithDocsRoutes = require("./routes/formWithDocs");
// dotenv.config();
// const documentRoutes = require("./routes/documentRoutes");
// const app = express();
// const SECRET_KEY = '.pnmINFOtech.';

// // Middleware
// app.use(cors());
// app.use(express.json());                                       // (keep one)
// // const documentRoutes = require("./routes/documentRoutes");
// console.log("✅ documentRoutes required from:", require.resolve("./routes/documentRoutes"));
// // Serve uploaded files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use("/api", formWithDocsRoutes);

// app.use("/api/documents", documentRoutes);
// console.log("✅ documentRoutes mounted at /api/documents");
// // Routes
// app.use('/api', formRoutes);
// app.use('/api', authRoutes);
// app.use("/api/maintenance", maintenanceRoutes);
// app.use("/api/suppliers", supplierRoutes);
// app.use("/api", ProjectRoutes);
// app.use('/api/rooms', roomRoutes);
// app.use("/api/light-bill", lightBillRoutes);
// app.use("/api/other-expense", otherExpenseRoutes);
// app.use("/api/documents", documentRoutes); // ✅ now /api/documents/:id exists
// app.use("/api/uploads", uploadRoutes);
// console.log("✅ uploadRoutes mounted at /api/uploads");


// // app.use("/api/documents", documentsRouter);
// // Auth sample
// const authenticateToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.sendStatus(403);
//   jwt.verify(token, SECRET_KEY, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };

// app.get('/protected', authenticateToken, (req, res) => {
//   res.send(`Hello ${req.user.username}, this is a protected route`);
// });





// function listRoutes(app) {
//   const routes = [];
//   if (!app._router) return console.log("No router mounted yet.");
//   app._router.stack.forEach((m) => {
//     if (m.route) {
//       routes.push(`${Object.keys(m.route.methods).join(",").toUpperCase()} ${m.route.path}`);
//     } else if (m.name === "router" && m.handle?.stack) {
//       m.handle.stack.forEach((h) => {
//         if (h.route) {
//           routes.push(`[mounted] ${Object.keys(h.route.methods).join(",").toUpperCase()} ${h.route.path}`);
//         }
//       });
//     }
//   });
//   console.log("== Registered routes ==");
//   routes.forEach((r) => console.log(r));
// }
// listRoutes(app);










// // Connect DB & start server
// connectDB();
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


// // app.get("/api/year", async (req, res) => {
// //   try {
// //     const year = parseInt(req.query.year) || new Date().getFullYear();
    
// //     const startDate = new Date(`${year}-01-01`);
// //     const endDate = new Date(`${year}-12-31`);

// //     const data = await YourModel.find({
// //       "rents.date": { $gte: startDate, $lte: endDate }
// //     });

// //     res.json(data);
// //   } catch (error) {
// //     res.status(500).json({ error: "Internal Server Error" });
// //   }
// // });














// server.js
// server.js
// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { connectDB } = require('./config/db'); // ✅ single import

const app = express();

/* ---------------- Helpers to normalize/catch bad exports ---------------- */
const asRouter = (m) =>
  (m && m.default) ? m.default :
  (m && m.router)  ? m.router  :
  m;

const check = (name, v) => {
  const t = typeof v;
  if (t !== 'function') {
    console.error(`❌ ${name} is not a function (got: ${t}). Fix that file to export the router (module.exports = router).`);
  } else {
    console.log(`✅ ${name} OK`);
  }
  return v;
};

/* ----------------------------- Middleware ------------------------------ */
app.use(cors());
app.use(express.json());

// Static files for uploaded content (so /uploads/** works)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Optional: quiet Chrome DevTools CSP probe in dev (cosmetic)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => res.sendStatus(204));

/* -------------------------------- Routers ------------------------------- */
const formRoutes          = asRouter(require('./routes/formRoutes'));
const maintenanceRoutes   = asRouter(require('./routes/MaintRoutes'));
const supplierRoutes      = asRouter(require('./routes/supplierRoutes'));
const projectRoutes       = asRouter(require('./routes/Project'));
const roomRoutes          = asRouter(require('./routes/roomRoutes'));
const lightBillRoutes     = asRouter(require('./routes/lightBillRoutes'));
const otherExpenseRoutes  = asRouter(require('./routes/otherExpenseRoutes'));
const uploadRoutes        = asRouter(require('./routes/uploadRoutes'));
const authRoutes          = asRouter(require('./routes/authRoutes'));
const formWithDocsRoutes  = asRouter(require('./routes/formWithDocs'));
const documentRoutes      = asRouter(require('./routes/documentRoutes'));

const tenantRoutes        = asRouter(require('./routes/tenant'));         // prefixed under /api/tenant
const notificationsRoutes = asRouter(require('./routes/notifications'));  // notifications + SSE
const invoicesRoutes      = asRouter(require('./routes/invoices'));       // invoices endpoints
const paymentsRoutes      = asRouter(require('./routes/payments'));       // payments endpoints

/* --------------------------- Mount API routes --------------------------- */
app.use('/api',               check('authRoutes',           authRoutes));
app.use('/api',               check('formRoutes',           formRoutes));
app.use('/api',               check('formWithDocsRoutes',   formWithDocsRoutes));
app.use('/api/maintenance',   check('maintenanceRoutes',    maintenanceRoutes));
app.use('/api/suppliers',     check('supplierRoutes',       supplierRoutes));
app.use('/api',               check('projectRoutes',        projectRoutes));
app.use('/api/rooms',         check('roomRoutes',           roomRoutes));
app.use('/api/light-bill',    check('lightBillRoutes',      lightBillRoutes));
app.use('/api/other-expense', check('otherExpenseRoutes',   otherExpenseRoutes));
app.use('/api/uploads',       check('uploadRoutes',         uploadRoutes));
app.use('/api/documents',     check('documentRoutes',       documentRoutes));

app.use('/api',               check('notificationsRoutes',  notificationsRoutes));
app.use('/api',               check('paymentsRoutes',       paymentsRoutes));
app.use('/api',               check('invoicesRoutes',       invoicesRoutes));

// Tenant-related (keep under /api/tenant for consistency)
app.use('/api/tenant',        check('tenantRoutes',         tenantRoutes));

/* ------------------------ Route listing helper ------------------------- */
function listRoutes(app) {
  const routes = [];
  if (!app._router) return console.log('No router mounted yet.');
  app._router.stack.forEach((m) => {
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

/* -------------------------- Global error guard ------------------------- */
// Keeps the process alive on unexpected errors
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

/* ---------------------------- DB + Server ------------------------------ */
connectDB(); // ✅ call once

const PORT = process.env.PORT || 8000; // match your earlier usage
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
