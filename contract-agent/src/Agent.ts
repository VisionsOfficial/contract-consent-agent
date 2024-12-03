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
} from './types';
import path from 'path';

export interface AgentConfig {
  dataProviderConfig: DataProviderConfig[];
}

export abstract class Agent {
  private static configPath: string;
  protected config?: AgentConfig;
  protected dataProviders: Provider[] = [];

  protected constructor() {
    if (!Agent.configPath) {
      throw new Error('Config path not set');
    }
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
    if (!dataProviders?.length) {
      throw new Error('Data Providers array cannot be empty');
    }

    dataProviders.forEach((dataProvider: Provider) => {
      if (dataProvider.provider) {
        dataProvider.source = dataProvider.provider.dataSource;
      }
    });

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

        this.addDataProviders([
          {
            watchChanges: dpConfig.watchChanges,
            source: dpConfig.source,
            provider,
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

  protected async createProfileForParticipant(
    participantId: string,
  ): Promise<Profile> {
    try {
      const profileProvider = this.getDataProvider('profiles');
      const newProfileData = {
        url: participantId,
        configurations: {},
        recommendations: [],
        matching: [],
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

  // eslint-disable-next-line no-unused-vars
  protected abstract buildSearchCriteria(sourceEntity: unknown): SearchCriteria;
}
