import { MongoDBProvider } from 'MongoDBProvider';
import { Profile } from '../Profile';
import { MongoClient } from 'mongodb';

describe('Contract Agent Test Cases 0', function () {
  let profile: Profile;

  beforeEach(function () {
    profile = new Profile(
      'https://catalog.com/v1/catalog/participants/6564abb5d853e8e05b132057',
      {
        allowRecommendation: true,
        allowPolicies: true,
      },
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
    );
  });

  it('it should 0', function () {
    console.log(JSON.stringify(profile, null, 2));
  });

  it('it should 1', async function () {
    const setupMongoDB = async function () {
      const client = await MongoClient.connect('mongodb://localhost:27017');
      const db = client.db('contract_consent_agent_db');
      const mongoProvider = new MongoDBProvider(db);
      return mongoProvider;
    };

    await setupMongoDB();
  });
});
