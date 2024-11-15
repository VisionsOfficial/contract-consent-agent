import { Profile } from './Profile';
import { DataProvider } from './DataProvider';
import {
  FilterCondition,
  FilterOperator,
  ProfilePolicy,
  SearchCriteria,
} from './types';
import { Agent } from './Agent';
import { Contract } from './Contract';
import { Logger } from 'Logger';

export class ContractAgent extends Agent {
  private static instance: ContractAgent;

  private constructor() {
    super();
    this.loadDefaultConfiguration();
    this.addDefaultProviders();
    this.setupProviderEventHandlers();
  }

  static retrieveService(refresh: boolean = false): ContractAgent {
    if (!ContractAgent.instance || refresh) {
      const instance = new ContractAgent();
      ContractAgent.instance = instance;
    }
    return ContractAgent.instance;
  }

  protected enrichProfileWithSystemRecommendations(): Profile {
    throw new Error('Method not implemented.');
  }

  protected buildSearchCriteria(contract: Contract): SearchCriteria {
    const policies = contract.serviceOfferings
      .map((offering: { policies: any[] }) => {
        return offering.policies.map((policy) => policy.description);
      })
      .flat();

    return {
      conditions: [
        {
          field: 'recommendations.policies.policy',
          operator: FilterOperator.REGEX,
          value: policies,
        },
      ],
      threshold: 0.7,
      limit: 100,
    };
  }

  async findProfiles(
    source: string,
    criteria: SearchCriteria,
  ): Promise<Profile[]> {
    interface ProfileDocument {
      url: string;
      configurations: any;
      recommendations?: any[];
      matching?: any[];
    }
    const dataProvider = this.getDataProvider(source);
    const results: ProfileDocument[] = await dataProvider.find(criteria);
    return results.map(
      (result) =>
        new Profile(
          result.url,
          result.configurations,
          result.recommendations || [],
          result.matching || [],
        ),
    );
  }

  async findProfilesAcrossProviders(
    criteria: SearchCriteria,
  ): Promise<Profile[]> {
    const allProfiles: Profile[] = [];
    if (this.config) {
      Logger.info(
        `Using data sources: ${JSON.stringify(this.config.dataSources, null, 2)}`,
      );
    }
    for (const dataProvider of this.dataProviders) {
      const { source } = dataProvider;
      if (source) {
        const profiles = await this.findProfiles(source, criteria);
        allProfiles.push(...profiles);
      } else {
        throw new Error('Provider "source" is undefined');
      }
    }
    return allProfiles;
  }

  private async updateProfileFromContractChange(
    contract: Contract,
  ): Promise<void> {
    for (const member of contract.members) {
      await this.updateProfile(member.participant, contract);
    }
    for (const offering of contract.serviceOfferings) {
      await this.updateProfile(offering.participant, contract);
    }
    await this.updateProfile(contract.orchestrator, contract);
  }

  private async updateProfile(
    participantId: string,
    contract: Contract,
  ): Promise<void> {
    const profileProvider = this.dataProviders.find(
      (dataProvider) => dataProvider.source === 'Profile',
    );
    if (profileProvider) {
      const conditions: FilterCondition = {
        field: 'url',
        operator: FilterOperator.EQUALS,
        value: participantId,
      };
      const criteria: SearchCriteria = {
        conditions: [conditions],
        threshold: 0,
      };
      const source = profileProvider.source;
      if (source) {
        const profiles = await this.findProfiles(source, criteria);
        const profile = profiles[0];
        this.updateMatchingForProfile(profile, contract);
        this.updateRecommendationForProfile(profile, contract);
      } else {
        throw new Error('Provider "source" is undefined');
      }
    } else {
      throw new Error('Profile DataProvider not found');
    }
  }

  protected async handleDataInserted(data: {
    fullDocument: any;
    source: string;
  }): Promise<void> {
    switch (data.source) {
      case 'contract':
        await this.updateProfileFromContractChange(
          data.fullDocument as Contract,
        );
        break;
      default:
        Logger.info(`Unhandled data insertion for source: ${data.source}`);
    }
  }

  protected async handleDataUpdated(data: {
    documentKey: any;
    updateDescription: any;
    source: string;
  }): Promise<void> {
    switch (data.source) {
      case 'contract':
        await this.updateProfileFromContractChange(
          data.updateDescription.updatedFields as Contract,
        );
        break;
      default:
        Logger.info(`Unhandled data update for source: ${data.source}`);
    }
  }

  protected handleDataDeleted(data: {
    documentKey: any;
    source: string;
  }): void {
    switch (data.source) {
      case 'contract':
        Logger.info(`Contract deleted: ${data.documentKey}`);
        break;
      default:
        Logger.info(`Unhandled data deletion for source: ${data.source}`);
    }
  }

  protected updateMatchingForProfile(profile: Profile, data: unknown): void {
    const contract: Contract = data as Contract;

    const otherParticipantsServices = contract.serviceOfferings.filter(
      (service) => service.participant !== profile.url,
    );

    if (!otherParticipantsServices.length) return;

    const newMatching = {
      policies: otherParticipantsServices.flatMap((service) =>
        service.policies.map((policy) => ({
          policy: policy.description,
          frequency: 1,
        })),
      ),
      ecosystemContracts: [contract._id],
      services: [],
    };

    const existingMatchingIndex = profile.matching.findIndex((m) =>
      m.ecosystemContracts.includes(contract._id),
    );

    if (existingMatchingIndex !== -1) {
      profile.matching[existingMatchingIndex] = newMatching;
    } else {
      profile.matching.push(newMatching);
    }
  }

  protected updateRecommendationForProfile(
    profile: Profile,
    data: unknown,
  ): void {
    const contract: Contract = data as Contract;

    const allPolicies = new Set<string>();
    contract.serviceOfferings.forEach((service) => {
      service.policies.forEach((policy) => {
        allPolicies.add(policy.description);
      });
    });

    const newRecommendation = {
      policies: Array.from(allPolicies).map((policy) => ({
        policy: policy,
        frequency: 1,
      })),
      ecosystemContracts: [contract._id],
      services: [],
    };

    const existingRecommendationIndex = profile.recommendations.findIndex((r) =>
      r.ecosystemContracts.includes(contract._id),
    );

    if (existingRecommendationIndex !== -1) {
      newRecommendation.policies.forEach((newPolicy) => {
        const existingPolicyIndex = profile.recommendations[
          existingRecommendationIndex
        ].policies.findIndex((p) => p.policy === newPolicy.policy);

        if (existingPolicyIndex !== -1) {
          newPolicy.frequency =
            profile.recommendations[existingRecommendationIndex].policies[
              existingPolicyIndex
            ].frequency + 1;
        }
      });

      profile.recommendations[existingRecommendationIndex] = newRecommendation;
    } else {
      profile.recommendations.push(newRecommendation);
    }
  }
}
