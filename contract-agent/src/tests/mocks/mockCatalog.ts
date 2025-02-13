// @ts-ignore
import nock from 'nock';

const baseURL = 'http://host.docker.internal:4040/v1';
export const setUpCatalogNockMocks = () => {
  // Mocking catalog
  nock(baseURL).get(`/catalog/serviceofferings/672c8ae4870a096712ca56d7`).reply(200, {
    '@context': 'http://host.docker.internal:4040/v1/serviceoffering',
    '@type': 'ServiceOffering',
    '_id': '672c8ae4870a096712ca56d7',
    'name': 'Consumer consent data',
    'providedBy': '66d18a1dee71f9f096baec08',
    'aggregationOf': [
      'http://host.docker.internal:4040/v1/catalog/softwareresources/672c8acc870a096712ca565d'
    ],
    'dependsOn': [],
    'policy': [
      {
        '@context': {
          'xsd': 'http://www.w3.org/2001/XMLSchema#',
          'description': {
            '@id': 'https://schema.org/description',
            '@container': '@language'
          }
        },
        '@id': 'http://localhost:3000/static/references/rules/rule-access-1.json',
        'title': {
          '@type': 'xsd/string',
          '@value': 'No Restriction'
        },
        'uid': 'rule-access-1',
        'name': 'No Restriction',
        'description': [
          {
            '@value': 'CAN use data without any restrictions',
            '@language': 'en'
          }
        ],
        'policy': {
          'permission': [
            {
              'action': 'use',
              'target': '@{target}',
              'constraint': []
            }
          ]
        },
        'requestedFields': [
          'target'
        ]
      }
    ],
    'termsAndConditions': '',
    'dataProtectionRegime': [],
    'dataAccountExport': [],
    'location': 'WORLD',
    'description': 'Consumer consent data',
    'detailedDescription': '<p>Consumer consent data</p>',
    'image': '',
    'keywords': [],
    'dataResources': [],
    'softwareResources': [
      'http://host.docker.internal:4040/v1/catalog/softwareresources/672c8acc870a096712ca565d'
    ],
    'archived': false,
    'visible': true,
    'pricing': 0,
    'pricingModel': [],
    'businessModel': [],
    'maximumConsumption': '',
    'maximumPerformance': '',
    'pricingDescription': '',
    'b2cDescription': [],
    'purpose': '',
    'userInteraction': false,
    'status': 'published',
    'currency': 'EUR',
    'billingPeriod': 'Daily',
    'costPerAPICall': 0,
    'setupFee': 0,
    'compliantServiceOfferingVC': '',
    'serviceOfferingVC': '',
    'category': [
      'hard skills'
    ],
    'schema_version': '1.2.0',
    'createdAt': '2024-11-07T09:39:48.308Z',
    'updatedAt': '2024-11-07T09:40:22.334Z',
    '__v': 0
  });
  // Mocking ecosystem contract
  nock(baseURL).get(`/catalog/serviceofferings/672c89cb870a096712ca4d59`).reply(200, {
    '@context': 'http://host.docker.internal:4040/v1/serviceoffering',
    '@type': 'ServiceOffering',
    '_id': '672c89cb870a096712ca4d59',
    'name': 'provider consent data',
    'providedBy': '66d18724ee71f9f096bae810',
    'aggregationOf': [
      'http://host.docker.internal:4040/v1/catalog/dataresources/672c8a28870a096712ca4e63'
    ],
    'dependsOn': [],
    'policy': [
      {
        '@context': {
          'xsd': 'http://www.w3.org/2001/XMLSchema#',
          'description': {
            '@id': 'https://schema.org/description',
            '@container': '@language'
          }
        },
        '@id': 'http://localhost:3000/static/references/rules/rule-access-1.json',
        'title': {
          '@type': 'xsd/string',
          '@value': 'No Restriction'
        },
        'uid': 'rule-access-1',
        'name': 'No Restriction',
        'description': [
          {
            '@value': 'CAN use data without any restrictions',
            '@language': 'en'
          }
        ],
        'policy': {
          'permission': [
            {
              'action': 'use',
              'target': '@{target}',
              'constraint': []
            }
          ]
        },
        'requestedFields': [
          'target'
        ]
      }
    ],
    'termsAndConditions': '',
    'dataProtectionRegime': [],
    'dataAccountExport': [],
    'location': 'WORLD',
    'description': 'provider consent data',
    'detailedDescription': '<p>provider consent data</p>',
    'image': '',
    'keywords': [],
    'dataResources': [
      'http://host.docker.internal:4040/v1/catalog/dataresources/672c8a28870a096712ca4e63'
    ],
    'softwareResources': [],
    'archived': false,
    'visible': true,
    'pricing': 0,
    'pricingModel': [],
    'businessModel': [],
    'maximumConsumption': '',
    'maximumPerformance': '',
    'pricingDescription': '',
    'b2cDescription': [],
    'purpose': '',
    'userInteraction': false,
    'status': 'published',
    'currency': 'EUR',
    'billingPeriod': 'One shot',
    'costPerAPICall': 0,
    'setupFee': 0,
    'compliantServiceOfferingVC': '',
    'serviceOfferingVC': '',
    'category': [
      'hard skills'
    ],
    'schema_version': '1.2.0',
    'createdAt': '2024-11-07T09:35:07.656Z',
    'updatedAt': '2025-02-05T15:49:28.701Z',
    '__v': 0
  });
};
