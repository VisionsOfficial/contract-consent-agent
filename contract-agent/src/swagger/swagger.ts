import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Contract Consent Agent API',
    description: 'Availables routes through the Contract Consent Agent API',
  },
  servers: [
    {
      url: 'http://localhost:8888',
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
const outputFile = './swagger_output.json';
const endpointsFiles = ['./negotiation.swagger.ts',
  './preference.swagger.ts',
  './profile.swagger.ts',
];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation has been generated');
});
