import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import complaintsRouter from './routes/complaints';
import roadsRouter from './routes/roads';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/complaints', complaintsRouter);
app.use('/api/roads', roadsRouter);
app.use('/api/ai', aiRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'CrashZero API' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});