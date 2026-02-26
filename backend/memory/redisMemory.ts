import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export async function getSessionMemory(userId: string) {
    const key = `session:${userId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : { messages: [], lastActivity: Date.now() };
}

export async function updateSessionMemory(userId: string, messages: any[]) {
    const key = `session:${userId}`;
    const data = {
        messages: messages.slice(-10), // Buffer Window (últimas 10)
        lastActivity: Date.now()
    };
    await redisClient.setEx(key, 1800, JSON.stringify(data)); // TTL 30 min
}
