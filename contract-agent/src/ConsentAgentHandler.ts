import { ConsentAgent } from './ConsentAgent';
import {
  SearchCriteria,
  FilterOperator,
  ProfileConfigurations,
  ProfileDocument,
  ProfilePreference,
  PreferencePayload,
} from './types';
import { ObjectId } from 'mongodb';

// Orchestrator Request Handler
export class ConsentAgentRequestHandler {
  private consentAgent?: ConsentAgent;

  constructor() {

  }

  async prepare() {
    this.consentAgent = await ConsentAgent.retrieveService();
  }

  // Return only the policies from recommendations
  async getConsentRecommendationFromProfile(profileId: string): Promise<any> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };

    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const profile = await this.consentAgent.findProfile('profiles', criteria);
    if (!profile) {
      throw new Error('Profile not found');
    }
    return profile.recommendations;
  }

  // Return only the services from recommendations
  async getDataExchangeRecommendationFromProfile(profileId: string): Promise<any> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const profile = await this.consentAgent.findProfile('profiles', criteria);
    if (!profile) {
      throw new Error('Profile not found');
    }
    return profile.recommendations;
  }

  /**
   * Return the profile's authorization
   * @param profileURL - uri of the profile
   * @return Promise<ProfilePreference[]>
   */
  async getPreferencesFromProfile(profileURL: string): Promise<ProfilePreference[]> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURL,
        },
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const profile = await this.consentAgent.findProfile('profiles', criteria);
    if (!profile) throw new Error('Profile not found');

    return profile.preference;
  }

  /**
   * Return the profile's authorization
   * @param profileURL - uri of the profile
   * @param {PreferencePayload} data
   * @return Promise<ProfilePreference[]>
   */
  async addPreferenceToProfile(profileURL: string, data: PreferencePayload[]): Promise<ProfilePreference[]> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURL,
        },
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const profile = await this.consentAgent.findProfileAndPush('profiles', criteria, { preference: data });
    if (!profile) throw new Error('Profile not found');

    return profile.preference;
  }

  /**
   * Return the profile's authorization
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @return Promise<ProfilePreference[]>
   */
  async getPreferenceByIdFromProfile(profileURL: string, preferenceId: string): Promise<ProfilePreference[]> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURL,
        }
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const profile = await this.consentAgent.findProfile('profiles', criteria);
    if (!profile) throw new Error('Profile not found');

    return profile.preference.filter((element) => element._id?.toString() === preferenceId);
  }

  /**
   * Update the profile's preference
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @param {PreferencePayload} data - Data to update
   * @return Promise<ProfilePreference[]>
   */
  async updatePreferenceByIdFromProfile(profileURL: string, preferenceId: string, data: PreferencePayload): Promise<ProfilePreference[]> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURL,
        }
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const profile = await this.consentAgent.findProfile('profiles', criteria);
    if (!profile) throw new Error('Profile not found');

    const preferenceIndex = profile.preference.findIndex((element) => element._id?.toString() === preferenceId);
    profile.preference[preferenceIndex] = { ...profile.preference[preferenceIndex], ...data };

    delete profile._id;

    const profileUpdated = await this.consentAgent.findProfileAndUpdate('profiles', criteria, profile);
    if (!profileUpdated) throw new Error('Profile not found');
    return profileUpdated.preference.filter((element) => element._id?.toString() === preferenceId);
  }

  /**
   * Update the profile's preference
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @param {PreferencePayload} data - Data to update
   * @return Promise<ProfilePreference[]>
   */
  async deletePreferenceByIdFromProfile(profileURL: string, preferenceId: string): Promise<ProfilePreference[]> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURL,
        }
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const data = { 'preference': { '_id': new ObjectId(preferenceId) } }
    
    const profile = await this.consentAgent.findProfileAndPull('profiles', criteria, data);
    if (!profile) throw new Error('Profile not found');

    return profile.preference;
  }

  /**
   * Return the profile's authorization
   * @param profileURL - uri of the profile
   * @return Promise<ProfileConfigurations>
   */
  async getConfigurationsFromProfile(profileURL: string): Promise<ProfileConfigurations> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURL,
        },
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const profiles = await this.consentAgent.findProfiles('profiles', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles[0].configurations;
  }

  // Return the profile by uri
  async getProfileByURL(uri: string): Promise<any> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: uri,
        },
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }
    const profile = await this.consentAgent.findProfile('profiles', criteria);
    if (!profile) throw new Error('Profile not found');

    return profile;
  }

  // Return the authorization of the profile
  async getProfiles(): Promise<any> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [],
      threshold: 0,
    };

    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }

    const profiles = await this.consentAgent.findProfiles('profiles', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles;
  }

  // Return the authorization of the profile
  async updateProfile(profileURL: string, data: ProfileDocument): Promise<any> {
    await this.prepare();
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURL,
        },
      ],
      threshold: 0,
    };
    if (!this.consentAgent) {
      throw new Error('Consent Agent undefined');
    }

    const profile = await this.consentAgent.findProfileAndUpdate('profiles', criteria, data);
    if (!profile) throw new Error('Profile not found');

    return profile;
  }
}
