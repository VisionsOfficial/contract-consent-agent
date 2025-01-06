import { ContractJSON } from 'Contract';

export const ContractBase: ContractJSON = {
  // _id: '6661c8e34371f3eabe3ddfde',
  createdAt: '2024-06-06T14:34:11.128Z',
  ecosystem:
    'https://catalog.com/v1/catalog/ecosystems/6661c8e32ea0e41164285536',
  members: [
    {
      participant:
        'https://catalog.com/v1/catalog/participants/6564abb5d853e8e05b132057',
      role: 'orchestrator',
      signature: 'hasSigned',
      date: '2024-06-06T14:34:16.722Z',
    },
    {
      participant:
        'https://catalog.com/v1/catalog/participants/6564aaebd853e8e05b1317c1',
      role: 'participant',
      signature: 'hasSigned',
      date: '2024-06-06T14:35:51.524Z',
    },
  ],
  orchestrator:
    'https://catalog.com/v1/catalog/participants/6564abb5d853e8e05b132057',
  purpose: [],
  revokedMembers: [],
  rolesAndObligations: [],
  serviceOfferings: [
    {
      participant:
        'https://catalog.com/v1/catalog/participants/6564abb5d853e8e05b132057',
      serviceOffering:
        'https://catalog.com/v1/catalog/serviceofferings/664f3ed6a5aa76c541b64a79',
      policies: [
        {
          description: 'MUST not use data for more than n times',
          permission: [
            {
              action: 'use',
              target:
                'https://catalog.com/v1/catalog/serviceofferings/664f3ed6a5aa76c541b64a79',
              constraint: [
                {
                  leftOperand: 'count',
                  operator: 'lt',
                  rightOperand: 10,
                },
              ],
            },
          ],
          prohibition: [],
        },
      ],
      _id: '6661c8fb4371f3eabe3ddfea',
    },
    {
      participant:
        'https://catalog.com/v1/catalog/participants/6564aaebd853e8e05b1317c1',
      serviceOffering:
        'https://catalog.com/v1/catalog/serviceofferings/664f3e4ea5aa76c541b640bb',
      policies: [
        {
          description: 'MUST not use data for more than n times',
          permission: [
            {
              action: 'use',
              target:
                'https://catalog.com/v1/catalog/serviceofferings/664f3e4ea5aa76c541b640bb',
              constraint: [
                {
                  leftOperand: 'count',
                  operator: 'lt',
                  rightOperand: 10,
                },
              ],
            },
          ],
          prohibition: [],
        },
      ],
      _id: '6661c9474371f3eabe3ddff0',
    },
  ],
  status: 'signed',
  updatedAt: '2024-06-06T14:35:51.522Z',
};
