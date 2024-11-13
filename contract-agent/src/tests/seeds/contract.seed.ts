import { MongoClient, Db, Collection } from 'mongodb';
import { Contract } from '../../Contract';

const seedContracts = async (): Promise<void> => {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db: Db = client.db('contract_consent_agent_db'); // ecosystem contract
    const contractsCollection: Collection<Contract> =
      db.collection('Contracts');

    const deleteResult = await contractsCollection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing contracts`);

    const contracts: Contract[] = [
      new Contract(
        '2023-01-01T10:00:00Z',
        '2023-02-01T10:00:00Z',
        'Ecosystem A',
        [
          {
            participant: 'participant1',
            role: 'A',
            signature: 'signature1',
            date: '2023-01-01',
          },
          {
            participant: 'participant2',
            role: 'B',
            signature: 'signature2',
            date: '2023-01-02',
          },
        ],
        'orchestrator1',
        ['Purpose A', 'Purpose B'],
        [],
        [],
        [
          {
            participant: 'participant1',
            serviceOffering: 'Service 1',
            policies: [
              {
                description: 'Policy 1 description',
                permission: [
                  {
                    action: 'read',
                    target: 'resource1',
                    constraint: [
                      {
                        leftOperand: 'duration',
                        operator: 'lt',
                        rightOperand: '30d',
                      },
                    ],
                  },
                ],
                prohibition: [],
              },
            ],
          },
        ],
        'signed',
      ),
      new Contract(
        '2023-02-10T15:30:00Z',
        '2023-03-15T15:30:00Z',
        'Ecosystem B',
        [
          {
            participant: 'participant3',
            role: 'C',
            signature: 'signature3',
            date: '2023-02-10',
          },
          {
            participant: 'participant4',
            role: 'A',
            signature: 'signature4',
            date: '2023-02-12',
          },
          {
            participant: 'participant5',
            role: 'B',
            signature: 'signature5',
            date: '2023-02-14',
          },
        ],
        'orchestrator2',
        ['Purpose C'],
        [],
        [],
        [
          {
            participant: 'participant3',
            serviceOffering: 'Service 2',
            policies: [
              {
                description: 'Policy 2 description',
                permission: [
                  {
                    action: 'update',
                    target: 'resource2',
                    constraint: [
                      {
                        leftOperand: 'count',
                        operator: 'lgt',
                        rightOperand: 10,
                      },
                    ],
                  },
                ],
                prohibition: [],
              },
            ],
          },
        ],
        'pending',
      ),
      new Contract(
        '2023-03-01T08:00:00Z',
        '2023-03-20T08:00:00Z',
        'Ecosystem C',
        [
          {
            participant: 'participant6',
            role: 'A',
            signature: 'signature6',
            date: '2023-03-01',
          },
        ],
        'orchestrator3',
        ['Purpose D', 'Purpose E'],
        [
          {
            participant: 'participant4',
            role: 'C',
            signature: 'signature4',
            date: '2023-03-15',
          },
        ],
        [],
        [
          {
            participant: 'participant6',
            serviceOffering: 'Service 3',
            policies: [
              {
                description: 'Policy 3 description',
                permission: [
                  {
                    action: 'delete',
                    target: 'resource3',
                    constraint: [
                      {
                        leftOperand: 'accessLevel',
                        operator: 'eq',
                        rightOperand: 'admin',
                      },
                    ],
                  },
                ],
                prohibition: [],
              },
            ],
          },
        ],
        'revoked',
      ),
      new Contract(
        '2023-04-05T12:00:00Z',
        '2023-04-30T12:00:00Z',
        'Ecosystem D',
        [
          {
            participant: 'participant7',
            role: 'A',
            signature: 'signature7',
            date: '2023-04-05',
          },
          {
            participant: 'participant8',
            role: 'B',
            signature: 'signature8',
            date: '2023-04-07',
          },
        ],
        'orchestrator4',
        ['Purpose F'],
        [],
        [],
        [
          {
            participant: 'participant7',
            serviceOffering: 'Service 4',
            policies: [
              {
                description: 'Policy 4 description',
                permission: [
                  {
                    action: 'share',
                    target: 'resource4',
                    constraint: [
                      {
                        leftOperand: 'region',
                        operator: 'neq',
                        rightOperand: 'restricted',
                      },
                    ],
                  },
                ],
                prohibition: [],
              },
            ],
          },
        ],
        'signed',
      ),
      new Contract(
        '2023-05-10T09:00:00Z',
        '2023-05-20T09:00:00Z',
        'Ecosystem E',
        [
          {
            participant: 'participant9',
            role: 'C',
            signature: 'signature9',
            date: '2023-05-10',
          },
          {
            participant: 'participant10',
            role: 'D',
            signature: 'signature10',
            date: '2023-05-11',
          },
        ],
        'orchestrator5',
        ['Purpose G', 'Purpose H'],
        [],
        [],
        [
          {
            participant: 'participant9',
            serviceOffering: 'Service 5',
            policies: [
              {
                description: 'Policy 5 description',
                permission: [
                  {
                    action: 'access',
                    target: 'resource5',
                    constraint: [
                      {
                        leftOperand: 'time',
                        operator: 'gt',
                        rightOperand: '9:00',
                      },
                    ],
                  },
                ],
                prohibition: [],
              },
            ],
          },
        ],
        'pending',
      ),
    ];

    const result = await contractsCollection.insertMany(contracts);
    console.log(
      `${result.insertedCount} contracts inserted with IDs:`,
      result.insertedIds,
    );
  } catch (error) {
    console.error('Error seeding Contracts:', error);
  } finally {
    await client.close();
    console.log('Connection to MongoDB closed');
  }
};

void seedContracts();
