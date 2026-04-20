import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs';
import path from 'node:path';

const router = Router();

const swaggerPath = path.join(process.cwd(), 'docs', 'swagger.json');
const swaggerDocument = JSON.parse(
  fs.readFileSync(swaggerPath, 'utf-8'),
);

router.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Contacts API Docs',
    explorer: true,
  }),
);

export default router;