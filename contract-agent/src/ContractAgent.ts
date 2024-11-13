import { Profile } from './Profile';
import { DataProvider } from './DataProvider';
import { FilterOperator, ProfilePolicy, SearchCriteria } from './types';
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

  private updateProfileFromContractChange(contract: Contract): void {
    contract.members.forEach((member) => {
      this.updateProfile(member.participant, contract);
    });
    /*
    contract.revokedMembers.forEach((member) => {
      this.updateProfile(member.participant, contract);
    });
    */
    contract.serviceOfferings.forEach((offering) => {
      this.updateProfile(offering.participant, contract);
    });
    // not sure
    this.updateProfile(contract.orchestrator, contract);
  }

  private updateProfile(participantId: string, contract: Contract): void {
    // todo:
  }

  protected handleDataInserted(data: {
    fullDocument: any;
    source: string;
  }): void {
    switch (data.source) {
      case 'contract':
        this.updateProfileFromContractChange(data.fullDocument as Contract);
        break;
      default:
        Logger.info(`Unhandled data insertion for source: ${data.source}`);
    }
  }

  protected handleDataUpdated(data: {
    documentKey: any;
    updateDescription: any;
    source: string;
  }): void {
    switch (data.source) {
      case 'contract':
        this.updateProfileFromContractChange(
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
}
