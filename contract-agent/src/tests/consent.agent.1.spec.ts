import { expect } from 'chai';
import { Agent } from '../Agent';
import { MongoMemoryReplSet  } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { ConsentAgent } from '../ConsentAgent';
import { SearchCriteria, FilterOperator } from '../types';
import { ObjectId } from 'mongodb';
import { ChangeStreamDataProvider } from '../ChangeStreamDataProvider';

describe('Consent Agent Tests', function () {
  let consentAgent: ConsentAgent;
  let mongoServer: MongoMemoryReplSet;
  const participantId = new ObjectId().toString();
  let mongoUri: string;

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
    consentAgent = await ConsentAgent.retrieveService();
  });

  after(async function () {
    // Disconnect from the database using the static method
    await ChangeStreamDataProvider.disconnectFromDatabase(mongoUri, 'consent-manager');

    const configFilePath = path.join(__dirname, './mocks/consent-agent.config.json');
    const configContent = fs.readFileSync(configFilePath, 'utf8');
    const config = JSON.parse(configContent);

    config.dataProviderConfig.forEach((configItem: { url: string}) => {
      configItem.url = 'test';
    });

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  });

  describe('Profile Management', () => {
    it('should create a profile for a participant', async function () {
      const profile = await consentAgent.createProfileForParticipant(participantId, true);
      
      expect(profile).to.have.property('uri').equal(participantId);
      expect(profile).to.have.nested.property('configurations.allowRecommendations').equal(true);
      expect(profile).to.have.property('recommendations');
      expect(profile.recommendations).to.have.property('consents').that.is.an('array');
      expect(profile.recommendations).to.have.property('dataExchanges').that.is.an('array');
    });

    it('should find all profiles', async function () {
      const criteria: SearchCriteria = {
        conditions: [
        ],
        threshold: 0,
      };
      const profiles = await consentAgent.findProfiles('profiles', criteria);
      expect(profiles).to.be.an('array');
    });

    it('should find profile with criteria', async function () {
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: participantId
          }
        ],
        threshold: 0
      };

      const profile = await consentAgent.findProfile('profiles', criteria);
      expect(profile).to.be.an('object');
      expect(profile).to.have.property('uri');
    });

    it('should find profile and update', async function () {
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: participantId
          }
        ],
        threshold: 0
      };

      const profile = await consentAgent.findProfileAndUpdate('profiles', criteria, {
        configurations: {
          allowRecommendations: false
        }
      });
      expect(profile).to.be.an('object');
      expect(profile).to.have.property('uri');
      expect(profile).to.have.property('configurations');
      expect(profile.configurations).to.have.property('allowRecommendations', false);
    });

    it('should find profile and push', async function () {
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: participantId
          }
        ],
        threshold: 0
      };

      const profile = await consentAgent.findProfileAndPush('profiles', criteria, {
        preference: [
          {
            participant: 'test'
          }
        ]
      });
      expect(profile).to.be.an('object');
      expect(profile).to.have.property('uri');
      expect(profile).to.have.property('preference');
      expect(profile.preference[0]).to.have.property('participant', 'test');
    });

    it('should find profile and pull', async function () {
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: participantId
          }
        ],
        threshold: 0
      };

      const profile = await consentAgent.findProfileAndPull('profiles', criteria, { 'recommendations.consents': { '_id': 'test' } });
      expect(profile).to.be.an('object');
    });

    it('should delete a profile for a participant', async function () {
      // Then delete it
      const deletedProfile = await consentAgent.deleteProfileForParticipant(participantId);
      
      expect(deletedProfile).to.have.property('uri').equal(participantId);
      
      // Verify it's actually deleted by trying to find it
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: participantId
          }
        ],
        threshold: 0
      };
      
      const profiles = await consentAgent.findProfiles('profiles', criteria);
      expect(profiles).to.have.lengthOf(0);
    });
  });
});
