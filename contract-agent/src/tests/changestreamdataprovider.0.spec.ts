import { expect } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import { ChangeStreamDataProvider } from '../ChangeStreamDataProvider';
import { Logger } from '../Logger';
import { FilterOperator, SearchCriteria } from '../types';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

class AgentTest {
  private dataProvider: ChangeStreamDataProvider;
  public handleDataInsertedSpy: SinonSpy;
  public handleDataUpdatedSpy: SinonSpy;
  public handleDataDeletedSpy: SinonSpy;

  constructor(provider: ChangeStreamDataProvider) {
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

describe('ChangeStreamDataProvider - createCollectionProxy Test Cases', function () {
  let changeStreamProvider: ChangeStreamDataProvider;
  let agentTest: AgentTest;
  let mongoServer: MongoMemoryReplSet;
  let mongoUri: string;

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const collection = 'dataprovider_collection_test';
  before(async function () {
    // Disconnect from the database using the static method
    await ChangeStreamDataProvider.disconnectFromDatabase(
      mongoUri,
      'consent-manager',
    );
    mongoServer = await MongoMemoryReplSet.create();
    mongoUri = mongoServer.getUri();

    const configFilePath = path.join(
      __dirname,
      './mocks/consent-agent.config.json',
    );
    const configContent = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(configContent);

    config.dataProviderConfig.forEach((configItem: { url: string }) => {
      configItem.url = mongoUri;
    });

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

    const configCSDP = {
      url: mongoUri,
      dbName: 'contract_consent_agent_db',
      source: collection,
    };

    changeStreamProvider = new ChangeStreamDataProvider(configCSDP);
    await changeStreamProvider.ensureReady();
    agentTest = new AgentTest(changeStreamProvider);
  });

  afterEach(async function () {
    // Disconnect from the database using the static method
    await ChangeStreamDataProvider.disconnectFromDatabase(
      mongoUri,
      'consent-manager',
    );

    const configFilePath = path.join(
      __dirname,
      './mocks/consent-agent.config.json',
    );
    const configContent = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(configContent);

    config.dataProviderConfig.forEach((configItem: { url: string }) => {
      configItem.url = 'test';
    });

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    agentTest.handleDataInsertedSpy.resetHistory();
    agentTest.handleDataUpdatedSpy.resetHistory();
    agentTest.handleDataDeletedSpy.resetHistory();
  });

  it('should emit dataInserted event when creating a document', async function () {
    const testData = { name: 'test', value: 123 };
    const result = await changeStreamProvider.create(testData);
    await delay(1000);
    await new Promise(setImmediate);
    expect(agentTest.handleDataInsertedSpy.calledOnce).to.be.true;
    const eventData = agentTest.handleDataInsertedSpy.firstCall.args[0];
    expect(eventData).to.have.property('source', collection);
    expect(eventData).to.have.property('fullDocument');
    expect(eventData.fullDocument.name).to.equal(testData.name);
    expect(eventData.fullDocument.value).to.equal(testData.value);
    if (result._id) {
      await changeStreamProvider.delete(result._id.toString());
    }
  });

  it('should emit dataUpdated event when updating a document', async function () {
    const testData = { name: 'test-update', value: 456 };
    const created = await changeStreamProvider.create(testData);
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

    await changeStreamProvider.update(criteria, updateData);
    await delay(1000);
    expect(agentTest.handleDataUpdatedSpy.calledOnce).to.be.true;
    const eventData = agentTest.handleDataUpdatedSpy.firstCall.args[0];
    expect(eventData).to.have.property('source', collection);
    expect(eventData).to.have.property('documentKey');
    expect(eventData).to.have.property('updateDescription');
    if (created._id) {
      await changeStreamProvider.delete(created._id.toString());
    }
  });

  it('should emit dataDeleted event when deleting a document', async function () {
    const testData = { name: 'test-delete', value: 999 };
    const created = await changeStreamProvider.create(testData);
    await delay(1000);
    agentTest.handleDataInsertedSpy.resetHistory();
    if (created._id) {
      await changeStreamProvider.delete(created._id.toString());
    }
    expect(agentTest.handleDataDeletedSpy.calledOnce).to.be.true;
    const eventData = agentTest.handleDataDeletedSpy.firstCall.args[0];
    expect(eventData).to.have.property('source', collection);
    expect(eventData).to.have.property('documentKey');
  });
});
