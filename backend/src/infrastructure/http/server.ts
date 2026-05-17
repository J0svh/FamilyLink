import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from '../../shared/env';
import { logger } from '../../shared/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`FamilyLink backend running on port ${PORT}`);
});

export { app };
