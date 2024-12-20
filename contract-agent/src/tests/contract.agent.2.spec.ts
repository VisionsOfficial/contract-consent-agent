import { expect } from 'chai';
import sinon from 'sinon';
import { ContractAgent } from '../ContractAgent';
import { MongooseProvider } from '../MongooseProvider';
import ContractModel from './mocks/contract.model.mock';
import mongoose from 'mongoose';
import { Logger } from '../Logger';
import { Agent } from '../Agent';

describe('ContractAgent with MongooseProvider', () => {
  let agent: ContractAgent;
  let handleDataInsertedSpy: sinon.SinonSpy;
  let handleDataUpdatedSpy: sinon.SinonSpy;
  let handleDataDeletedSpy: sinon.SinonSpy;

  before(async () => {
    Agent.setConfigPath('./mocks/contract-agent.config.json', __filename);

    await mongoose.connect('mongodb://localhost:27017/test');
    MongooseProvider.setCollectionModel('contracts', ContractModel.schema);
    agent = await ContractAgent.retrieveService(MongooseProvider);
    handleDataInsertedSpy = sinon.spy(agent as any, 'handleDataInserted');
    handleDataUpdatedSpy = sinon.spy(agent as any, 'handleDataUpdated');
    handleDataDeletedSpy = sinon.spy(agent as any, 'handleDataDeleted');
  });

  afterEach(async () => {
    await ContractModel.deleteMany({});
    handleDataInsertedSpy.resetHistory();
    handleDataUpdatedSpy.resetHistory();
    handleDataDeletedSpy.resetHistory();
  });

  after(async () => {
    handleDataInsertedSpy.restore();
    handleDataUpdatedSpy.restore();
    handleDataDeletedSpy.restore();
    await mongoose.disconnect();
  });

  it('should trigger handleDataInserted when a new contract is created', async () => {
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
    };

    const contract = await ContractModel.create(contractData);

    expect(handleDataInsertedSpy.calledOnce).to.be.true;
    expect(handleDataInsertedSpy.firstCall.args[0]).to.have.property(
      'source',
      'contracts',
    );
    expect(handleDataInsertedSpy.firstCall.args[0]).to.have.property(
      'fullDocument',
    );
  });

  it('should trigger handleDataUpdated when a contract is updated', async () => {
    const contract = await ContractModel.create({
      uid: 'test-contract-2',
      profile: 'test-profile',
      ecosystem: 'test-ecosystem',
      orchestrator: 'test-orchestrator',
    });

    handleDataInsertedSpy.resetHistory();
    await contract.updateOne({
      $set: { profile: 'updated-profile' },
    });
    expect(handleDataUpdatedSpy.calledOnce).to.be.true;
    expect(handleDataUpdatedSpy.firstCall.args[0]).to.have.property(
      'source',
      'contracts',
    );
    expect(handleDataUpdatedSpy.firstCall.args[0]).to.have.property(
      'updateDescription',
    );
  });

  it('should trigger handleDataDeleted when a contract is deleted', async () => {
    const contract = await ContractModel.create({
      uid: 'test-contract-3',
      profile: 'test-profile',
      ecosystem: 'test-ecosystem',
      orchestrator: 'test-orchestrator',
    });

    handleDataInsertedSpy.resetHistory();
    await contract.deleteOne();
    expect(handleDataDeletedSpy.calledOnce).to.be.true;
    expect(handleDataDeletedSpy.firstCall.args[0]).to.have.property(
      'source',
      'contracts',
    );
    expect(handleDataDeletedSpy.firstCall.args[0]).to.have.property(
      'documentKey',
    );
  });

  it('should handle multiple operations in sequence', async () => {
    const contract = await ContractModel.create({
      uid: 'test-contract-4',
      profile: 'test-profile',
      ecosystem: 'test-ecosystem',
      orchestrator: 'test-orchestrator',
    });
    await contract.updateOne({
      $set: { profile: 'updated-profile' },
    });
    await contract.deleteOne();
    expect(handleDataInsertedSpy.calledOnce).to.be.true;
    expect(handleDataUpdatedSpy.calledOnce).to.be.true;
    expect(handleDataDeletedSpy.calledOnce).to.be.true;
    expect(handleDataInsertedSpy.calledBefore(handleDataUpdatedSpy)).to.be.true;
    expect(handleDataUpdatedSpy.calledBefore(handleDataDeletedSpy)).to.be.true;
  });
});
