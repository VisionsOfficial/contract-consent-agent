import { expect } from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { ContractAgent } from '../ContractAgent';
import { MongooseProvider } from '../MongooseProvider';
import ContractModel from './mocks/contract.model.mock';
import { Agent } from '../Agent';

describe('ContractAgent with MongooseProvider', function () {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  this.timeout(10000);

  let agent: ContractAgent;
  let model: mongoose.Model<any>;
  let updateProfileFromContractChangeSpy: sinon.SinonSpy;

  before(async function () {
    Agent.setConfigPath('./mocks/contract-agent.config.json', __filename);
    model = await ContractModel.getModel();
    agent = await ContractAgent.retrieveService(MongooseProvider);

    updateProfileFromContractChangeSpy = sinon.spy(
      ContractAgent.prototype as any,
      'updateProfileFromContractChange',
    );
  });

  after(async function () {
    updateProfileFromContractChangeSpy.restore();
    if (model) {
      await model.deleteMany({});
    }
    await Promise.all([
      mongoose.disconnect(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  });

  it('should initialize correctly and trigger handleDataInserted via create', async function () {
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

    await delay(100);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(updateProfileFromContractChangeSpy);
  });

  it('should initialize correctly and trigger handleDataInserted via save', async function () {
    const contract = new model();
    updateProfileFromContractChangeSpy.resetHistory();

    await contract.save({
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

    await delay(100);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(updateProfileFromContractChangeSpy);
  });

  it('should trigger updateProfileFromContractChange on update', async function () {
    const doc = await model.create({
      ecosystem: 'test-ecosystem-update',
      serviceOfferings: [
        {
          participant: 'test-participant-update',
          serviceOffering: 'allowed-service',
          policies: [
            { description: 'allowed-policy', permission: [], prohibition: [] },
          ],
        },
      ],
      members: [],
      orchestrator: '',
      purpose: [],
      revokedMembers: [],
      rolesAndObligations: [],
    });

    updateProfileFromContractChangeSpy.resetHistory();

    await model.findByIdAndUpdate(doc._id, {
      $set: { ecosystem: 'updated-ecosystem' },
    });

    await delay(100);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(updateProfileFromContractChangeSpy);
  });
});
