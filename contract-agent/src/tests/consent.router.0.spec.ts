import express from 'express';
import request from 'supertest';
import sinon, { SinonSpy } from 'sinon';
import { expect } from 'chai';
import router from '../agent.consent.router';
import { Agent } from '../Agent';
import { ConsentAgentRequestHandler } from '../ConsentAgentHandler';
import { MongoMemoryReplSet  } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { ChangeStreamDataProvider } from '../ChangeStreamDataProvider';


describe('ConsentAgent Router Tests', function () {
  let requestHandler: ConsentAgentRequestHandler;
  let getConsentRecommendationFromProfileSpy: SinonSpy;
  let getDataExchangeRecommendationFromProfileSpy: SinonSpy;
  let getPreferencesFromProfileSpy: SinonSpy;
  let addPreferenceToProfileSpy: SinonSpy;
  let getPreferenceByIdFromProfileSpy: SinonSpy;
  let updatePreferenceByIdFromProfileSpy: SinonSpy;
  let deletePreferenceByIdFromProfileSpy: SinonSpy;
  let getConfigurationsFromProfileSpy: SinonSpy;
  let getProfileByURLSpy: SinonSpy;
  let getProfilesSpy: SinonSpy;
  let updateProfileSpy: SinonSpy;
  let checkPreferenceMatchSpy: SinonSpy;
  let profileURI = 'default-profile-id';
  let preferenceId: string;
  let participant = '65eb2661a50cb6465d41865c';
  let mongoServer: MongoMemoryReplSet;
  let mongoUri: string;

  const app = express();
  app.use(express.json());
  app.use('/api', router);

  before(async function () {
    // Disconnect from the database using the static method
    await ChangeStreamDataProvider.disconnectFromDatabase(mongoUri, 'consent-manager');
    mongoServer = await MongoMemoryReplSet.create();
    mongoUri = mongoServer.getUri();
  
    const configFilePath = path.join(__dirname, './mocks/consent-agent.config.json');
    const configContent = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(configContent);

    config.dataProviderConfig.forEach((configItem: { url: string; }) => {
      configItem.url = mongoUri;
    });

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

    Agent.setConfigPath('./mocks/consent-agent.config.json', __filename);
    requestHandler = await ConsentAgentRequestHandler.retrieveService();
    const consentAgent = await requestHandler.getConsentAgent();
    const profile = await consentAgent.createProfileForParticipant(
      'some-participant-uri',
      false    
    );
    profileURI = profile.uri ?? profileURI;

    getConsentRecommendationFromProfileSpy = sinon.spy(
      requestHandler,
      'getConsentRecommendationFromProfile',
    );
    getDataExchangeRecommendationFromProfileSpy = sinon.spy(
      requestHandler,
      'getDataExchangeRecommendationFromProfile',
    );
    getPreferencesFromProfileSpy = sinon.spy(
      requestHandler,
      'getPreferencesFromProfile',
    );
    addPreferenceToProfileSpy = sinon.spy(
      requestHandler,
      'addPreferenceToProfile',
    );
    getPreferenceByIdFromProfileSpy = sinon.spy(
      requestHandler,
      'getPreferenceByIdFromProfile',
    );
    getConfigurationsFromProfileSpy = sinon.spy(
      requestHandler,
      'getConfigurationsFromProfile',
    );
    updatePreferenceByIdFromProfileSpy = sinon.spy(
      requestHandler,
      'updatePreferenceByIdFromProfile',
    );
    deletePreferenceByIdFromProfileSpy = sinon.spy(
      requestHandler,
      'deletePreferenceByIdFromProfile',
    );
    
    getProfileByURLSpy = sinon.spy(
      requestHandler,
      'getProfileByURL',
    );

    getProfilesSpy = sinon.spy(
      requestHandler,
      'getProfiles',
    );

    updateProfileSpy = sinon.spy(
      requestHandler,
      'updateProfile',
    );

    checkPreferenceMatchSpy = sinon.spy(
      requestHandler,
      'checkPreferenceMatch',
    );
  });

  after(async function () {
    getConsentRecommendationFromProfileSpy.restore();
    getDataExchangeRecommendationFromProfileSpy.restore();
    getPreferencesFromProfileSpy.restore();
    addPreferenceToProfileSpy.restore();
    getPreferenceByIdFromProfileSpy.restore();
    updatePreferenceByIdFromProfileSpy.restore();
    deletePreferenceByIdFromProfileSpy.restore();
    getConfigurationsFromProfileSpy.restore();
    getProfileByURLSpy.restore();
    getProfilesSpy.restore();
    updateProfileSpy.restore();
    checkPreferenceMatchSpy.restore();

    const configFilePath = path.join(__dirname, './mocks/consent-agent.config.json');
    const configContent = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(configContent);

    config.dataProviderConfig.forEach((configItem: { url: string}) => {
      configItem.url = 'test';
    });

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  });
  
  it('should get a configuration from profile', async function () {
    const response = await request(app)
      .get(`/api/profile/${profileURI}/configurations`)
      .timeout(20000)
      .expect(200);
    sinon.assert.calledOnce(getConfigurationsFromProfileSpy);
    sinon.assert.calledWith(getConfigurationsFromProfileSpy, profileURI);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('allowRecommendations', false);
  });

  it('should update a configuration from profile', async function () {
    const response = await request(app)
      .put(`/api/profile/${profileURI}/configurations`)
      .timeout(20000)
      .send({
        configurations: {
          allowRecommendations: true
        }
      })
      .expect(200);
    sinon.assert.calledOnce(getConfigurationsFromProfileSpy);
    sinon.assert.calledWith(getConfigurationsFromProfileSpy, profileURI);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('configurations');
    expect(response.body.configurations).to.have.property('allowRecommendations', true);
  });

  it('should get recommendations from profile', async function () {
    const response = await request(app)
      .get(`/api/profile/${profileURI}/recommendations/consent`)
      .timeout(20000)
      .expect(200);

    sinon.assert.calledOnce(getConsentRecommendationFromProfileSpy);
    sinon.assert.calledWith(
      getConsentRecommendationFromProfileSpy,
      profileURI,
    );
    expect(response.body).to.be.an('array');
  });

  it('should get data exchanges recommendations from profile', async function () {
    const response = await request(app)
      .get(`/api/profile/${profileURI}/recommendations/dataexchanges`)
      .timeout(20000)
      .expect(200);
    sinon.assert.calledOnce(getDataExchangeRecommendationFromProfileSpy);
    sinon.assert.calledWith(
      getDataExchangeRecommendationFromProfileSpy,
      profileURI,
    );
    expect(response.body).to.be.an('array');
  });

  it('should get preferences from profile', async function () {
    const response = await request(app)
      .get(`/api/profile/${profileURI}/preferences`)
      .timeout(20000)
      .expect(200);
    sinon.assert.calledOnce(getPreferencesFromProfileSpy);
    sinon.assert.calledWith(getPreferencesFromProfileSpy, profileURI);
    expect(response.body).to.be.an('array');
  });

  it('should handle adding preference to profile', async function () {
    const preference = [
      {
        'participant': participant,
        'asDataProvider': {
          'authorizationLevel': 'never',
          'conditions': [
            {
              'time': {
                'dayOfWeek': [
                  '0'
                ],
                'startTime': '2024-03-27T14:08:19.986Z',
                'endTime': '2025-03-27T14:08:19.986Z'
              }
            }
          ]
        },
        'asServiceProvider': {
          'authorizationLevel': 'always',
          'conditions': [
            {
              'time': {
                'dayOfWeek': [
                  '0'
                ],
                'startTime': '2024-03-27T14:08:19.986Z',
                'endTime': '2025-03-27T14:08:19.986Z'
              },
              'location': {
                'countryCode': 'US'
              }
            }
          ]
        }
      }
    ];
    const response = await request(app)
      .post(`/api/profile/${profileURI}/preferences`)
      .timeout(20000)
      .send({ preference })
      .expect(201);
    sinon.assert.calledOnce(addPreferenceToProfileSpy);
    sinon.assert.calledWith(
      addPreferenceToProfileSpy,
      profileURI,
    );
    expect(response.body).to.be.an('array');
    expect(response.body[0]).to.be.an('object');
    expect(response.body[0]).to.have.property('_id');
    preferenceId = response.body[0]._id;
  });

  it('should get preference by id for profile', async function () {
    const response = await request(app)
      .get(`/api/profile/${profileURI}/preferences/${preferenceId}`)
      .timeout(20000)
      .expect(200);
    sinon.assert.calledOnce(getPreferenceByIdFromProfileSpy);
    sinon.assert.calledWith(
      getPreferenceByIdFromProfileSpy,
      profileURI,
    );
    expect(response.body).to.be.an('array');
    expect(response.body[0]).to.be.an('object');
    expect(response.body[0]).to.have.property('_id');
  });

  it('should handle updating a preference from profile', async function () {
    const preference = {
      'asDataProvider': {
        'authorizationLevel': 'always'
      }
    };
    const response = await request(app)
      .put(`/api/profile/${profileURI}/preferences/${preferenceId}`)
      .timeout(20000)
      .send(preference)
      .expect(200);
    sinon.assert.calledOnce(updatePreferenceByIdFromProfileSpy);
    sinon.assert.calledWith(updatePreferenceByIdFromProfileSpy, profileURI, preferenceId);
    expect(response.body).to.be.an('array');
    expect(response.body[0]).to.be.an('object');
    expect(response.body[0]).to.have.property('_id');
    expect(response.body[0]).to.have.property('asDataProvider');
    expect(response.body[0].asDataProvider).to.have.property('authorizationLevel', 'always');
  });

  it('should handle delete a preference from profile', async function () {
    const response = await request(app)
      .delete(`/api/profile/${profileURI}/preferences/${preferenceId}`)
      .timeout(20000)
      .expect(200);
    sinon.assert.calledOnce(deletePreferenceByIdFromProfileSpy);
    sinon.assert.calledWith(deletePreferenceByIdFromProfileSpy, profileURI, preferenceId);
    expect(response.body).to.be.an('array');
  });

  it('should get a profile from URI', async function () {
    const response = await request(app)
      .get(`/api/profile/${profileURI}`)
      .timeout(20000)
      .expect(200);
    sinon.assert.calledOnce(getProfileByURLSpy);
    sinon.assert.calledWith(getProfileByURLSpy, profileURI);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('_id');
    expect(response.body).to.have.property('uri', profileURI);
  });

  it('should get all profiles', async function () {
    const response = await request(app)
      .get(`/api/profile/`)
      .timeout(20000)
      .expect(200);
    sinon.assert.calledOnce(getProfilesSpy);
    sinon.assert.calledWith(getProfilesSpy);
    expect(response.body).to.be.an('array');
  });

  it('should get a match for a profile', async function () {
    const response = await request(app)
      .get(`/api/profile/${profileURI}/preferences/match?participant=${participant}&asDataProvider=true`)
      .timeout(20000)
      .expect(200);
    sinon.assert.calledOnce(checkPreferenceMatchSpy);
    sinon.assert.calledWith(checkPreferenceMatchSpy);
    expect(response.body).to.be.equal(false);
  });
});
