import { Profile } from 'Profile';
import { DataProvider } from './DataProvider';
import { FilterOperator, ProfilePolicy, SearchCriteria } from 'types';
import { UserExperience } from './UserExperience';
import { Contract } from './Contract';

export class ContractAgent extends UserExperience {
  private static instance: ContractAgent;
  private static dataProvider: DataProvider | null;

  private constructor() {
    if (ContractAgent.dataProvider === null) {
      throw new Error('Data Provider not set for ContractAgent');
    }
    super(ContractAgent.dataProvider);
  }

  protected buildSearchCriteria(contract: Contract): SearchCriteria {
    const dataCategories = contract.serviceOfferings
      .map((offering: { policies: any[] }) => {
        return offering.policies.map((policy) => policy.description);
      })
      .flat();

    const services = contract.serviceOfferings.map(
      (offering: { serviceOffering: any }) => offering.serviceOffering,
    );

    return {
      conditions: [
        {
          field: 'dataCategories',
          operator: FilterOperator.IN,
          value: dataCategories,
        },
        {
          field: 'services',
          operator: FilterOperator.IN,
          value: services,
        },
        {
          field: 'members',
          operator: FilterOperator.CONTAINS,
          value: contract.members.map(
            (member: { participant: any }) => member.participant,
          ),
        },
        {
          field: 'configurations.allowRecommendation',
          operator: FilterOperator.EQUALS,
          value: true,
        },
      ],
      threshold: 0.7,
      limit: 100,
    };
  }

  static setDataProvider(dataProvider: DataProvider) {
    ContractAgent.dataProvider = dataProvider;
  }
  static retrieveService(refresh: boolean = false): ContractAgent {
    if (!ContractAgent.instance || refresh) {
      const instance = new ContractAgent();
      ContractAgent.instance = instance;
    }
    return ContractAgent.instance;
  }

  protected compareEntities(sourceEntity: any, targetEntity: any): number {
    throw new Error('Method not implemented.');
  }
  protected extractRelevantPolicies(entity: any): ProfilePolicy[] {
    throw new Error('Method not implemented.');
  }
  protected calculateSimilarity(source: any, target: Profile): number {
    throw new Error('Method not implemented.');
  }
  process(sourceEntity: any, options?: any): Promise<Profile[]> {
    throw new Error('Method not implemented.');
  }
}
