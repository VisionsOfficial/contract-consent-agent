import { expect } from 'chai';
import mongoose from 'mongoose';
import ContractModel, { IContract } from './mocks/contract.model.mock';
import { Logger } from '../Logger';

describe('ContractModel Basic Tests', () => {
  let model: mongoose.Model<IContract>;
  before(async () => {
    model = await ContractModel.getModel();
    try {
      await mongoose.connect('mongodb://localhost:27017/test');
      Logger.info('Connected to MongoDB');
    } catch (error) {
      Logger.error(`MongoDB Connection Error: ${error}`);
      throw error;
    }
  });

  after(async () => {
    await model.deleteMany({});
    await mongoose.disconnect();
    Logger.info('Disconnected from MongoDB');
  });

  it('should create a contract document', async () => {
    const contractData: Partial<IContract> = {
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

    const contract = await model.create(contractData);
    expect(contract).to.exist;
    expect(contract.uid).to.equal(contractData.uid);

    const foundContract = await model.findOne({
      uid: contractData.uid,
    });
    expect(foundContract).to.exist;
    expect(foundContract?.uid).to.equal(contractData.uid);
  });
});
