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
import { randomUUID } from 'crypto';
import { setTimeout } from 'timers';

interface WaitFunction {
  (_ms: number): Promise<void>;
}

export const wait: WaitFunction = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * ContractAgent class handles contract-related operations and profile management
 * @extends Agent
 */
export class ContractAgent extends Agent {
  private static instance: ContractAgent | null = null;
  public _uid: string;

  private constructor() {
    super();
    this._uid = randomUUID();
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
   * Enriches a profile with system recommendations
   * @throws {ContractAgentError} Method not implemented
   */
  protected existingDataCheck(): Promise<void> {
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
    Logger.info('updating profiles for members...');
    await this.updateProfilesForMembers(contract);
    Logger.info('updating profiles for offerings...');
    await this.updateProfilesForServiceOfferings(contract);
    Logger.info('updating profiles for orchestrator...');
    await this.updateProfileForOrchestrator(contract);
    this.signalUpdate();
  }

  signalUpdate(): void {}

  /**
   * Updates profiles for all contract members
   * @param contract - Contract instance
   */
  private async updateProfilesForMembers(contract: Contract): Promise<void> {
    for (const member of contract.members) {
      if (member?.participant?.length) {
        await this.updateProfile(member.participant, contract);
      }
    }
    if (!contract?.members?.length) {
      Logger.warn('no members found, 0 profile updated');
    } else {
      Logger.info(`${contract.members.length} profiles found for members`);
    }
  }

  /**
   * Updates profiles for all service offerings
   * @param contract - Contract instance
   */
  private async updateProfilesForServiceOfferings(
    contract: Contract,
  ): Promise<void> {
    const uniqueParticipants = new Set<string>();
    for (const offering of contract.serviceOfferings || []) {
      if (offering?.participant?.length) {
        uniqueParticipants.add(offering.participant);
        await this.updateProfile(offering.participant, contract);
      }
    }
    const offeringsCount = contract.serviceOfferings?.length || 0;
    if (!offeringsCount) {
      Logger.warn('no service offerings found, 0 profile updated');
    } else {
      Logger.info(
        `${offeringsCount} service offerings with ${uniqueParticipants.size} unique participants processed`,
      );
    }
  }
  /**
   * Updates profile for contract orchestrator
   * @param contract - Contract instance
   */
  private async updateProfileForOrchestrator(
    contract: Contract,
  ): Promise<void> {
    if (contract?.orchestrator?.length) {
      await this.updateProfile(contract.orchestrator, contract);
      Logger.info('Profile updated for orchestrator');
    } else {
      Logger.warn('no orchestrator found, 0 profile updated');
    }
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
        field: 'uri',
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
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: profile.uri,
          },
        ],
        threshold: 0,
      };
      const saved = await this.saveProfile('profiles', criteria, profile);

      if (!saved) {
        throw new Error(`Failed to save updated profile: ${profile.uri}`);
      }
      Logger.info(
        `Recommendations updated and profile saved for: ${profile.uri}`,
      );
    } catch (error) {
      Logger.error(
        `Error updating recommendations for profile: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Finds profiles based on given criteria from a specific source
   * @param source - Data source identifier
   * @param criteria - Search criteria
   * @returns Promise<Profile[]>
   */
  async findProfiles(
    source: string,
    criteria: SearchCriteria,
  ): Promise<Profile[]> {
    try {
      const dataProvider = this.getDataProvider(source);
      if (!dataProvider) {
        throw new Error(`Data provider not found for source: ${source}`);
      }
      const results: ProfileDocument[] = await dataProvider.find(criteria);
      return results.map((result) => {
        const profileData: ProfileJSON = {
          _id: result._id,
          uri: result.uri,
          configurations: result.configurations,
          recommendations: result.recommendations || [],
          matching: result.matching || [],
          preference: result.preference || [],
        };
        return new Profile(profileData);
      });
    } catch (error) {
      const searchError: ContractAgentError = {
        name: 'ProfileSearchError',
        message: `Failed to find profiles: ${(error as Error).message}`,
        code: CAECode.PROFILE_SEARCH_FAILED,
        context: { source, criteria },
      };
      Logger.error(searchError.message);
      throw searchError;
    }
  }

  /**
   * Saves a profile to a specified data source
   * @param source - Data source identifier
   * @param criteria - Search criteria used to find the profile to update
   * @param profile - Profile to be saved
   * @returns Promise<boolean> - Indicates successful save operation
   */
  async saveProfile(
    source: string,
    criteria: SearchCriteria,
    profile: Profile,
  ): Promise<boolean> {
    try {
      const dataProvider = this.getDataProvider(source);
      if (!dataProvider) {
        throw new Error(`Data provider not found for source: ${source}`);
      }
      const profileDocument: ProfileDocument = {
        uri: profile.uri,
        configurations: profile.configurations,
        recommendations: profile.recommendations || [],
        matching: profile.matching || [],
        preference: profile.preference || [],
      };
      const updateResult = await dataProvider.update(criteria, profileDocument);
      if (!updateResult) {
        Logger.warn(
          `No profile found matching criteria to update for source: ${source}`,
        );
        return false;
      }
      Logger.info(`Profile saved successfully to source: ${source}`);
      return true;
    } catch (error) {
      const saveError: ContractAgentError = {
        name: 'ProfileSaveError',
        message: `Failed to save profile: ${(error as Error).message}`,
        code: CAECode.PROFILE_SAVE_FAILED,
        context: { source, profile },
      };
      Logger.error(saveError.message);
      throw saveError;
    }
  }

  async createProfileForParticipant(participantURI: string): Promise<Profile> {
    try {
      if (!Agent.profilesHost) {
        throw new Error(
          `Can't create profile for participant "profilesHost" is not set`,
        );
      }
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: participantURI,
          },
        ],
        threshold: 0,
      };
      const existingProfile = await this.findProfiles('profiles', criteria);

      if (existingProfile?.length && existingProfile[0]) {
        Logger.warn(
          `Profile already exists for participant: ${participantURI}`,
        );
        return existingProfile[0];
      }

      const profileProvider = this.getDataProvider(Agent.profilesHost);
      const newProfileData = {
        uri: participantURI,
        configurations: {},
        recommendations: [],
        matching: [],
      };

      const profile = await profileProvider.create(newProfileData);
      const newProfile = new Profile(profile as ProfileJSON);
      const saved = await this.saveProfile('profiles', criteria, newProfile);

      if (!saved) {
        throw new Error(`Failed to save new profile for: ${participantURI}`);
      }
      Logger.info(`New profile created and saved for: ${participantURI}`);
      return newProfile;
    } catch (error) {
      Logger.error(`Error creating profile: ${(error as Error).message}`);
      throw new Error('Profile creation failed');
    }
  }
}
