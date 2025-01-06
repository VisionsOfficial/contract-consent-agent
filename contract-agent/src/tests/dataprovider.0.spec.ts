import { expect } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import { MongoDBProvider } from '../MongoDBProvider';
import { FilterOperator, SearchCriteria } from '../types';
import { Logger } from '../Logger';

class AgentTest {
  private dataProvider: MongoDBProvider;
  public handleDataInsertedSpy: SinonSpy;
  public handleDataUpdatedSpy: SinonSpy;
  public handleDataDeletedSpy: SinonSpy;

  constructor(provider: MongoDBProvider) {
    this.dataProvider = provider;
    this.handleDataInsertedSpy = sinon.spy();
    this.handleDataUpdatedSpy = sinon.spy();
    this.handleDataDeletedSpy = sinon.spy();
    this.setupProviderEventHandlers();
  }

  protected setupProviderEventHandlers(): void {
    this.dataProvider.on('dataInserted', this.handleDataInserted.bind(this));
    this.dataProvider.on('dataUpdated', this.handleDataUpdated.bind(this));
    this.dataProvider.on('dataDeleted', this.handleDataDeleted.bind(this));
  }

  protected handleDataInserted(data: any): void {
    Logger.info('- handleDataInserted called');
    this.handleDataInsertedSpy(data);
  }

  protected handleDataUpdated(data: any): void {
    Logger.info('- handleDataUpdated called');
    this.handleDataUpdatedSpy(data);
  }

  protected handleDataDeleted(data: any): void {
    Logger.info('- handleDataDeleted called');
    this.handleDataDeletedSpy(data);
  }
}

describe('DataProvider Events Test Cases', function () {
  let mongoProvider: MongoDBProvider;
  let agentTest: AgentTest;

  const collection = 'dataprovider_collection_test';
  before(async function () {
    const config = {
      url: 'mongodb://localhost:27017',
      dbName: 'contract_consent_agent_db',
      source: collection,
    };

    mongoProvider = new MongoDBProvider(config);
    await mongoProvider.ensureReady();
    agentTest = new AgentTest(mongoProvider);
  });

  afterEach(function () {
    agentTest.handleDataInsertedSpy.resetHistory();
    agentTest.handleDataUpdatedSpy.resetHistory();
    agentTest.handleDataDeletedSpy.resetHistory();
  });

  it('should emit dataInserted event when creating a document', async function () {
    const testData = { name: 'test', value: 123 };
    const result = await mongoProvider.create(testData);
    expect(agentTest.handleDataInsertedSpy.calledOnce).to.be.true;
    const eventData = agentTest.handleDataInsertedSpy.firstCall.args[0];
    expect(eventData).to.have.property('source', collection);
    expect(eventData).to.have.property('fullDocument');
    expect(eventData.fullDocument).to.include(testData);
    if (result._id) {
      await mongoProvider.delete(result._id.toString());
    }
  });

  it('should emit dataUpdated event when updating a document', async function () {
    const testData = { name: 'test-update', value: 456 };
    const created = await mongoProvider.create(testData);
    agentTest.handleDataInsertedSpy.resetHistory();
    const updateData = { value: 789 };
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: '_id',
          operator: FilterOperator.EQUALS,
          value: created._id,
        },
      ],
      threshold: 0,
    };

    await mongoProvider.update(criteria, updateData);

    expect(agentTest.handleDataUpdatedSpy.calledOnce).to.be.true;
    const eventData = agentTest.handleDataUpdatedSpy.firstCall.args[0];
    expect(eventData).to.have.property('source', collection);
    expect(eventData).to.have.property('documentKey');
    expect(eventData).to.have.property('updateDescription');
    if (created._id) {
      await mongoProvider.delete(created._id.toString());
    }
  });

  it('should emit dataDeleted event when deleting a document', async function () {
    const testData = { name: 'test-delete', value: 999 };
    const created = await mongoProvider.create(testData);
    agentTest.handleDataInsertedSpy.resetHistory();
    if (created._id) {
      await mongoProvider.delete(created._id.toString());
    }
    expect(agentTest.handleDataDeletedSpy.calledOnce).to.be.true;
    const eventData = agentTest.handleDataDeletedSpy.firstCall.args[0];
    expect(eventData).to.have.property('source', collection);
    expect(eventData).to.have.property('documentKey');
  });
});
