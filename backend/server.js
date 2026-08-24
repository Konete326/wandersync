import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'WanderSync AI Maestro Backend'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/weather', weatherRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
