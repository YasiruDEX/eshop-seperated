import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRouter from './routes/profile.router';

dotenv.config();

const app: Express = express();
const PORT = process.env.CUSTOMER_SERVICE_PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'customer-service' });
});

// Routes
app.use('/api', profileRouter);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Customer Service is running on port ${PORT}`);
});

export default app;
