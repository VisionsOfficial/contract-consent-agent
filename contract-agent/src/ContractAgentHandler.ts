import { Profile } from './Profile';
import { Agent } from './Agent';
import { ContractAgent } from './ContractAgent';
import { SearchCriteria, FilterOperator } from './types';
import { Logger } from './Logger';

export class RequestHandler {
  private static instance: RequestHandler | null = null;
  private contractAgent?: ContractAgent;
  private profilesHost: string = '';
  private constructor() {}

  static async retrieveService(): Promise<RequestHandler> {
    if (!RequestHandler.instance) {
      const instance = new RequestHandler();
      await instance.prepare();
      RequestHandler.instance = instance;
    }
    return RequestHandler.instance;
  }

  private async prepare() {
    this.contractAgent = await ContractAgent.retrieveService();
    this.profilesHost = Agent.getProfileHost();
    if (!this.profilesHost) {
      throw new Error('Contract Request Handler: Profiles Host not set');
    }
  }

  async getContractAgent(): Promise<ContractAgent> {
    return ContractAgent.retrieveService();
  }

  // Return only the policies from recommendations
  async getPoliciesRecommendationFromProfile(profileURI: string): Promise<any> {
    try {
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: profileURI,
          },
        ],
        threshold: 0,
      };
      if (!this.contractAgent) {
        throw new Error('Contract Agent undefined');
      }
      const profiles = await this.contractAgent.findProfiles(
        this.profilesHost,
        criteria,
      );
      if (profiles.length === 0) {
        throw new Error(`Profile not found, profileURI: ${profileURI}`);
      }
      return profiles[0].recommendations.map((rec) => rec.policies);
    } catch (error) {
      Logger.error((error as Error).message);
    }
  }

  // Return only the services from recommendations
  async getServicesRecommendationFromProfile(profileId: string): Promise<any> {
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
    if (!this.contractAgent) {
      throw new Error('Contract Agent undefined');
    }
    const profiles = await this.contractAgent.findProfiles(
      this.profilesHost,
      criteria,
    );
    if (profiles.length === 0) {
      throw new Error('Profile not found');
    }
    return profiles[0].recommendations.map((rec) => rec.services);
  }

  // Return only the policies from matching
  async getPoliciesMatchingFromProfile(profileId: string): Promise<any> {
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

    if (!this.contractAgent) {
      throw new Error('Contract Agent undefined');
    }
    const profiles = await this.contractAgent.findProfiles(
      this.profilesHost,
      criteria,
    );
    if (profiles.length === 0) {
      throw new Error('Profile not found');
    }
    return profiles[0].matching.map((match) => match.policies);
  }

  // Return only the services from matching
  async getServicesMatchingFromProfile(profileId: string): Promise<any> {
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
    if (!this.contractAgent) {
      throw new Error('Contract Agent undefined');
    }
    const profiles = await this.contractAgent.findProfiles(
      this.profilesHost,
      criteria,
    );
    if (profiles.length === 0) {
      throw new Error('Profile not found');
    }
    return profiles[0].matching.map((match) => match.services);
  }

  // Return only the ecosystemContracts from matching
  async getContractMatchingFromProfile(profileId: string): Promise<any> {
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

    if (!this.contractAgent) {
      throw new Error('Contract Agent undefined');
    }
    const profiles = await this.contractAgent.findProfiles(
      this.profilesHost,
      criteria,
    );
    if (profiles.length === 0) {
      throw new Error('Profile not found');
    }
    return profiles[0].matching.map((match) => match.ecosystemContracts);
  }

  // configurations

  async getConfigurationsFromProfile(profileURI: string): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURI,
        },
      ],
      threshold: 0,
    };
    if (!this.contractAgent) {
      throw new Error('Contract Agent undefined');
    }
    const profiles = await this.contractAgent.findProfiles(
      this.profilesHost,
      criteria,
    );
    if (profiles.length === 0) {
      throw new Error('Profile not found');
    }
    return profiles[0].configurations;
  }

  async addConfigurationsToProfile(
    profileURI: string,
    configurations: any,
  ): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'uri',
          operator: FilterOperator.EQUALS,
          value: profileURI,
        },
      ],
      threshold: 0,
    };
    if (!this.contractAgent) {
      throw new Error('Contract Agent undefined');
    }
    const profiles = await this.contractAgent.findProfiles(
      this.profilesHost,
      criteria,
    );
    if (profiles.length === 0) {
      throw new Error('Profile not found');
    }
    const profile = profiles[0];
    profile.configurations = { ...profile.configurations, ...configurations };
    await this.contractAgent.saveProfile(this.profilesHost, criteria, profile);
    return { message: 'Configurations added successfully', profile };
  }

  async updateConfigurationsForProfile(
    profileId: string,
    configurations: any,
  ): Promise<any> {
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
    if (!this.contractAgent) {
      throw new Error('Contract Agent undefined');
    }
    const profiles = await this.contractAgent.findProfiles(
      this.profilesHost,
      criteria,
    );
    if (profiles.length === 0) {
      throw new Error('Profile not found');
    }
    const profile = profiles[0];
    profile.configurations = configurations;
    await this.contractAgent.saveProfile(this.profilesHost, criteria, profile);
    return { message: 'Configurations updated successfully', profile };
  }

  async removeConfigurationsFromProfile(profileId: string): Promise<any> {
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
    if (!this.contractAgent) {
      throw new Error('Contract Agent undefined');
    }
    const profiles = await this.contractAgent.findProfiles(
      this.profilesHost,
      criteria,
    );
    if (profiles.length === 0) {
      throw new Error('Profile not found');
    }
    const profile: Profile = profiles[0];
    profile.configurations = {
      allowRecommendations: false,
      allowPolicies: false,
    };
    await this.contractAgent.saveProfile(this.profilesHost, criteria, profile);
    return { message: 'Configurations removed successfully', profile };
  }
}
