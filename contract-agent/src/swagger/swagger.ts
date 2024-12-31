import swaggerAutogen from 'swagger-autogen';
import { Logger } from '../Logger';

const doc = {
  info: {
    title: 'Contract Consent Agent API',
    description: 'Availables routes through the Contract Consent Agent API',
  },
  servers: [
    {
      url: 'http://localhost:8000',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
};
const outputFile = '../../docs/swagger.json';
const endpointsFiles = ['../agent.consent.router.ts', '../agent.contract.negotiation.router.ts', '../agent.contract.profile.router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  Logger.info('Swagger documentation has been generated');
});
