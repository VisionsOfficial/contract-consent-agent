import { Profile, ProfileJSON } from './Profile';
import { DataProvider } from './DataProvider';
import * as fs from 'fs';
import { Logger } from './Logger';
import {
  SearchCriteria,
  ProfilePolicy,
  ProfileRecommendation,
  ProfileMatching,
  Provider,
  DataProviderConfig,
} from './types';

import path from 'path';

export interface AgentConfig {
  dataProviderConfig: DataProviderConfig[];
}

export abstract class Agent {
  private static configPath: string;
  protected config?: AgentConfig;
  protected dataProviders: Provider[] = [];

  constructor() {
    if (!Agent.configPath) {
      throw new Error('Config path not set');
    }
  }

  static setConfigPath(configPath: string, callerFilePath: string) {
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
      (dataProvider) => dataProvider.source === source,
    );
    if (dataProvider) {
      return dataProvider.provider;
    } else {
      throw new Error(`DataProvider for source '${source}' not found.`);
    }
  }

  // eslint-disable-next-line no-unused-vars
  protected abstract handleDataInserted(data: {
    fullDocument: any;
    source: string;
  }): void;

  // eslint-disable-next-line no-unused-vars
  protected abstract handleDataUpdated(data: {
    documentKey: any;
    updateDescription: any;
    source: string;
  }): void;

  // eslint-disable-next-line no-unused-vars
  protected abstract handleDataDeleted(data: {
    documentKey: any;
    source: string;
  }): void;

  abstract findProfiles(
    // eslint-disable-next-line no-unused-vars
    source: string,
    // eslint-disable-next-line no-unused-vars
    criteria: SearchCriteria,
  ): Promise<Profile[]>;

  addDataProviders(dataProviders: Provider[]) {
    if (!dataProviders || dataProviders.length === 0) {
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
    if (this.config) {
      for (const dpConfig of this.config.dataProviderConfig) {
        const providerType = DataProvider.childType;
        if (typeof providerType === 'function') {
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
              `Failed to add data provider for source: ${dpConfig.source}: ${(error as Error).message}`,
            );
          }
        } else {
          Logger.warn(
            `Invalid provider type for source: ${dpConfig.source}. No data provider added.`,
          );
        }
      }
    } else {
      Logger.warn('No configuration found. No data providers added.');
    }
  }

  protected loadDefaultConfiguration(): void {
    try {
      const configData = fs.readFileSync(Agent.configPath, 'utf-8');
      this.config = JSON.parse(configData) as AgentConfig;
      Logger.info(
        `Configuration loaded successfully: ${JSON.stringify(this.config, null, 2)}`,
      );
    } catch (error) {
      Logger.error(`Failed to load configuration: ${(error as Error).message}`);
      this.config = { dataProviderConfig: [] };
    }
  }
  // Provide recommendations for ecosystem contracts and policies that align with potential participant needs.
  // These recommendations are based on the participant's usage history or suggestions pushed by the system.
  getRecommendations(profile: Profile): ProfileRecommendation[] {
    return profile.recommendations;
  }

  // Check compatibility criteria between entities and the participant's profile to ensure a precise match.
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
    profile: Profile,
    data: unknown,
  ): void;
  //
  protected abstract updateRecommendationForProfile(
    profile: Profile,
    data: unknown,
  ): void;
  // Method to enrich the user profile by adding system-generated recommendations
  protected abstract enrichProfileWithSystemRecommendations(): Profile;
  // Search criteria
  protected abstract buildSearchCriteria(sourceEntity: any): SearchCriteria;
}
