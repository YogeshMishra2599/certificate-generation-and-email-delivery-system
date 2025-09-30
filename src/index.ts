import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import certificateRoutes from './routes/certificateRoutes.js';

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Certificate Generation API is running' });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Certificate routes
app.use('/api/certificate', certificateRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
