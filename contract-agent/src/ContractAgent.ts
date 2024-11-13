import { Profile } from './Profile';
import { DataProvider } from './DataProvider';
import { FilterOperator, ProfilePolicy, SearchCriteria } from './types';
import { UserExperience } from './Agent';
import { Contract } from './Contract';
import { Logger } from 'Logger';

export class ContractAgent extends UserExperience {
  private static instance: ContractAgent;

  private constructor() {
    super();
    this.loadDefaultConfiguration();
    this.addDefaultProviders();
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

  async findProfilesAcrossProviders(
    criteria: SearchCriteria,
  ): Promise<Profile[]> {
    const allProfiles: Profile[] = [];
    if (this.config) {
      Logger.info(
        `Using data sources: ${JSON.stringify(this.config.dataSources, null, 2)}`,
      );
    }
    for (const provider of this.dataProviders) {
      const profiles = await provider.findSimilarProfiles(criteria);
      allProfiles.push(...profiles);
    }
    return allProfiles;
  }
}
