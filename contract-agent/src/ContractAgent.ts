import { Profile, ProfileJSON } from './Profile';
import {
  FilterCondition,
  FilterOperator,
  ProfileDocument,
  SearchCriteria,
  ContractAgentError,
  DataChangeEvent,
  CAECode,
} from './types';
import { Agent } from './Agent';
import { Contract } from './Contract';
import { Logger } from './Logger';
import { DataProvider, DataProviderType } from './DataProvider';
import { MongoDBProvider } from './MongoDBProvider';
import { MatchingService } from './MatchingService';
import { RecommendationService } from './RecommendationService';

/**
 * ContractAgent class handles contract-related operations and profile management
 * @extends Agent
 */
export class ContractAgent extends Agent {
  private static instance: ContractAgent | null = null;

  private constructor() {
    super();
  }

  /**
   * Prepares the ContractAgent instance by loading configuration and setting up providers
   * @throws {ContractAgentError} If preparation fails
   */
  async prepare(): Promise<void> {
    try {
      this.loadDefaultConfiguration();
      await this.addDefaultProviders();
      this.setupProviderEventHandlers();
    } catch (error) {
      const agentError: ContractAgentError = {
        name: 'PreparationError',
        message: `Failed to prepare ContractAgent: ${(error as Error).message}`,
        code: CAECode.PREPARATION_FAILED,
      };
      Logger.error(agentError.message);
      throw agentError;
    }
  }

  /**
   * Retrieves or creates a ContractAgent instance
   * @param dataProviderType - Type of data provider to use
   * @param refresh - Whether to force create a new instance
   * @returns Promise<ContractAgent>
   */
  static async retrieveService(
    dataProviderType: DataProviderType = MongoDBProvider,
    refresh: boolean = false,
  ): Promise<ContractAgent> {
    try {
      if (!ContractAgent.instance || refresh) {
        DataProvider.setChildType(dataProviderType);
        const instance = new ContractAgent();
        await instance.prepare();
        ContractAgent.instance = instance;
      }
      const dpChildType = DataProvider.getChildType();
      if (!dpChildType) {
        Logger.warn('Data Provider Type not set');
      }
      return ContractAgent.instance;
    } catch (error) {
      const serviceError: ContractAgentError = {
        name: 'ServiceRetrievalError',
        message: `Failed to retrieve ContractAgent service: ${(error as Error).message}`,
        code: CAECode.SERVICE_RETRIEVAL_FAILED,
      };
      Logger.error(serviceError.message);
      throw serviceError;
    }
  }

  /**
   * Enriches a profile with system recommendations
   * @throws {ContractAgentError} Method not implemented
   */
  protected enrichProfileWithSystemRecommendations(): Profile {
    throw new Error('Method not implemented.');
  }

  /**
   * Finds profiles across all configured providers
   * @param criteria - Search criteria
   * @returns Promise<Profile[]>
   */
  async findProfilesAcrossProviders(
    criteria: SearchCriteria,
  ): Promise<Profile[]> {
    const allProfiles: Profile[] = [];

    if (!this.config) {
      throw new Error('Configuration is not initialized');
    }

    Logger.info(
      `Searching across data sources: ${this.config.dataProviderConfig
        .map((config) => config.source)
        .join(', ')}`,
    );

    for (const dataProvider of this.dataProviders) {
      const { source } = dataProvider;
      if (!source) {
        throw new Error('Provider source is undefined');
      }

      const profiles = await this.findProfiles(source, criteria);
      allProfiles.push(...profiles);
    }

    return allProfiles;
  }

  /**
   * Updates profiles based on contract changes
   * @param contract - Contract instance
   * @returns Promise<void>
   */
  private async updateProfileFromContractChange(
    contract: Contract,
  ): Promise<void> {
    if (!contract) {
      throw new Error('Contract is undefined');
    }
    await this.updateProfilesForMembers(contract);
    await this.updateProfilesForServiceOfferings(contract);
    await this.updateProfileForOrchestrator(contract);
  }

  /**
   * Updates profiles for all contract members
   * @param contract - Contract instance
   */
  private async updateProfilesForMembers(contract: Contract): Promise<void> {
    for (const member of contract.members) {
      await this.updateProfile(member.participant, contract);
    }
  }

  /**
   * Updates profiles for all service offerings
   * @param contract - Contract instance
   */
  private async updateProfilesForServiceOfferings(
    contract: Contract,
  ): Promise<void> {
    for (const offering of contract.serviceOfferings) {
      await this.updateProfile(offering.participant, contract);
    }
  }

  /**
   * Updates profile for contract orchestrator
   * @param contract - Contract instance
   */
  private async updateProfileForOrchestrator(
    contract: Contract,
  ): Promise<void> {
    await this.updateProfile(contract.orchestrator, contract);
  }

  async createProfileForParticipant(participantId: string): Promise<Profile> {
    return super.createProfileForParticipant(participantId);
  }
  /**
   * Updates a single profile
   * @param participantId - Participant identifier
   * @param contract - Contract instance
   */
  private async updateProfile(
    participantId: string,
    contract: Contract,
  ): Promise<void> {
    try {
      const profileProvider = this.dataProviders.find(
        (dataProvider) => dataProvider.source === 'profiles',
      );

      if (!profileProvider) {
        throw new Error('Profile DataProvider not found');
      }

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
      if (!source) {
        throw new Error('Provider "source" is undefined');
      }

      const profiles = await this.findProfiles(source, criteria);
      const profile =
        profiles[0] ?? (await this.createProfileForParticipant(participantId));

      await this.updateRecommendationForProfile(profile, contract);
      await this.updateMatchingForProfile(profile, contract);
    } catch (error) {
      Logger.error(`Update profile failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Handles inserted data events
   * @param data - Data change event
   */
  protected async handleDataInserted(data: DataChangeEvent): Promise<void> {
    if (data.source === 'contracts' && data.fullDocument) {
      try {
        await this.updateProfileFromContractChange(
          data.fullDocument as Contract,
        );
        Logger.info(`Data inserted for source: ${data.source}`);
      } catch (error) {
        Logger.error(`Data insertion failed: ${(error as Error).message}`);
        throw error;
      }
    } else {
      Logger.info(`Unhandled data insertion for source: ${data.source}`);
    }
  }

  /**
   * Handles updated data events
   * @param data - Data change event
   */
  protected async handleDataUpdated(data: DataChangeEvent): Promise<void> {
    if (data.source === 'contracts' && data.updateDescription?.updatedFields) {
      await this.updateProfileFromContractChange(
        data.updateDescription.updatedFields as Contract,
      );
    } else {
      Logger.info(`Unhandled data update for source: ${data.source}`);
    }
  }

  /**
   * Handles deleted data events
   * @param data - Data change event
   */
  protected handleDataDeleted(data: DataChangeEvent): void {
    if (data.source === 'contracts') {
      Logger.info(`Removing contract: ${data.documentKey?._id}`);
    } else {
      Logger.info(`Unhandled data deletion for source: ${data.source}`);
    }
  }

  /**
   * Updates matching information for a profile
   * @param profile - Profile instance
   * @param data - Matching data
   */
  protected async updateMatchingForProfile(
    profile: Profile,
    data: unknown,
  ): Promise<void> {
    const matchingService = MatchingService.retrieveService();
    await matchingService.updateProfile(profile, data);
  }

  /**
   * Updates recommendations for a profile
   * @param profile - Profile instance
   * @param data - Recommendation data
   */
  protected async updateRecommendationForProfile(
    profile: Profile,
    data: unknown,
  ): Promise<void> {
    try {
      const recommendationService = RecommendationService.retrieveService();
      await recommendationService.updateProfile(profile, data);
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'url',
            operator: FilterOperator.EQUALS,
            value: profile.url,
          },
        ],
        threshold: 0,
      };
      const saved = await this.saveProfile('profiles', criteria, profile);

      if (!saved) {
        throw new Error(`Failed to save updated profile: ${profile.url}`);
      }
      Logger.info(
        `Recommendations updated and profile saved for: ${profile.url}`,
      );
    } catch (error) {
      Logger.error(
        `Error updating recommendations for profile: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
