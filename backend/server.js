import './config/config.js';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);

app.listen(5000, () => console.log('Server läuft auf Port 5000'));