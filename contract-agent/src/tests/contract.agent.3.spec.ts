import { expect } from 'chai';
import mongoose from 'mongoose';
import { MongooseProvider } from '../MongooseProvider';
import ContractModel, { IContract } from './mocks/contract.model.mock';
import { Logger } from '../Logger';

describe('MongooseProvider Events Tests', () => {
  let provider: MongooseProvider;
  let model: mongoose.Model<IContract>;
  let dataInsertedEventReceived: boolean = false;
  let dataInsertedPayload: any = null;
  let dataUpdatedEventReceived: boolean = false;
  let dataUpdatedPayload: any = null;
  let dataDeletedEventReceived: boolean = false;
  let dataDeletedPayload: any = null;

  before(async () => {
    provider = new MongooseProvider({
      source: 'contracts',
      url: 'mongodb://localhost:27017',
      dbName: 'test',
    });

    provider.on('dataInserted', (event) => {
      dataInsertedEventReceived = true;
      dataInsertedPayload = event;
    });

    provider.on('dataUpdated', (event) => {
      dataUpdatedEventReceived = true;
      dataUpdatedPayload = event;
    });

    provider.on('dataDeleted', (event) => {
      dataDeletedEventReceived = true;
      dataDeletedPayload = event;
    });

    model = await ContractModel.getModel();
    await provider.ensureReady();
  });

  beforeEach(async () => {
    dataInsertedEventReceived = false;
    dataInsertedPayload = null;
    dataUpdatedEventReceived = false;
    dataUpdatedPayload = null;
    dataDeletedEventReceived = false;
    dataDeletedPayload = null;
    await model.deleteMany({});
  });

  after(async () => {
    await model.deleteMany({});
    await mongoose.disconnect();
  });

  it('should emit dataInserted event when saving a new document', async () => {
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

    const contract = new model(contractData);
    await contract.save();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(dataInsertedEventReceived).to.be.true;
    expect(dataInsertedPayload).to.exist;
    expect(dataInsertedPayload.source).to.equal('contracts');
    expect(dataInsertedPayload.fullDocument).to.exist;
    expect(dataInsertedPayload.fullDocument.uid).to.equal(contractData.uid);
  });

  it('should emit dataInserted event when creating via model.create()', async () => {
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

    expect(dataInsertedEventReceived).to.be.true;
    expect(dataInsertedPayload).to.exist;
    expect(dataInsertedPayload.source).to.equal('contracts');
    expect(dataInsertedPayload.fullDocument.uid).to.equal(contractData.uid);
  });

  it('should emit dataUpdated event when updating via model.updateOne()', async () => {
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

    expect(dataUpdatedEventReceived).to.be.true;
    expect(dataUpdatedPayload).to.exist;
    expect(dataUpdatedPayload.source).to.equal('contracts');
    expect(dataUpdatedPayload.updateDescription).to.exist;
  });

  it('should emit dataDeleted event when deleting via model.deleteOne()', async () => {
    const contract = await model.create({
      uid: 'test-contract-3',
      profile: 'test-profile',
      ecosystem: 'test-ecosystem',
      orchestrator: 'test-orchestrator',
      status: 'pending',
    });

    await model.deleteOne({ _id: contract._id });
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(dataDeletedEventReceived).to.be.true;
    expect(dataDeletedPayload).to.exist;
    expect(dataDeletedPayload.source).to.equal('contracts');
    expect(dataDeletedPayload.documentKey).to.exist;
  });
});
