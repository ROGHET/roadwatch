import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import complaintsRouter from './routes/complaints';
import roadsRouter from './routes/roads';
import aiRouter from './routes/ai';
import budgetRouter from './routes/budget';
import intelligenceRouter from './routes/intelligence';

console.log("API KEY FOUND:", !!process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 3000;
const payloadLimit = '15mb';

app.use(cors());
app.use(express.json({ limit: payloadLimit }));
app.use(express.urlencoded({ extended: true, limit: payloadLimit }));

app.use('/api/complaints', complaintsRouter);
app.use('/api/roads', roadsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/intelligence', intelligenceRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CrashZero API'
  });
});

app.use(
  (
    error: Error & { type?: string; status?: number },
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (error.type === 'entity.too.large' || error.status === 413) {
      return res.status(413).json({
        error: 'Uploaded image is too large. Please attach an image up to 10 MB.',
      });
    }

    next(error);
  },
);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
