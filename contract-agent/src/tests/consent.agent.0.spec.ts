import express from 'express';
import sinon, { SinonSpy } from 'sinon';
import { expect } from 'chai';
import router from '../agent.consent.router';
import { Agent } from '../Agent';
import mongoose from 'mongoose';
import { MongoMemoryReplSet  } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { ConsentAgent } from '../ConsentAgent';
import { ChangeStreamDataProvider } from '../ChangeStreamDataProvider';
import { SearchCriteria, FilterOperator } from '../types';
import { ObjectId } from 'mongodb';


describe('Consent Agent Handle Tests', function () {
  let createProfileForParticipantSpy: SinonSpy;
  let handlePrivacyNoticeSpy: SinonSpy;
  let handleConsentSpy: SinonSpy;
  let handleNewIdentifierSpy: SinonSpy;
  let handleRemoveConsentSpy: SinonSpy;
  let deleteProfileForParticipantSpy: SinonSpy;
  let handleRemovePrivacyNoticeSpy: SinonSpy;
  let mongoServer: MongoMemoryReplSet;
  let consentAgent: ConsentAgent;
  let userProvider: ChangeStreamDataProvider;
  let pnProvider: ChangeStreamDataProvider;
  let consentProvider: ChangeStreamDataProvider;
  let createdDocument: any;
  let userId: string;
  let pnId: string;
  let consentId: string;
  let mongoUri: string;

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const app = express();
  app.use(express.json());
  app.use('/api', router);

  before(async function () {
    mongoServer = await MongoMemoryReplSet.create();
    mongoUri = mongoServer.getUri();
  
    const configFilePath = path.join(__dirname, './mocks/consent-agent.config.json');
    const configContent = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(configContent);

    config.dataProviderConfig.forEach((configItem: { url: string}) => {
      configItem.url = mongoUri;
    });

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

    Agent.setConfigPath('./mocks/consent-agent.config.json', __filename);
    consentAgent = await ConsentAgent.retrieveService();
    userProvider = consentAgent.getDataProvider(
      'users',
    ) as ChangeStreamDataProvider;
    pnProvider = consentAgent.getDataProvider(
      'privacynotices',
    ) as ChangeStreamDataProvider;
    consentProvider = consentAgent.getDataProvider(
      'consents',
    ) as ChangeStreamDataProvider;

    createProfileForParticipantSpy = sinon.spy(
      ConsentAgent.prototype as any,
      'createProfileForParticipant',
    );

    handlePrivacyNoticeSpy = sinon.spy(
      ConsentAgent.prototype as any,
      'handlePrivacyNotice',
    );

    handleConsentSpy = sinon.spy(
      ConsentAgent.prototype as any,
      'handleConsent',
    );

    handleNewIdentifierSpy = sinon.spy(
      ConsentAgent.prototype as any,
      'handleNewIdentifier',
    );

    handleRemoveConsentSpy = sinon.spy(
      ConsentAgent.prototype as any,
      'handleRemoveConsent',
    );

    deleteProfileForParticipantSpy = sinon.spy(
      ConsentAgent.prototype as any,
      'deleteProfileForParticipant',
    );

    handleRemovePrivacyNoticeSpy = sinon.spy(
      ConsentAgent.prototype as any,
      'handleRemovePrivacyNotice',
    );
  });

  after(async function () {
    createProfileForParticipantSpy.restore();
    handlePrivacyNoticeSpy.restore();
    handleConsentSpy.restore();
    handleNewIdentifierSpy.restore();
    handleRemoveConsentSpy.restore();
    deleteProfileForParticipantSpy.restore();
    handleRemovePrivacyNoticeSpy.restore();

    const configFilePath = path.join(__dirname, './mocks/consent-agent.config.json');
    const configContent = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(configContent);

    config.dataProviderConfig.forEach((configItem: { url: string}) => {
      configItem.url = 'test';
    });

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  });

  it('should verify the flow for creating a users and creating profile', async function () {
    createdDocument = await userProvider.create({
      'firstName': '',
      'lastName': '',
      'email': 'john@doe.com',
      'identifiers': [
      ],
      'schema_version': 'v0.1.0',
      'password': '$2b$10$nSTjO/Gvo1hfttJXLewX0OcU.q0.m8QnFRRm0roj3iGKIYEccNwwK'
    },);
    expect(createdDocument).to.have.property('_id');
    userId = createdDocument._id.toString();

    await delay(1000);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(createProfileForParticipantSpy);
    expect(createProfileForParticipantSpy.calledOnce).to.be.true;

    sinon.assert.callCount(
      createProfileForParticipantSpy,
      1,
    );
  });

  it('should verify the flow for creating a privacy notice', async function () {
    const privacyNoticeData = {
      'contract': 'http://localhost:8888/contracts/672c89942308b486f7d0bca1',
      'purposes': [
        {
          'purpose': 'consumer consent data',
          'serviceOffering': 'http://host.docker.internal:4040/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
          'resource': 'http://host.docker.internal:4040/v1/catalog/softwareresources/672c8acc870a096712ca565d'
        }
      ],
      'categoriesOfData': [],
      'data': [
        {
          'resource': 'http://host.docker.internal:4040/v1/catalog/dataresources/672c8a28870a096712ca4e63',
          'serviceOffering': 'http://host.docker.internal:4040/v1/catalog/serviceofferings/672c89cb870a096712ca4d59'
        }
      ],
      'recipients': [
        'http://host.docker.internal:4040/v1/catalog/participants/66d18a1dee71f9f096baec08'
      ],
      'internationalTransfers': {
        'countries': [],
        'safeguards': ''
      },
      'retentionPeriod': '',
      'piiPrincipalRights': [],
      'withdrawalOfConsent': '',
      'complaintRights': '',
    };
    const createdPrivacyNotice = await pnProvider.create(privacyNoticeData);
    expect(createdPrivacyNotice).to.have.property('_id');

    pnId = createdPrivacyNotice._id.toString();

    await delay(1000);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(handlePrivacyNoticeSpy);
    expect(handlePrivacyNoticeSpy.calledOnce).to.be.true;

    sinon.assert.callCount(
      handlePrivacyNoticeSpy,
      1,
    );
  });

  it('should verify the flow for creating a consent', async function () {
    const consentData = {
      'contract': 'http://localhost:8888/contracts/672c89942308b486f7d0bca1',
      'user': '660fff4528678b2683bab15f',
      'providerUserIdentifier': '666037e537cc7512bb4e4e65',
      'consumerUserIdentifier': '664f48fdc37cba87ff047f8b',
      'consented': true,
      'dataProvider': '65eb2661a50cb6465d41865c',
      'dataConsumer': '65eb2661a50cb6465d41865b',
      'recipients': [
        'http://host.docker.internal:4040/v1/catalog/participants/66d18a1dee71f9f096baec08'
      ],
      'purposes': [
        {
          'purpose': 'consumer consent data',
          'resource': 'http://host.docker.internal:4040/v1/catalog/softwareresources/672c8acc870a096712ca565d',
          'serviceOffering': 'http://host.docker.internal:4040/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
          'collectionMethod': [],
          'processingMethod': [],
          'piiInformation': []
        }
      ],
      'data': [
        {
          'resource': 'http://host.docker.internal:4040/v1/catalog/dataresources/672c8a28870a096712ca4e63',
          'serviceOffering': 'http://host.docker.internal:4040/v1/catalog/serviceofferings/672c89cb870a096712ca4d59'
        }
      ],
      'status': 'granted',
      'piiPrincipalRights': [],
      'privacyNotice': '67619b95c67243dcb2ec9412',
      'processingLocations': [],
      'storageLocations': [],
      'token': '',
      'schema_version': '0.2.0',
      'geographicRestrictions': [],
      'services': [],
      'event': [
        {
          'eventTime': '2024-12-17T15:59:50.234Z',
          'validityDuration': '0',
          'eventType': 'explicit',
          'eventState': 'consent given',
          '_id': '6761a035bad945ee8beaeb10'
        }
      ],
      'recipientThirdParties': [],
    };
    const createdConsent = await consentProvider.create(consentData);
    expect(createdConsent).to.have.property('_id');
    consentId = createdConsent._id.toString();
    await delay(1000);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(handleConsentSpy);
    expect(handleConsentSpy.calledOnce).to.be.true;

    sinon.assert.callCount(
      handleConsentSpy,
      1,
    );
  });

  it('should verify the flow for updating a user', async function () {
    const updateData = {
      'identifiers': [
        '67619b95c67243dcb2ec9412'
      ]
    };
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: '_id',
          operator: FilterOperator.EQUALS,
          value: new ObjectId(userId),
        },
      ],
      threshold: 0,
    };
    await userProvider.update(
      criteria,
      updateData,
    );
    await delay(1000);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(handleNewIdentifierSpy);
    expect(handleNewIdentifierSpy.calledOnce).to.be.true;

    sinon.assert.callCount(
      handleNewIdentifierSpy,
      1,
    );
  });

  it('should verify the flow for updating a consent', async function () {
    const updateData = {
      'status': 'revoked',
    };
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: '_id',
          operator: FilterOperator.EQUALS,
          value: new ObjectId(consentId),
        },
      ],
      threshold: 0,
    };
    await consentProvider.update(
      criteria,
      updateData,
    );
    await delay(1000);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(handleRemoveConsentSpy);
    expect(handleRemoveConsentSpy.calledOnce).to.be.true;

    sinon.assert.callCount(
      handleRemoveConsentSpy,
      1,
    );
  });

  it('should verify the flow for deleting a privacy notice', async function () {
    await pnProvider.delete(pnId);
    await delay(1000);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(handleRemovePrivacyNoticeSpy);
    expect(handleRemovePrivacyNoticeSpy.calledOnce).to.be.true;

    sinon.assert.callCount(
      handleRemovePrivacyNoticeSpy,
      1,
    );
  });

  it('should verify the flow for deleting a consent', async function () {
    await consentProvider.delete(consentId);
    await delay(1000);
    await new Promise(setImmediate);

    sinon.assert.calledTwice(handleRemoveConsentSpy);
    expect(handleRemoveConsentSpy.calledTwice).to.be.true;

    sinon.assert.callCount(
      handleRemoveConsentSpy,
      2,
    );
  });

  it('should verify the flow for deleting a user', async function () {
    await userProvider.delete(userId);
    await delay(100);
    await new Promise(setImmediate);

    sinon.assert.calledOnce(deleteProfileForParticipantSpy);
    expect(deleteProfileForParticipantSpy.calledOnce).to.be.true;

    sinon.assert.callCount(
      deleteProfileForParticipantSpy,
      1,
    );
  });
});
