import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import {
  autoMaintenanceScheduler,
  autoCleaningScheduler
} from './utils/autoScheduler.js';

import adminRoutes from './routes/adminRoutes.js';
import techRoutes from './routes/techRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import sparePartRoutes from './routes/sparePartRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import cleaningRoutes from './routes/cleaningRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import accidentRoutes from './routes/accidentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Seagulls Tech API' });
});

// Checks the nextMaintDate and nextCleaningDate for the assets every day at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log("[Cron] Running auto-maintenance scheduler...");
  await autoMaintenanceScheduler();
  console.log("[Cron] Running Auto-Cleaning...");
  await autoCleaningScheduler();
});

app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/tech', techRoutes); // Tech routes
app.use('/api/asset', assetRoutes); // Asset routes
app.use('/api/vendor', vendorRoutes); // Vendor routes
app.use('/api/sparepart', sparePartRoutes); // Spare part routes
app.use('/api/report', reportRoutes); // Report routes
app.use('/api/cleaning', cleaningRoutes); // Cleaning routes
app.use('/api/maintenance', maintenanceRoutes); // Maintenance routes
app.use('/api/accident', accidentRoutes); // Accident routes
app.use('/api/ticket', ticketRoutes); // Ticket routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 