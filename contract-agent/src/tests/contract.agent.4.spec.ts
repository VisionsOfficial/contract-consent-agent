import { expect } from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { ContractAgent } from '../ContractAgent';
import { MongooseProvider } from '../MongooseProvider';
import ContractModel, { IContract } from './mocks/contract.model.mock';
import { Agent } from '../Agent';

describe('ContractAgent Integration with MongooseProvider', () => {
  let agent: ContractAgent;
  let model: mongoose.Model<IContract>;
  let handleDataInsertedSpy: sinon.SinonSpy;
  let handleDataUpdatedSpy: sinon.SinonSpy;
  let handleDataDeletedSpy: sinon.SinonSpy;

  before(async () => {
    Agent.setConfigPath('./mocks/contract-agent.config.json', __filename);
    model = await ContractModel.getModel();
    agent = await ContractAgent.retrieveService(MongooseProvider);

    handleDataInsertedSpy = sinon.spy(agent as any, 'handleDataInserted');
    handleDataUpdatedSpy = sinon.spy(agent as any, 'handleDataUpdated');
    handleDataDeletedSpy = sinon.spy(agent as any, 'handleDataDeleted');
  });

  beforeEach(async () => {
    handleDataInsertedSpy.resetHistory();
    handleDataUpdatedSpy.resetHistory();
    handleDataDeletedSpy.resetHistory();
    await model.deleteMany({});
  });

  after(async () => {
    handleDataInsertedSpy.restore();
    handleDataUpdatedSpy.restore();
    handleDataDeletedSpy.restore();
    await mongoose.disconnect();
  });

  it('should trigger handleDataInserted when creating a contract via model', async () => {
    const contractData = {
      uid: 'test-contract-1',
      profile: 'test-profile',
      ecosystem: 'test-ecosystem',
      orchestrator: 'test-orchestrator',
      members: [
        {
          participant: 'test-participant',
          role: 'test-role',
          signature: 'test-signature',
        },
      ],
      status: 'pending',
      serviceOfferings: [],
      rolesAndObligations: [],
      purpose: [],
      revokedMembers: [],
    };

    await model.create(contractData);
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handleDataInsertedSpy.calledOnce).to.be.true;
    expect(handleDataInsertedSpy.firstCall.args[0]).to.have.property(
      'source',
      'contracts',
    );
    expect(handleDataInsertedSpy.firstCall.args[0].fullDocument).to.include(
      contractData,
    );
  });

  it('should trigger handleDataUpdated when updating a contract via model', async () => {
    const contract = await model.create({
      uid: 'test-contract-2',
      profile: 'old-profile',
      ecosystem: 'test-ecosystem',
      orchestrator: 'test-orchestrator',
      status: 'pending',
    });

    await model.updateOne(
      { _id: contract._id },
      { $set: { profile: 'new-profile' } },
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handleDataUpdatedSpy.calledOnce).to.be.true;
    expect(handleDataUpdatedSpy.firstCall.args[0]).to.have.property(
      'source',
      'contracts',
    );
    expect(handleDataUpdatedSpy.firstCall.args[0]).to.have.property(
      'updateDescription',
    );
  });

  it('should trigger handleDataDeleted when deleting a contract via model', async () => {
    const contract = await model.create({
      uid: 'test-contract-3',
      profile: 'test-profile',
      ecosystem: 'test-ecosystem',
      orchestrator: 'test-orchestrator',
      status: 'pending',
    });

    await model.deleteOne({ _id: contract._id });
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handleDataDeletedSpy.calledOnce).to.be.true;
    expect(handleDataDeletedSpy.firstCall.args[0]).to.have.property(
      'source',
      'contracts',
    );
    expect(handleDataDeletedSpy.firstCall.args[0]).to.have.property(
      'documentKey',
    );
  });
});
