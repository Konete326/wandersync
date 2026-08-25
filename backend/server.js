import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import countryRoutes from './routes/countryRoutes.js';
import spotRoutes from './routes/spotRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import groupTourRoutes from './routes/groupTourRoutes.js';
import externalTravelRoutes from './routes/externalTravelRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'WanderSync AI Maestro Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'WanderSync AI Maestro Backend',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/group-tours', groupTourRoutes);
app.use('/api/external-travel', externalTravelRoutes);

app.use(notFound);
app.use(errorHandler);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
