import { MongoDBProvider } from '../MongoDBProvider';
import { ContractAgent } from '../ContractAgent';
import sinon, { SinonSpy } from 'sinon';
import { expect } from 'chai';
import { ContractBase } from './mocks/contract.mock';
import { Agent } from '../Agent';

describe('Contract Agent Test Cases', function () {
  let createdDocument: any;
  let contractAgent: ContractAgent;
  let contractProvider: MongoDBProvider;

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  let updateProfileFromContractChangeSpy: SinonSpy;
  let updateProfilesForMembersSpy: SinonSpy;
  let updateProfilesForServiceOfferingsSpy: SinonSpy;
  let updateProfileForOrchestratorSpy: SinonSpy;
  let updateProfileSpy: SinonSpy;

  before(async function () {
    Agent.setConfigPath('./mocks/contract-agent.config.json', __filename);
    contractAgent = await ContractAgent.retrieveService();
    contractProvider = contractAgent.getDataProvider(
      'contracts',
    ) as MongoDBProvider;

    updateProfileFromContractChangeSpy = sinon.spy(
      ContractAgent.prototype as any,
      'updateProfileFromContractChange',
    );
    updateProfilesForMembersSpy = sinon.spy(
      ContractAgent.prototype as any,
      'updateProfilesForMembers',
    );
    updateProfilesForServiceOfferingsSpy = sinon.spy(
      ContractAgent.prototype as any,
      'updateProfilesForServiceOfferings',
    );
    updateProfileForOrchestratorSpy = sinon.spy(
      ContractAgent.prototype as any,
      'updateProfileForOrchestrator',
    );
    updateProfileSpy = sinon.spy(
      ContractAgent.prototype as any,
      'updateProfile',
    );
  });

  after(async function () {
    updateProfileFromContractChangeSpy.restore();
    updateProfilesForMembersSpy.restore();
    updateProfilesForServiceOfferingsSpy.restore();
    updateProfileForOrchestratorSpy.restore();
    updateProfileSpy.restore();
  });

  it('should verify the flow for creating a contract and updating profiles', async function () {
    createdDocument = await contractProvider.create(ContractBase);
    expect(createdDocument).to.have.property('_id');

    await delay(100);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(updateProfileFromContractChangeSpy);
    expect(updateProfileFromContractChangeSpy.calledOnce).to.be.true;

    sinon.assert.calledOnce(updateProfilesForMembersSpy);
    sinon.assert.calledOnce(updateProfilesForServiceOfferingsSpy);
    sinon.assert.calledOnce(updateProfileForOrchestratorSpy);

    sinon.assert.callCount(
      updateProfileSpy,
      ContractBase.members.length + ContractBase.serviceOfferings.length + 1,
    );
  });

  it('should delete the previously created contract successfully', async function () {
    expect(createdDocument).to.not.be.undefined;

    const deleteResult = await contractProvider.delete(
      createdDocument._id.toString(),
    );
    expect(deleteResult).to.be.true;

    const secondDeleteResult = await contractProvider.delete(
      createdDocument._id.toString(),
    );
    expect(secondDeleteResult).to.be.false;
  });
});
