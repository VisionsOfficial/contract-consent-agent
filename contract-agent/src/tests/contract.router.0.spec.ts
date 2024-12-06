import express from 'express';
import request from 'supertest';
import sinon, { SinonSpy } from 'sinon';
import { RequestHandler } from '../ContractAgentHandler';
import { expect } from 'chai';
import router from '../agent.contract.router';

describe('ContractAgent Router Tests', function () {
  let requestHandler: RequestHandler;
  let getPoliciesRecommendationFromProfileSpy: SinonSpy;
  let getServicesRecommendationFromProfileSpy: SinonSpy;
  let getPoliciesMatchingFromProfileSpy: SinonSpy;
  let getServicesMatchingFromProfileSpy: SinonSpy;
  let getContractMatchingFromProfileSpy: SinonSpy;
  let getConfigurationsFromProfileSpy: SinonSpy;
  let addConfigurationsToProfileSpy: SinonSpy;
  let updateConfigurationsForProfileSpy: SinonSpy;
  let removeConfigurationsFromProfileSpy: SinonSpy;

  const app = express();
  app.use(express.json());
  app.use('/api', router);

  before(async function () {
    requestHandler = await RequestHandler.retrieveService();
    getPoliciesRecommendationFromProfileSpy = sinon.spy(
      requestHandler,
      'getPoliciesRecommendationFromProfile',
    );
    getServicesRecommendationFromProfileSpy = sinon.spy(
      requestHandler,
      'getServicesRecommendationFromProfile',
    );
    getPoliciesMatchingFromProfileSpy = sinon.spy(
      requestHandler,
      'getPoliciesMatchingFromProfile',
    );
    getServicesMatchingFromProfileSpy = sinon.spy(
      requestHandler,
      'getServicesMatchingFromProfile',
    );
    getContractMatchingFromProfileSpy = sinon.spy(
      requestHandler,
      'getContractMatchingFromProfile',
    );
    getConfigurationsFromProfileSpy = sinon.spy(
      requestHandler,
      'getConfigurationsFromProfile',
    );
    addConfigurationsToProfileSpy = sinon.spy(
      requestHandler,
      'addConfigurationsToProfile',
    );
    updateConfigurationsForProfileSpy = sinon.spy(
      requestHandler,
      'updateConfigurationsForProfile',
    );
    removeConfigurationsFromProfileSpy = sinon.spy(
      requestHandler,
      'removeConfigurationsFromProfile',
    );
  });

  after(function () {
    getPoliciesRecommendationFromProfileSpy.restore();
    getServicesRecommendationFromProfileSpy.restore();
    getPoliciesMatchingFromProfileSpy.restore();
    getServicesMatchingFromProfileSpy.restore();
    getContractMatchingFromProfileSpy.restore();
    getConfigurationsFromProfileSpy.restore();
    addConfigurationsToProfileSpy.restore();
    updateConfigurationsForProfileSpy.restore();
    removeConfigurationsFromProfileSpy.restore();
  });

  it('should get policies recommendations from profile', async function () {
    const profileId = '12345';
    const response = await request(app)
      .get(`/api/profile/${profileId}/policies-recommendations`)
      .expect(200);

    sinon.assert.calledOnce(getPoliciesRecommendationFromProfileSpy);
    sinon.assert.calledWith(getPoliciesRecommendationFromProfileSpy, profileId);
    expect(response.body).to.be.an('array');
  });

  it('should get services recommendations from profile', async function () {
    const profileId = '12345';
    const response = await request(app)
      .get(`/api/profile/${profileId}/services-recommendations`)
      .expect(200);
    sinon.assert.calledOnce(getServicesRecommendationFromProfileSpy);
    sinon.assert.calledWith(getServicesRecommendationFromProfileSpy, profileId);
    expect(response.body).to.be.an('array');
  });

  it('should get policies matching from profile', async function () {
    const profileId = '12345';
    const response = await request(app)
      .get(`/api/profile/${profileId}/policies-matching`)
      .expect(200);
    sinon.assert.calledOnce(getPoliciesMatchingFromProfileSpy);
    sinon.assert.calledWith(getPoliciesMatchingFromProfileSpy, profileId);
    expect(response.body).to.be.an('array');
  });

  it('should handle adding configurations to profile', async function () {
    const profileId = '12345';
    const configurations = [{ configId: 'config1' }];
    const response = await request(app)
      .post('/api/profile/configurations')
      .send({ profileId, configurations })
      .expect(201);
    sinon.assert.calledOnce(addConfigurationsToProfileSpy);
    sinon.assert.calledWith(
      addConfigurationsToProfileSpy,
      profileId,
      configurations,
    );
    expect(response.body).to.have.property('success', true);
  });

  it('should handle updating configurations for profile', async function () {
    const profileId = '12345';
    const configurations = [{ configId: 'config2' }];
    const response = await request(app)
      .put(`/api/profile/${profileId}/configurations`)
      .send({ configurations })
      .expect(200);
    sinon.assert.calledOnce(updateConfigurationsForProfileSpy);
    sinon.assert.calledWith(
      updateConfigurationsForProfileSpy,
      profileId,
      configurations,
    );
    expect(response.body).to.have.property('success', true);
  });

  it('should handle deleting configurations from profile', async function () {
    const profileId = '12345';
    const response = await request(app)
      .delete(`/api/profile/${profileId}/configurations`)
      .expect(200);
    sinon.assert.calledOnce(removeConfigurationsFromProfileSpy);
    sinon.assert.calledWith(removeConfigurationsFromProfileSpy, profileId);
    expect(response.body).to.have.property('success', true);
  });
});
