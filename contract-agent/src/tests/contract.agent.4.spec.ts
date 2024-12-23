import { expect } from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { ContractAgent } from '../ContractAgent';
import { MongooseProvider } from '../MongooseProvider';
import ContractModel from './mocks/contract.model.mock';
import { Agent } from '../Agent';

describe('ContractAgent with MongooseProvider', function () {
  this.timeout(10000);

  let agent: ContractAgent;
  let model: mongoose.Model<any>;

  before(async () => {
    Agent.setConfigPath('./mocks/contract-agent.config.json', __filename);
    model = await ContractModel.getModel();
    agent = await ContractAgent.retrieveService(MongooseProvider);
  });

  after(async () => {
    if (model) {
      await model.deleteMany({});
    }
    /*
    await Promise.all([
      mongoose.disconnect(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
    */
  });

  it('should initialize correctly', async () => {
    await model.create({
      ecosystem: 'test-ecosystem',
      serviceOfferings: [
        {
          participant: 'test-participant',
          serviceOffering: 'allowed-service',
          policies: [
            {
              description: 'allowed-policy',
              permission: [],
              prohibition: [],
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [],
      orchestrator: '',
      purpose: [],
      revokedMembers: [],
      rolesAndObligations: [],
    });
  });
});
