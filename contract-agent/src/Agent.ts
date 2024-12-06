import { Profile, ProfileJSON } from './Profile';
import { DataProvider } from './DataProvider';
import * as fs from 'fs';
import { Logger } from './Logger';
import {
  SearchCriteria,
  ProfileRecommendation,
  ProfileMatching,
  Provider,
  DataProviderConfig,
  DataChangeEvent,
  ProfileDocument,
  ContractAgentError,
  CAECode,
  FilterOperator,
} from './types';
import path from 'path';

export interface AgentConfig {
  dataProviderConfig: DataProviderConfig[];
}

export abstract class Agent {
  private static configPath: string;
  private static profilesHost: string;

  protected config?: AgentConfig;
  protected dataProviders: Provider[] = [];

  protected constructor() {
    if (!Agent.configPath) {
      throw new Error('Config path not set');
    }
  }

  static setProfilesHost(profilesHost: string) {
    Agent.profilesHost = profilesHost;
    if (!Agent.profilesHost) {
      Logger.warn('using default profiles source');
      Agent.profilesHost = 'profiles';
    }
  }

  static getProfileHost(): string {
    return Agent.profilesHost;
  }

  static setConfigPath(configPath: string, callerFilePath: string): void {
    const fileDir = path.dirname(callerFilePath);
    const agentConfigPath = path.join(fileDir, configPath);
    Agent.configPath = agentConfigPath;
  }

  protected setupProviderEventHandlers(): void {
    this.dataProviders.forEach(({ provider, watchChanges }) => {
      if (watchChanges !== false) {
        provider.on('dataInserted', this.handleDataInserted.bind(this));
        provider.on('dataUpdated', this.handleDataUpdated.bind(this));
        provider.on('dataDeleted', this.handleDataDeleted.bind(this));
      }
    });
  }

  getDataProvider(source: string): DataProvider {
    const dataProvider = this.dataProviders.find(
      (provider) => provider.source === source,
    )?.provider;

    if (!dataProvider) {
      throw new Error(`DataProvider for source '${source}' not found.`);
    }

    return dataProvider;
  }

  // eslint-disable-next-line no-unused-vars
  protected abstract handleDataInserted(data: DataChangeEvent): Promise<void>;
  // eslint-disable-next-line no-unused-vars
  protected abstract handleDataUpdated(data: DataChangeEvent): Promise<void>;
  // eslint-disable-next-line no-unused-vars
  protected abstract handleDataDeleted(data: DataChangeEvent): void;

  abstract findProfiles(
    // eslint-disable-next-line no-unused-vars
    source: string,
    // eslint-disable-next-line no-unused-vars
    criteria: SearchCriteria,
  ): Promise<Profile[]>;

  addDataProviders(dataProviders: Provider[]): void {
    if (!dataProviders || dataProviders.length === 0) {
      throw new Error('The dataProviders array cannot be empty.');
    }
    for (const dataProvider of dataProviders) {
      if (!dataProvider.provider) {
        continue;
      }
      dataProvider.source = dataProvider.provider.dataSource;
      if (dataProvider.hostsProfiles && dataProvider.source) {
        Agent.setProfilesHost(dataProvider.source);
      }
    }
    this.dataProviders.push(...dataProviders);
  }

  protected async addDefaultProviders(): Promise<void> {
    if (!this.config) {
      Logger.warn('No configuration found. No data providers added.');
      return;
    }
    const providerType = DataProvider.childType;
    if (typeof providerType !== 'function') {
      throw new Error('Invalid DataProvider type');
    }
    for (const dpConfig of this.config.dataProviderConfig) {
      try {
        const provider = new providerType(dpConfig);
        await provider.ensureReady();
        const { watchChanges, source, hostsProfiles } = dpConfig;
        this.addDataProviders([
          {
            watchChanges,
            source,
            provider,
            hostsProfiles,
          },
        ]);
      } catch (error) {
        Logger.error(
          `Failed to add data provider for source ${dpConfig.source}: ${(error as Error).message}`,
        );
      }
    }
  }

  protected loadDefaultConfiguration(): void {
    try {
      const configData = fs.readFileSync(Agent.configPath, 'utf-8');
      this.config = JSON.parse(configData) as AgentConfig;
      Logger.info('Configuration loaded successfully');
    } catch (error) {
      Logger.error(`Failed to load configuration: ${(error as Error).message}`);
      this.config = { dataProviderConfig: [] };
    }
  }

  getRecommendations(profile: Profile): ProfileRecommendation[] {
    return profile.recommendations;
  }

  getMatchings(profile: Profile): ProfileMatching[] {
    return profile.matching;
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
          url: result.url,
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
  protected async saveProfile(
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
        url: profile.url,
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

  protected async createProfileForParticipant(
    participantId: string,
  ): Promise<Profile> {
    try {
      if (!Agent.profilesHost) {
        throw new Error(
          `Can't create profile for participant "profilesHost" is not set`,
        );
      }

      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'url',
            operator: FilterOperator.EQUALS,
            value: participantId,
          },
        ],
        threshold: 0,
      };

      const existingProfile = await this.findProfile('profiles', criteria);
      if (existingProfile) {
        Logger.warn(`Profile already exists for participant: ${participantId}`);
        return existingProfile;
      }

      const profileProvider = this.getDataProvider(Agent.profilesHost);
      const newProfileData = {
        url: participantId,
        configurations: {},
        recommendations: [],
        matching: [],
      };
      const profile = await profileProvider.create(newProfileData);
      const newProfile = new Profile(profile as ProfileJSON);

      const saved = await this.saveProfile('profiles', criteria, newProfile);
      if (!saved) {
        throw new Error(`Failed to save new profile for: ${participantId}`);
      }

      Logger.info(`New profile created and saved for: ${participantId}`);
      return newProfile;
    } catch (error) {
      Logger.error(`Error creating profile: ${(error as Error).message}`);
      throw new Error('Profile creation failed');
    }
  }

  protected abstract updateMatchingForProfile(
    // eslint-disable-next-line no-unused-vars
    profile: Profile,
    // eslint-disable-next-line no-unused-vars
    data: unknown,
  ): Promise<void>;

  protected abstract updateRecommendationForProfile(
    // eslint-disable-next-line no-unused-vars
    profile: Profile,
    // eslint-disable-next-line no-unused-vars
    data: unknown,
  ): Promise<void>;

  protected abstract enrichProfileWithSystemRecommendations(): Profile;
}
