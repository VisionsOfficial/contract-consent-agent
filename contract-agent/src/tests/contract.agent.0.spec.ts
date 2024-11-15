import { MongoDBProvider } from '../MongoDBProvider';
import { Profile } from '../Profile';
import { MongoClient } from 'mongodb';
import { ContractAgent } from '../ContractAgent';
import { Contract } from '../Contract';
import sinon, { SinonSpy } from 'sinon';
import { expect } from 'chai';

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
              policy: 'MUST not use data',
              frequency: 1,
            },
          ],
          ecosystemContracts: [],
          services: [],
        },
      ],
      [
        {
          policies: [],
          ecosystemContracts: [],
          services: [],
        },
      ],
    );
  });

  it('it should 0', function () {
    console.log(JSON.stringify(profile, null, 2));
  });

  it('should spy on buildSearchCriteria and log its result', async function () {
    const setupMongoDB = async function () {
      try {
        const client = await MongoClient.connect('mongodb://localhost:27017');
        console.log('MongoDB connected successfully');

        const db = client.db('contract_consent_agent_db');
        const mongoProvider = new MongoDBProvider(db, 'Profile');

        return mongoProvider;
      } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      }
    };

    const mongoProvider = await setupMongoDB();
    const contractAgent = ContractAgent.retrieveService();
    contractAgent.addDataProviders([{ provider: mongoProvider }]);

    const buildSearchCriteriaSpy: SinonSpy = sinon.spy(
      ContractAgent.prototype as any,
      'buildSearchCriteria',
    );

    const contract = new Contract(
      '2023-01-01',
      '2023-01-01',
      'Ecosystem A',
      [
        {
          participant: 'Participant A',
          role: 'Member',
          signature: 'Signature A',
          date: '2023-01-01',
        },
      ],
      'Orchestrator A',
      ['Purpose A'],
      [],
      [],
      [
        {
          participant: 'Participant A',
          serviceOffering: 'Service A',
          policies: [
            {
              description: 'use data',
              permission: [
                {
                  action: 'Action A',
                  target: 'Target A',
                  constraint: [
                    {
                      leftOperand: 'Operand A',
                      operator: 'Operator A',
                      rightOperand: 10,
                    },
                  ],
                },
              ],
              prohibition: [],
            },
            //
            {
              description: 'bob',
              permission: [
                {
                  action: 'Action A',
                  target: 'Target A',
                  constraint: [
                    {
                      leftOperand: 'Operand A',
                      operator: 'Operator A',
                      rightOperand: 10,
                    },
                  ],
                },
              ],
              prohibition: [],
            },
          ],
          _id: '1234',
        },
      ],
      'Active',
    );

    const profiles = await contractAgent.findSimilarProfiles(contract);

    sinon.assert.calledOnce(buildSearchCriteriaSpy);

    console.log(
      'buildSearchCriteria result:',
      JSON.stringify(buildSearchCriteriaSpy.returnValues[0], null, 2),
    );

    expect(buildSearchCriteriaSpy.calledOnce).to.be.true;

    buildSearchCriteriaSpy.restore();

    console.log('\nProfiles:', JSON.stringify(profiles, null, 2));
  });
});
