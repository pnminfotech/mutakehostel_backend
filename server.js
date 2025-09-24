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

















const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');

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
const formWithDocsRoutes = require('./routes/formWithDocs');   // if this exposes extra form endpoints
const documentRoutes = require('./routes/documentRoutes');      // <-- single import name for /api/documents

dotenv.config();

const app = express();
const SECRET_KEY = '.pnmINFOtech.';

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// Static files for uploaded content (so /uploads/** works)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Optional: quiet Chrome DevTools CSP probe in dev (cosmetic)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => res.sendStatus(204));

// ---------- API Routes (mount once each) ----------
app.use('/api', authRoutes);
app.use('/api', formRoutes);
app.use('/api', formWithDocsRoutes);            // keep if you actually use these routes
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api', projectRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/light-bill', lightBillRoutes);
app.use('/api/other-expense', otherExpenseRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/documents', documentRoutes);      // <-- single mount for document download/view

// ---------- (Optional) Route listing helper ----------
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

// ---------- DB + Server ----------
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
