import { Profile } from './Profile';
import { DataProvider } from './DataProvider';
import { FilterOperator, ProfilePolicy, SearchCriteria } from './types';
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

  static retrieveService(refresh: boolean = false): ContractAgent {
    if (!ContractAgent.instance || refresh) {
      const instance = new ContractAgent();
      ContractAgent.instance = instance;
    }
    return ContractAgent.instance;
  }

  protected buildSearchCriteria(contract: Contract): SearchCriteria {
    const policies = contract.serviceOfferings
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
          field: 'recommendations.policies.policy',
          operator: FilterOperator.REGEX,
          value: policies,
        } /*
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
        },*/,
      ],
      threshold: 0.7,
      limit: 100,
    };
  }

  static setDataProvider(dataProvider: DataProvider) {
    ContractAgent.dataProvider = dataProvider;
  }

  async findSimilarProfiles(
    sourceEntity: any,
    threshold: number = 0.7,
  ): Promise<Profile[]> {
    return super.findSimilarProfiles(sourceEntity, threshold);
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
