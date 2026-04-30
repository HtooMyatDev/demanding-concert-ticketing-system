import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';


const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL is required for rate limiting Redis store. Set REDIS_URL in .env or your environment.");
}

const redisClient = createClient({
    url: redisUrl
});

redisClient.connect().catch((err) => {
    console.error("Redis connection failed:", err);
});

export const reserveLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100,               // Limit each IP to 5 requests per windowMs
    standardHeaders: 'draft-7', // Draft-7: combined RateLimit header
    legacyHeaders: false,      // Disable the X-RateLimit-* headers

    // 3. Configure Redis Store
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: 'rl:reserve:', // Unique prefix to avoid collisions in Redis
    }),

    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many reservation attempts. Please try again in a minute.",
            code: "RATE_LIMIT_EXCEEDED"
        });
    },
});
