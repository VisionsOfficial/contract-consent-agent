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
    '@schemas': {
      PreferencePayload: {
        type: 'object',
        properties: {
          preference: {
            type: 'object',
            properties: {
              participant: { type: 'string' },
              category: { type: 'string' },
              asDataProvider: { 
                type: 'object',
                properties: {
                  authorizationLevel: { type: 'string' },
                  conditions:  [{ 
                    type: 'object', 
                    properties: {
                      time: { 
                        type: 'object', 
                        properties: {
                          dayOfWeek: [{ type: 'string' }],
                          startTime: { type: 'string' },
                          endTime: { type: 'string' }
                        }
                      },
                      location: { type: 'string' },
                    }
                  }],
                } 
              },
              asServiceProvider: { 
                type: 'object',
                properties: {
                  authorizationLevel: { type: 'string' },
                  conditions:  [{ 
                    type: 'object', 
                    properties: {
                      time: { 
                        type: 'object', 
                        properties: {
                          dayOfWeek: [{ type: 'string' }],
                          startTime: { type: 'string' },
                          endTime: { type: 'string' }
                        }
                      },
                      location: { type: 'string' },
                    }
                  }],
                } 
              },
            }
          }
        }
      },
      ProfileConfigurations: {
        type: 'object',
        properties: {
          configurations: {
            type: 'object',
            properties: {
              allowRecommendations: { type: 'string' },
              allowPolicies: { type: 'string' },
            }
          }
        },
      },
      ContractPayload: {
        type: 'object',
        properties: {
          profileId: { type: 'string' },
          contractData: {
            type: 'object',
            properties: {
              _id: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              ecosystem: { type: 'string' },
              members: {
                type: 'array',
                items: { $ref: '#/components/schemas/Participant' }
              },
              orchestrator: { type: 'string' },
              purpose: {
                type: 'array',
                items: { type: 'string' }
              },
              revokedMembers: {
                type: 'array',
                items: { $ref: '#/components/schemas/Participant' }
              },
              rolesAndObligations: {
                type: 'array',
                items: { type: 'object' }
              },
              serviceOfferings: {
                type: 'array',
                items: { $ref: '#/components/schemas/ServiceOffering' }
              },
              status: { type: 'string' }
            }
          }
        }
      },
      Participant: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string' }
        }
      },
      ServiceOffering: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' }
        }
      },
      PolicyPayload: {
        type: 'object',
        properties: {
          profileId: { type: 'string' },
          policyData: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              permission: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    action: { type: 'string' },
                    target: { type: 'string' },
                    constraint: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          leftOperand: { type: 'string' },
                          operator: { type: 'string' },
                          rightOperand: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              },
              prohibition: { type: 'array' }
            
            }
          }
        }
      },
      ServiceOfferingPayload: {
        type: 'object',
        properties: {
          profileId: { type: 'string' },
          serviceData: {
            type: 'object',
            properties: {
              participant: { type: 'string' },
              serviceOffering: { type: 'string' },
              policies: {
                type: 'array',
                items: { $ref: '#/components/schemas/PolicyPayload' }
              }
            }
          }
        }
      },
      ProfilePreferencePayload: {
        type: 'object',
        properties: {
          profileId: { type: 'string' },
          preferences: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              policies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    policy: { type: 'string' },
                    frequency: { type: 'number' }
                  }
                }
              },
              ecosystems: { type: 'array', items: { type: 'string' } },
              services: { type: 'array', items: { type: 'string' } },
              participant: { type: 'string' },
              category: { type: 'string' },
              asDataProvider: {
                type: 'object',
                properties: {
                  authorizationLevel: { type: 'string' },
                  conditions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        operator: { type: 'string' },
                        value: { type: 'string' }
                      }
                    }
                  }
                }
              },
              asServiceProvider: {
                type: 'object',
                properties: {
                  authorizationLevel: { type: 'string' },
                  conditions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        operator: { type: 'string' },
                        value: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      ContractProfilePostPayload: {
        type: 'object',
        properties: {
          profileURI: { type: 'string' },
          configurations: {
            type: 'object',
            properties: {
              // Define properties for ProfileConfigurations here
              // Example:
              allowRecommendations: { type: 'string' },
              allowPolicies: { type: 'string' },
            },
          }
        }
      },
      ContractProfilePutPayload: {
        type: 'object',
        properties: {
          configurations: {
            type: 'object',
            properties: {
              // Define properties for ProfileConfigurations here
              // Example:
              allowRecommendations: { type: 'string' },
              allowPolicies: { type: 'string' },
            },
          }
        }
      }
    },
  },
};
const outputFile = '../../docs/swagger.json';
const endpointsFiles = ['../agent.consent.router.ts', '../agent.contract.negotiation.router.ts', '../agent.contract.profile.router.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
  Logger.info('Swagger documentation has been generated');
});
