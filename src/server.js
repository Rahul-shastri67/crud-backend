require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

const raw = process.env.FRONTEND_URLS || '';            // comma-separated list
const allowAll = (process.env.ALLOW_ALL === 'true');   // set true only for quick test
const allowedOrigins = raw
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// helper: check header-safe origin
function isHeaderSafe(s) {
  if (typeof s !== 'string') return false;
  // reject newline/CR or control chars
  return !/[\r\n\x00]/.test(s);
}

app.use((req, res, next) => {
  const incoming = req.headers.origin || '(no-origin)';
  // helpful debug log (remove later)
  console.log('[CORS] incoming origin:', incoming);
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        // non-browser (curl/postman) or same-origin requests — allow
        return callback(null, true);
      }

      if (allowAll) {
        if (!isHeaderSafe(origin)) return callback(new Error('Invalid origin header'), false);
        return callback(null, true);
      }

      if (!allowedOrigins.length) {
        // nothing configured → deny for safety
        return callback(new Error('No FRONTEND_URLS configured'), false);
      }

      if (!isHeaderSafe(origin)) {
        return callback(new Error('Invalid origin header'), false);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed'), false);
    },
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
connectDB();

app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
