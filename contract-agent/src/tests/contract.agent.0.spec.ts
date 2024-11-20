import { MongoDBProvider } from '../MongoDBProvider';
import { Profile } from '../Profile';
import { MongoClient } from 'mongodb';
import { ContractAgent } from '../ContractAgent';
import { Contract } from '../Contract';
import sinon, { SinonSpy } from 'sinon';
import { expect } from 'chai';
import { ContractBase } from './mocks/contract.mock';
import { DataProvider } from '../DataProvider';

describe('Contract Agent Test Cases 0', function () {
  let contractAgent: ContractAgent;
  let contractProvider: MongoDBProvider;
  beforeEach(async function () {
    const setupMongoDB = async function () {
      try {
        const client = await MongoClient.connect('mongodb://localhost:27017');
        console.log('MongoDB connected successfully');
        const db = client.db('contract_consent_agent_db');
        return db;
      } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      }
    };

    await MongoDBProvider.mongoDBConnect();
    contractAgent = ContractAgent.retrieveService();
    contractProvider = contractAgent.getDataProvider(
      'contracts',
    ) as MongoDBProvider;

    // const mongoDB = await setupMongoDB();
    // contractProvider = new MongoDBProvider(mongoDB, 'Contract');
    // contractAgent = ContractAgent.retrieveService();
    // contractAgent.addDataProviders([{ provider: contractProvider }]);
  });

  it('it should 0', async function () {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const updateProfileFromContractChangeSpy: SinonSpy = sinon.spy(
      ContractAgent.prototype as any,
      'updateProfileFromContractChange',
    );
    await contractProvider.create(ContractBase);
    await delay(100);
    await new Promise(setImmediate);
    sinon.assert.calledOnce(updateProfileFromContractChangeSpy);
    expect(updateProfileFromContractChangeSpy.calledOnce).to.be.true;
  });
});
