import { MongoClient, Db, Collection } from 'mongodb';
import { Profile, ProfileJSON } from '../../Profile';

const seedProfiles = async (): Promise<void> => {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db: Db = client.db('contract_consent_agent_db');
    const profilesCollection: Collection<Profile> = db.collection('Profiles');
    const profiles: ProfileJSON[] = [
      {
        uri: 'https://catalog.com/v1/catalog/participants/6564abb5d853e8e05b132057',
        configurations: { allowRecommendations: true, allowPolicies: true },
        recommendations: [
          {
            policies: [
              {
                policy: 'MUST not use data for more than n times',
                frequency: 1,
              },
            ],
            ecosystemContracts: [],
            services: [],
          },
        ],
        matching: [
          {
            policies: [],
            ecosystemContracts: [],
            services: [],
          },
        ],
        preference: [],
      },
      {
        uri: 'https://catalog.com/v1/catalog/participants/12345abcd',
        configurations: { allowRecommendations: false, allowPolicies: true },
        recommendations: [
          {
            policies: [
              {
                policy: 'Must ... 0',
                frequency: 3,
              },
            ],
            ecosystemContracts: ['ContractA', 'ContractB'],
            services: [],
          },
        ],
        matching: [
          {
            policies: [],
            ecosystemContracts: ['ContractC'],
            services: [],
          },
        ],
        preference: [],
      },
      {
        uri: 'https://catalog.com/v1/catalog/participants/98765xyz',
        configurations: { allowRecommendations: true, allowPolicies: false },
        recommendations: [
          {
            policies: [
              {
                policy: 'Must ... 1',
                frequency: 1,
              },
            ],
            ecosystemContracts: [],
            services: [],
          },
        ],
        matching: [
          {
            policies: [{ policy: 'Must ... 2', frequency: 0 }],
            ecosystemContracts: [],
            services: [],
          },
        ],
        preference: [],
      },
      {
        uri: 'https://catalog.com/v1/catalog/participants/98765xyz',
        configurations: { allowRecommendations: true, allowPolicies: false },
        recommendations: [
          {
            policies: [
              {
                policy: 'Should be recommended by bob',
                frequency: 1,
              },
            ],
            ecosystemContracts: [],
            services: [],
          },
        ],
        matching: [
          {
            policies: [
              { policy: 'Should match with bob profile', frequency: 0 },
            ],
            ecosystemContracts: [],
            services: [],
          },
        ],
        preference: [],
      },
    ];
    const profileInstances = profiles.map(
      (profileData) => new Profile(profileData),
    );
    const result = await profilesCollection.insertMany(profileInstances);
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
