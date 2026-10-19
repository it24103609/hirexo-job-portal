const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const corsMiddleware = require('./config/cors');
const { passport, configurePassport } = require('./config/passport');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');
const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const candidateRoutes = require('./routes/candidate.routes');
const employerRoutes = require('./routes/employer.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const adminRoutes = require('./routes/admin.routes');
const masterDataRoutes = require('./routes/masterData.routes');
const blogRoutes = require('./routes/blog.routes');
const contactRoutes = require('./routes/contact.routes');
const notificationRoutes = require('./routes/notification.routes');
const premiumRoutes = require('./routes/premium.routes');
const paymentRoutes = require('./routes/payment.routes');
const CronJobs = require('./utils/cronJobs');

const app = express();
configurePassport();

app.use(helmet());
app.use(corsMiddleware());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan('dev'));
app.use(apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Recruitment API is healthy'
  });
});

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/payments', paymentRoutes);

// Initialize cron jobs
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
  CronJobs.initialize();
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

module.exports = app;
