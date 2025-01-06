import express, { Application } from 'express';
import * as bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import profileRoutes from './agent.contract.profile.router';
import negotiationRoutes from './agent.contract.negotation.router';
import consentRoutes from './agent.consent.router';
import swaggerDocument from './swagger/swagger_output.json';

const app : Application= express();

app.use(bodyParser.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/negotiation', negotiationRoutes);
app.use('/api/consent', consentRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-undef
  console.log('Server started at port 8080');
  // eslint-disable-next-line no-undef
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
