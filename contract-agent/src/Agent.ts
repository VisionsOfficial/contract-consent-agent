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
  ConsentProfileRecommendation,
} from './types';
import path from 'path';

export interface AgentConfig {
  existingDataCheck?: boolean;
  dataProviderConfig: DataProviderConfig[];
}

export abstract class Agent {
  protected static configPath: string;
  protected static profilesHost: string;
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

  protected abstract existingDataCheck(): Promise<void>;

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
    if(this.config.existingDataCheck){
      await this.existingDataCheck();
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

  getRecommendations(profile: Profile): ProfileRecommendation[] | ConsentProfileRecommendation {
    return profile.recommendations;
  }

  getMatchings(profile: Profile): ProfileMatching[] {
    return profile.matching;
  }

  abstract saveProfile(
    source: string,
    criteria: SearchCriteria,
    profile: Profile,
  ): Promise<boolean>;

  protected async createProfileForParticipant(
    participantId: string,
  ): Promise<Profile> {
    try {
      if (!Agent.profilesHost) {
        throw new Error(
          `Can't create profile for participant "profilesHost" is not set`,
        );
      }
      const profileProvider = this.getDataProvider(Agent.profilesHost);
      const newProfileData = {
        uri: participantId,
        configurations: {},
        recommendations: [] as unknown,
        matching: [] as unknown,
      };
      const profile = await profileProvider.create(newProfileData);
      return new Profile(profile as ProfileJSON);
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
