import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

const app = express();

app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost', 'http://localhost:5173'];

const corsOptions = {
    origin: allowedOrigins,
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.status(200).json({
        service: 'aws-fullstack-api',
        status: 'healthy',
        environment: process.env.ENVIRONMENT || 'local',
        region: process.env.APP_REGION || 'us-east-1',
        database: {
            connected: false,
            mode: 'mock',
            configuredUri: process.env.MONGO_URI ? 'loaded-from-env' : 'missing',
        },
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

if (!process.env.LAMBDA_TASK_ROOT) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`API is up and running on port ${PORT}`));
}

export const handler = serverless(app);
