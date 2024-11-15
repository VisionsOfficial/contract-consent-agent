import { Profile } from './Profile';
import { DataProvider } from './DataProvider';
import * as fs from 'fs';
import { Logger } from 'Logger';
import {
  SearchCriteria,
  ProfilePolicy,
  ProfileRecommendation,
  ProfileMatching,
  Provider,
} from './types';

export interface AgentConfig {
  dataSources: string[];
}

export abstract class Agent {
  protected config?: AgentConfig;
  protected dataProviders: Provider[] = [];

  constructor() {}

  protected setupProviderEventHandlers(): void {
    this.dataProviders.forEach(({ provider }) => {
      provider.on('dataInserted', this.handleDataInserted.bind(this));
      provider.on('dataUpdated', this.handleDataUpdated.bind(this));
      provider.on('dataDeleted', this.handleDataDeleted.bind(this));
    });
  }

  protected getDataProvider(source: string): DataProvider {
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
    this.dataProviders.push(...dataProviders);
  }

  protected addDefaultProviders(): void {
    if (this.config) {
      this.config.dataSources.forEach((source) => {
        const providerType = DataProvider.childType;
        if (typeof providerType === 'function') {
          try {
            const provider = new providerType(source);
            this.addDataProviders([{ source, provider }]);
          } catch (error) {
            Logger.error(
              `Failed to add data provider for source: ${source}: ${(error as Error).message}`,
            );
          }
        } else {
          Logger.warn(
            `Invalid provider type for source: ${source}. No data provider added.`,
          );
        }
      });
    } else {
      Logger.warn('No configuration found. No data providers added.');
    }
  }

  protected loadDefaultConfiguration(): void {
    try {
      const configData = fs.readFileSync('contract-agent.config.json', 'utf-8');
      this.config = JSON.parse(configData) as AgentConfig;
      Logger.info(
        `Configuration loaded successfully: ${JSON.stringify(this.config, null, 2)}`,
      );
    } catch (error) {
      Logger.error(`Failed to load configuration: ${(error as Error).message}`);
      this.config = { dataSources: [] };
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

  //
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
