require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit'); // Uncomment if you plan to use rate limiting

const app = express();

// --- Public Route ---
app.get("/home", (req, res) => {
  res.json({
    msg: "Hi 👋This is testing"
  });
});

// --- Route Imports ---
// Ensure each of these files exists and correctly exports an Express Router
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const propertyRoutes = require('./src/routes/property'); // This is your property router
const agentRoutes = require('./src/routes/agents');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
//const dashboardAgentRoutes = require('./src/routes/dashboardAgent');
const pdfRoutes = require('./src/routes/pdfExportRoutes'); 
const expectedBuyerRoutes = require('./src/routes/expectedBuyerRoutes');
const myPropertyRoutes = require('./src/routes/myproperty'); // path may vary
const employeeDashboardRoutes = require('./src/routes/employeeDashboardRoutes');
const employeeRoutes = require('./src/routes/employees');
const uploadRoutes = require('./src/routes/upload');
// This line is commented out as export-pdf is in propertyRoutes
//const uploadRoutes = require('./src/routes/uploadRoutes');

//const employeesRoutes = require('./src/routes/employees');
// --- Security & Utility Middleware ---
app.use(helmet()); // Sets various HTTP headers for security
app.use(compression()); // Compresses response bodies for all requests
app.use(morgan('combined')); // HTTP request logger

// Body Parsers for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' })); // Parses JSON bodies, with a limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parses URL-encoded bodies


// CORS Configuration
// In production, replace 'http://localhost:3000' with your actual frontend domain(s)
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://your-production-frontend.com",
            "https://another-prod-domain.com",
          ] // Replace with actual domains
        : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
          ], // For development
    credentials: true, // Allow cookies to be sent with cross-origin requests
  })
);

// --- Rate Limiting (Uncomment and configure if needed) ---
// const apiLimiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // Max 100 requests per windowMs per IP
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });
// app.use('/api', apiLimiter); // Apply to all routes starting with /api

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI) // useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 6+
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB connection error:', err));

// --- Route Mounting ---
// All routes defined within the imported router will be prefixed with the path provided here.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // for agent ,employee crud for admin and agent
app.use('/api/property', propertyRoutes); // Your property routes are mounted here, e.g., /api/property/export-pdf
app.use('/api/agents', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expected-buyers', expectedBuyerRoutes);
console.log('✅ Expected Buyer Routes Mounted at /api/expected-buyers');
app.use('/api/my-properties', myPropertyRoutes);
app.use('/api/employee-dashboard', employeeDashboardRoutes);
app.use('/api', uploadRoutes); // for employee imp upload 

//app.use('/api/employee', employeesRoutes);
//app.use('/api/upload', uploadRoutes);
//console.log('uploadRoutes type:', typeof uploadRoutes);
//app.use('api/dashboard/agent', dashboardRoutes);
// If `pdfRoutes` is for entirely separate PDF-related functionality (not property export),
// then you would uncomment and mount it here with its own base path.
//app.use('/api/pdfs', pdfRoutes); // Example: /api/pdfs/another-pdf-route

app.use('/api/employee', employeeRoutes);

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server  is running on Jenkins for node!' });
});


// --- Improved Route Logging ---
// This function recursively traverses the Express router stack to list all registered routes.
function printRoutes(path, layer) {
  if (layer.route) {
    // This is a direct route (e.g., app.get('/', ...))
    const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
    console.log(`${methods} ${path}${layer.route.path}`);
  } else if (layer.name === 'router' && layer.handle.stack) {
    // This is an Express Router mounted via app.use('/basepath', router)
    const newPath = path + (layer.regexp.source.replace(/\\|\^|\$|\/gi/g, '') || ''); // Extract base path
    layer.handle.stack.forEach(innerLayer => {
      printRoutes(newPath, innerLayer);
    });
  } else if (layer.name === 'bound dispatch' && layer.handle.stack) {
    // This handles nested routers that might be named 'bound dispatch'
    // (e.g., if you have router.use() within a router)
    layer.handle.stack.forEach(innerLayer => {
      printRoutes(path, innerLayer); // No new path segment from this layer
    });
  }
}

console.log('\n🔎 Registered routes:');
app._router.stack.forEach(layer => {
  printRoutes('', layer); // Start recursive logging from the root
});
// --- End Improved Route Logging ---

// --- 404 Handler ---
// This middleware catches any requests that didn't match previous routes.
// It MUST be placed AFTER all your defined routes.


app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// This `module.exports = app;` is typically not needed in your main `server.js` file
// unless you are importing `app` into another file (e.g., for testing purposes).
module.exports = app;

