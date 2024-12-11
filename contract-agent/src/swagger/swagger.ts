import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Contract Consent Agent API',
    description: 'Availables routes through the Contract Consent Agent API',
  },
  host: `8888`,
  schemes: ['http']
};
const outputFile: string = './swagger.json';
const endpointsFiles: string[] = [
  '',
];
const swagger = swaggerAutogen();
swagger(outputFile, endpointsFiles, doc);
