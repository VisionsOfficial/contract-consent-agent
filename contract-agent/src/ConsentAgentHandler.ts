import { ConsentAgent } from './ConsentAgent';
import {
  SearchCriteria,
  FilterOperator,
  ProfileConfigurations,
  ProfileDocument,
  ProfilePreference,
  PreferencePayload,
  Condition,
  AuthorizationLevelEnum,
  ConsentProfileRecommendation,
} from './types';
import {  ObjectId } from 'mongodb';

// Request Handler
export class ConsentAgentRequestHandler {
  private consentAgent?: ConsentAgent;

  private static instance: ConsentAgentRequestHandler | null = null;
  private contractAgent?: ConsentAgent;
  private profilesHost: string = '';
  private constructor() {}

  static async retrieveService(): Promise<ConsentAgentRequestHandler> {
    if (!ConsentAgentRequestHandler.instance) {
      const instance = new ConsentAgentRequestHandler();
      await instance.prepare();
      ConsentAgentRequestHandler.instance = instance;
    }
    return ConsentAgentRequestHandler.instance;
  }

  async prepare() {
    this.consentAgent = await ConsentAgent.retrieveService();
  }

  async getConsentAgent(): Promise<ConsentAgent> {
    return ConsentAgent.retrieveService();
  }

  /**
   * Returns only the policies from the recommendations.
   * 
   * @param profileId - The ID of the profile to retrieve recommendations for.
   * @returns {Promise<any>} - A promise that resolves to the policies from the recommendations.
   */
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
    return (profile.recommendations as ConsentProfileRecommendation).consents;
  }

  /**
   * Returns only the services from the recommendations.
   * 
   * @param profileId - The ID of the profile to retrieve recommendations for.
   * @returns {Promise<any>} - A promise that resolves to the services from the recommendations.
   */
  async getDataExchangeRecommendationFromProfile(
    profileId: string,
  ): Promise<any> {
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
    return (profile.recommendations as ConsentProfileRecommendation).dataExchanges;
  }

  /**
   * Return the profile's authorization
   * @param profileURL - uri of the profile
   * @return Promise<ProfilePreference[]>
   */
  async getPreferencesFromProfile(
    profileURL: string,
  ): Promise<ProfilePreference[]> {
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
  async addPreferenceToProfile(
    profileURL: string,
    data: PreferencePayload[],
  ): Promise<ProfilePreference[]> {
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
    const profile = await this.consentAgent.findProfileAndPush(
      'profiles',
      criteria,
      { preference: data },
    );
    if (!profile) throw new Error('Profile not found');

    return profile.preference;
  }

  /**
   * Return the profile's authorization
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @return Promise<ProfilePreference[]>
   */
  async getPreferenceByIdFromProfile(
    profileURL: string,
    preferenceId: string,
  ): Promise<ProfilePreference[]> {
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

    return profile.preference.filter(
      (element) => element._id?.toString() === preferenceId,
    );
  }

  /**
   * Update the profile's preference
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @param {PreferencePayload} data - Data to update
   * @return Promise<ProfilePreference[]>
   */
  async updatePreferenceByIdFromProfile(
    profileURL: string,
    preferenceId: string,
    data: PreferencePayload,
  ): Promise<ProfilePreference[]> {
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

    const preferenceIndex = profile.preference.findIndex(
      (element) => element._id?.toString() === preferenceId,
    );

    if(data.asDataProvider){
      profile.preference[preferenceIndex].asDataProvider = {
        ...profile.preference[preferenceIndex].asDataProvider,
        ...data.asDataProvider,
      };
    }

    if(data.asServiceProvider){
      profile.preference[preferenceIndex].asServiceProvider = {
        ...profile.preference[preferenceIndex].asServiceProvider,
        ...data.asServiceProvider,
      };
    }

    if(data.participant){
      profile.preference[preferenceIndex].participant = data.participant
    }

    if(data.category){
      profile.preference[preferenceIndex].participant = data.category
    }

    delete profile._id;

    const profileUpdated = await this.consentAgent.findProfileAndUpdate(
      'profiles',
      criteria,
      profile,
    );
    if (!profileUpdated) throw new Error('Profile not found');
    return profileUpdated.preference.filter(
      (element) => element._id?.toString() === preferenceId,
    );
  }

  /**
   * Update the profile's preference
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @param {PreferencePayload} data - Data to update
   * @return Promise<ProfilePreference[]>
   */
  async deletePreferenceByIdFromProfile(
    profileURL: string,
    preferenceId: string,
  ): Promise<ProfilePreference[]> {
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
    const data = { preference: { _id: new ObjectId(preferenceId) } };

    const profile = await this.consentAgent.findProfileAndPull(
      'profiles',
      criteria,
      data,
    );
    if (!profile) throw new Error('Profile not found');

    return profile.preference;
  }

  /**
   * Return the profile's authorization
   * @param profileURL - uri of the profile
   * @return Promise<ProfileConfigurations>
   */
  async getConfigurationsFromProfile(
    profileURL: string,
  ): Promise<ProfileConfigurations> {
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

    const profile = await this.consentAgent.findProfileAndUpdate(
      'profiles',
      criteria,
      data,
    );
    if (!profile) throw new Error('Profile not found');

    return profile;
  }

  /**
   * Checks if the given parameters match the preferences of a profile.
   * 
   * @param {string} profileId - The ID of the profile to check preferences for.
   * @param {string} category - The category to match preferences against.
   * @param {string} participant - The participant to match preferences against.
   * @param {string} location - The location to match preferences against.
   * @param {boolean} asDataProvider - Indicates if the check is for a data provider role.
   * @param {boolean} asServiceProvider - Indicates if the check is for a service provider role.
   * 
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the preferences match.
   */
  async checkPreferenceMatch(params: {
    profileId: string;
    category?: string;
    participant?: string;
    location?: string;
    asDataProvider?: boolean;
    asServiceProvider?: boolean;
  }): Promise<boolean> {
    const {
      profileId,
      category,
      participant,
      location,
      asDataProvider,
      asServiceProvider,
    } = params;

    if (category && participant) {
      throw new Error(
        'Cannot use both category and participant simultaneously.',
      );
    }

    if (!category && !participant) {
      throw new Error('At least one of category or participant must be true.');
    }

    if (asDataProvider && asServiceProvider) {
      throw new Error(
        'Cannot use both asDataProvider and asServiceProvider simultaneously.',
      );
    }

    if (!asDataProvider && !asServiceProvider) {
      throw new Error(
        'At least one of asDataProvider or asServiceProvider must be true.',
      );
    }

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

    if (participant) {
      criteria.conditions.push({
        field: 'preference.participant',
        operator: FilterOperator.EQUALS,
        value: participant,
      });
    }

    if (category) {
      criteria.conditions.push({
        field: 'preference.category',
        operator: FilterOperator.EQUALS,
        value: category,
      });
    }

    const profile = await this.consentAgent.findProfile('profiles', criteria);
    if (!profile._id) return false;

    let preference: ProfilePreference | undefined;
    if (participant) {
      preference = profile.preference.find(
        (pref: any) => pref.participant === participant,
      );
    }

    if (category) {
      preference = profile.preference.find(
        (pref: any) => pref.category === category,
      );
    }

    if (preference) {
      const currentDay = new Date().getDay().toString();
      let isMatch = false;

      if(asDataProvider && preference.asDataProvider){
        isMatch = this.checkAuthorizationMatch(preference.asDataProvider, currentDay, location);
      } else if(asServiceProvider && preference.asServiceProvider){
        isMatch = this.checkAuthorizationMatch(preference.asServiceProvider, currentDay, location);
      }

      return isMatch;
    }

    return true;
  }

  /**
   * This function checks if the authorization matches the current day and location.
   * 
   * @param authorization - The authorization object to check.
   * @param currentDay - The current day of the week.
   * @param location - The current location.
   * @returns {boolean} - True if the authorization matches, false otherwise.
   */
  private checkAuthorizationMatch(authorization: {
    authorizationLevel?: AuthorizationLevelEnum,
    conditions?: Condition[]
  }, currentDay: string, location: string | undefined): boolean {
    if (
      authorization.authorizationLevel === 'never'
    ) {
      return false; // Always false for "never" authorization
    } else if (
      authorization.authorizationLevel === 'always'
    ) {
      return true; // Always true for "always" authorization
    } else if (authorization.authorizationLevel === 'conditional') {
      // Check conditions for "conditional" authorization
      if (authorization.conditions) {
        return authorization.conditions.some((condition) => {
          if (
            condition.time &&
            condition.time.dayOfWeek &&
            condition.time.dayOfWeek.includes(currentDay)
          ) {
            const startTime = new Date(condition.time.startTime || '');
            const endTime = new Date(condition.time.endTime || '');
            const currentTime = new Date();
            return currentTime >= startTime && currentTime <= endTime;
          }

          if (
            condition.location &&
            condition.location.countryCode === location
          ) {
            return true;
          }
          return false;
        });
      }
    }
    return false;
  }
}
