import { MongoClient, Db, Collection } from 'mongodb';
import { Profile } from '../../Profile';

const seedProfiles = async (): Promise<void> => {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db: Db = client.db('contract_consent_agent_db');
    const profilesCollection: Collection<Profile> = db.collection('Profiles');

    const profiles: Profile[] = [
      new Profile(
        'https://catalog.com/v1/catalog/participants/6564abb5d853e8e05b132057',
        { allowRecommendation: true, allowPolicies: true },
        [
          {
            policies: [
              {
                policy: 'MUST not use data for more than n times',
                frequency: 1,
              },
            ],
            ecosystemContracts: [],
          },
        ],
        [
          {
            policies: [],
            ecosystemContracts: [],
          },
        ],
      ),
      new Profile(
        'https://catalog.com/v1/catalog/participants/12345abcd',
        { allowRecommendation: false, allowPolicies: true },
        [
          {
            policies: [
              {
                policy: 'Must ... 0',
                frequency: 3,
              },
            ],
            ecosystemContracts: ['ContractA', 'ContractB'],
          },
        ],
        [
          {
            policies: [],
            ecosystemContracts: ['ContractC'],
          },
        ],
      ),
      new Profile(
        'https://catalog.com/v1/catalog/participants/98765xyz',
        { allowRecommendation: true, allowPolicies: false },
        [
          {
            policies: [
              {
                policy: 'Must ... 1',
                frequency: 1,
              },
            ],
            ecosystemContracts: [],
          },
        ],
        [
          {
            policies: [{ policy: 'Must ... 2', frequency: 0 }],
            ecosystemContracts: [],
          },
        ],
      ),
      new Profile(
        'https://catalog.com/v1/catalog/participants/98765xyz',
        { allowRecommendation: true, allowPolicies: false },
        [
          {
            policies: [
              {
                policy: 'Should be recommended by bob',
                frequency: 1,
              },
            ],
            ecosystemContracts: [],
          },
        ],
        [
          {
            policies: [
              { policy: 'Should match with bob profile', frequency: 0 },
            ],
            ecosystemContracts: [],
          },
        ],
      ),
    ];

    const result = await profilesCollection.insertMany(profiles);
    console.log(
      `${result.insertedCount} documents inserted with IDs:`,
      result.insertedIds,
    );
  } catch (error) {
    console.error('Error seeding Profiles:', error);
  } finally {
    await client.close();
    console.log('Connection to MongoDB closed');
  }
};

void seedProfiles();
