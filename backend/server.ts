import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js';
import { connectRedis } from './memory/redisMemory.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

async function start() {
    try {
        await connectRedis();
        console.log('Connected to Redis');

        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`AI Agent Backend running on http://0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

start();
