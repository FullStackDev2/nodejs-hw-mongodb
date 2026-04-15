import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import {
  getContactsController,
  getContactByIdController,
} from './controllers/contacts.js';

export const setupServer = () => {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(pino());
  app.use(express.json());


  app.get('/', (req, res) => {
    res.json({
      status: 200,
      message: 'API is working',
    });
  });

  app.get('/contacts', getContactsController);
  app.get('/contacts/:contactId', getContactByIdController);


  app.use((req, res) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};