import { Profile } from './Profile';
import { DataProvider } from './DataProvider';
import { FilterOperator, ProfilePolicy, SearchCriteria } from './types';
import { UserExperience } from './UserExperience';
import { Contract } from './Contract';

export class ContractAgent extends UserExperience {
  private constructor() {
    super();
  }

  private static instance: ContractAgent;

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
    for (const provider of this.dataProviders) {
      const profiles = await provider.findSimilarProfiles(criteria);
      allProfiles.push(...profiles);
    }
    return allProfiles;
  }
}
