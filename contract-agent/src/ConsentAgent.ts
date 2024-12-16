import { Profile, ProfileJSON } from './Profile';
import {
  ProfileDocument,
  SearchCriteria,
  DataChangeEvent,
  PreferencePayload,
  ProfilePayload,
  CAECode,
  ConsentAgentError, FilterOperator,
} from './types';
import { Agent } from './Agent';
import { DataProvider, DataProviderType } from './DataProvider';
import { MongoDBProvider } from './MongoDBProvider';
import { Logger } from './Logger';
import { ChangeStreamDataProvider } from './ChangeStreamDataProvider';

export class ConsentAgent extends Agent {
  private static instance: ConsentAgent | null = null;

  private constructor() {
    super();
  }

  /**
   * Prepares the ConsentAgent instance by loading configuration and setting up providers
   * @throws {ConsentAgentError} If preparation fails
   */
  async prepare(): Promise<void> {
    try {
      this.loadDefaultConfiguration();
      await this.addDefaultProviders();
      this.setupProviderEventHandlers();
    } catch (error) {
      const agentError: ConsentAgentError = {
        name: 'PreparationError',
        message: `Failed to prepare ConsentAgent: ${(error as Error).message}`,
        code: CAECode.PREPARATION_FAILED,
      };
      Logger.error(agentError.message);
      throw agentError;
    }
  }

  /**
   * Retrieves or creates an instance of ConsentAgent.
   * @param dataProviderType
   * @param refresh - Whether to force creation of a new instance.
   * @returns Instance of ConsentAgent.
   */
  static async retrieveService(
    dataProviderType: DataProviderType = ChangeStreamDataProvider,
    refresh: boolean = false,
  ): Promise<ConsentAgent> {
    try{
      if (!ConsentAgent.instance || refresh) {
        DataProvider.setChildType(dataProviderType);
        const instance = new ConsentAgent();
        await instance.prepare();
        ConsentAgent.instance = instance;
      }
      return ConsentAgent.instance;
    } catch (error) {
      const serviceError: ConsentAgentError = {
        name: 'ServiceRetrievalError',
        message: `Failed to retrieve ConsentAgent service: ${(error as Error).message}`,
        code: CAECode.SERVICE_RETRIEVAL_FAILED,
      };
      Logger.error(serviceError.message);
      throw serviceError;
    }
  }

  /**
   * Finds profiles based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @returns Promise resolving to an array of profiles.
   */
  async findProfiles(
    source: string,
    criteria: SearchCriteria,
  ): Promise<Profile[]> {
    try {
      const dataProvider = this.getDataProvider(source);
      const results: ProfileDocument[] = await dataProvider.find(criteria);
      return results.map((result) => {
        const profil = {
          uri: result.uri,
          configurations: result.configurations,
          recommendations: result.recommendations || [],
          matching: result.matching || [],
          preference: result.preference || [],
        };
        return new Profile(profil);
      });
    } catch (error) {
      Logger.error(`Error while finding profile: ${(error as Error).message}`);
      throw new Error();
    }
  }

  /**
   * Finds profile based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @returns Promise resolving to an array of profiles.
   */
  async findProfile(
    source: string,
    criteria: SearchCriteria,
  ): Promise<Profile> {
    try {
      const dataProvider = this.getDataProvider(source);
      const result: ProfileDocument = await dataProvider.findOne(criteria);
      return new Profile({
        uri: result.uri,
        configurations: result.configurations,
        recommendations: result.recommendations || [],
        matching: result.matching || [],
        preference: result.preference || [],
      });
    } catch (error) {
      Logger.error(`Error while finding profile: ${(error as Error).message}`);
      throw new Error();
    }
  }

  /**
   * Finds profile based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @param data - the updated data
   * @returns Promise resolving to an array of profiles.
   */
  async findProfileAndUpdate(
    source: string,
    criteria: SearchCriteria,
    data: ProfilePayload | PreferencePayload,
  ): Promise<Profile> {
    try {
      const dataProvider = this.getDataProvider(source);
      const result: ProfileDocument = await dataProvider.findOneAndUpdate(criteria, data);
      return new Profile({
        uri: result.uri,
        configurations: result.configurations,
        recommendations: result.recommendations || [],
        matching: result.matching || [],
        preference: result.preference || [],
      });
    } catch (error) {
      Logger.error(`Error while finding profile: ${(error as Error).message}`);
      throw new Error();
    }
  }

  /**
   * Finds profile based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @param data - the updated data
   * @returns Promise resolving to an array of profiles.
   */
  async findProfileAndPush(
    source: string,
    criteria: SearchCriteria,
    data: ProfilePayload,
  ): Promise<Profile> {
    try {
      const dataProvider = this.getDataProvider(source);
      const result: ProfileDocument = await dataProvider.findOneAndPush(criteria, data);
      return new Profile({
        uri: result.uri,
        configurations: result.configurations,
        recommendations: result.recommendations || [],
        matching: result.matching || [],
        preference: result.preference || [],
      });
    } catch (error) {
      Logger.error(`Error while finding profile: ${(error as Error).message}`);
      throw new Error();
    }
  }

  /**
   * Finds profile based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @param data - the updated data
   * @returns Promise resolving to an array of profiles.
   */
  async findProfileAndPull(
    source: string,
    criteria: SearchCriteria,
    data: any,
  ): Promise<Profile> {
    try {
      const dataProvider = this.getDataProvider(source);
      const result: ProfileDocument = await dataProvider.findOneAndPull(criteria, data);
      return new Profile({
        uri: result.uri,
        configurations: result.configurations,
        recommendations: result.recommendations || [],
        matching: result.matching || [],
        preference: result.preference || [],
      });
    } catch (error) {
      Logger.error(`Error while finding profile: ${(error as Error).message}`);
      throw new Error();
    }
  }


  /**
   * Builds search criteria based on the provided source entity.
   * @param sourceEntity - Entity from which to derive search criteria.
   * @returns The constructed search criteria.
   */
  protected buildSearchCriteria(sourceEntity: unknown): SearchCriteria {
    throw new Error('Method not implemented.');
  }


  saveProfile( source: string,
    criteria: SearchCriteria,
    profile: Profile,): Promise<boolean>{
    throw new Error('Method not implemented.');
  }

  /**
   * Enriches a profile with system recommendations.
   * @returns The enriched profile.
   */
  protected enrichProfileWithSystemRecommendations(): Profile {
    throw new Error('Method not implemented.');
  }

  /**
   * Handles inserted data events
   * @param data - Data change event
   */
  protected async handleDataInserted(data: DataChangeEvent): Promise<void> {
    if(data.fullDocument && data.fullDocument instanceof Object) {
      switch(data.source){
        case 'users': {
          try {
            const { _id } = data.fullDocument as any;
            await this.createProfileForParticipant(_id)
            Logger.info(`Data inserted for source: ${data.source}`);
          } catch (error) {
            Logger.error(`Data insertion failed: ${(error as Error).message}`);
            throw error;
          }
        }
          break;
        case 'privacynotices': {
          try {
            //update profiles
            Logger.info(`Data inserted for source: ${data.source}`);
          } catch (error) {
            Logger.error(`Data insertion failed: ${(error as Error).message}`);
            throw error;
          }
        }
          break;
        case 'consents': {
          try {
            //update profiles
            Logger.info(`Data inserted for source: ${data.source}`);
          } catch (error) {
            Logger.error(`Data insertion failed: ${(error as Error).message}`);
            throw error;
          }
        }
          break;
      }
    } else {
      Logger.info(`Unhandled data for source: ${data.source}`);
    }
  }

  /**
   * Handles data update events.
   * @param data - Data change event.
   */
  protected async handleDataUpdated(data: DataChangeEvent): Promise<void> {
    if(data.fullDocument && data.fullDocument instanceof Object) {
      switch(data.source){
        case 'privacynotices': {
          try {
            //update profiles
            Logger.info(`Data inserted for source: ${data.source}`);
          } catch (error) {
            Logger.error(`Data insertion failed: ${(error as Error).message}`);
            throw error;
          }
        }
          break;
        case 'consents': {
          try {
            //update profiles
            Logger.info(`Data inserted for source: ${data.source}`);
          } catch (error) {
            Logger.error(`Data insertion failed: ${(error as Error).message}`);
            throw error;
          }
        }
          break;
      }
    } else {
      Logger.info(`Unhandled data for source: ${data.source}`);
    }
  }

  /**
   * Handles data deletion events.
   * @param data - Data change event.
   */
  protected async handleDataDeleted(data: DataChangeEvent): Promise<void> {
    if (data.fullDocument && data.fullDocument instanceof Object) {
      switch (data.source) {
        case 'users': {
          try {
            const { _id } = data.fullDocument as any;
            await this.deleteProfileForParticipant(_id)
            Logger.info(`Data inserted for source: ${data.source}`);
          } catch (error) {
            Logger.error(`Data insertion failed: ${(error as Error).message}`);
            throw error;
          }
        }
          break;
        case 'privacynotices': {
          try {
            //update profiles
            Logger.info(`Data inserted for source: ${data.source}`);
          } catch (error) {
            Logger.error(`Data insertion failed: ${(error as Error).message}`);
            throw error;
          }
        }
          break;
        case 'consents': {
          try {
            //update profiles
            Logger.info(`Data inserted for source: ${data.source}`);
          } catch (error) {
            Logger.error(`Data insertion failed: ${(error as Error).message}`);
            throw error;
          }
        }
          break;
      }
    } else {
      Logger.info(`Unhandled data insertion for source: ${data.source}`);
    }
  }

  /**
   * Updates the matching information for a profile.
   * @param profile - Profile instance.
   * @param data - Matching data to update the profile with.
   */
  protected async updateMatchingForProfile(
    profile: Profile,
    data: unknown,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Check the existing data at the Agent initialization
   */
  protected async existingDataCheck(
  ): Promise<void> {
    const users = await this.getDataProvider('users').findAll();
    const privacynotices = await this.getDataProvider('privacynotices').findAll();
    const consents = await this.getDataProvider('consents').findAll();
    const profiles = await this.getDataProvider('profiles').findAll();

    for(const user of users){
      const existingProfile = profiles.find((profile) => profile.uri.toString() === user._id.toString());

      if(!existingProfile){
        await this.createProfileForParticipant(user._id);
        Logger.info(`Profile created for user - ${user._id}`)

        //Update Profile by analyzing existing privacy notices and consents
      }
    }
  }

  /**
   * Updates recommendations for a profile.
   * @param profile - Profile instance.
   * @param data - Recommendation data to update the profile with.
   */
  protected async updateRecommendationForProfile(
    profile: Profile,
    data: unknown,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Create a profile for a user
   * @param participantId - The Id of the user
   * @param allowRecommendations - boolean option to setup configuration of the profile at the creation
   * @param allowPreferences - boolean option to setup configuration of the profile at the creation
   */
  public async createProfileForParticipant(
    participantId: string,
    allowRecommendations?: boolean,
    allowPreferences?: boolean,
  ): Promise<Profile> {
    try {
      const profileProvider = this.getDataProvider('profiles');
      const newProfileData = {
        uri: participantId,
        configurations: {
          allowRecommendations: allowRecommendations ?? true,
          allowPreferences: allowPreferences ?? true,
        },
        recommendations: [] as unknown,
        matching: [] as unknown,
        preference: [] as unknown,
      };
      const profile = await profileProvider.create(newProfileData);
      return new Profile(profile as ProfileJSON);
    } catch (error) {
      Logger.error(`Error creating profile: ${(error as Error).message}`);
      throw new Error('Profile creation failed');
    }
  }

  public async deleteProfileForParticipant(
    participantId: string,
  ): Promise<Profile> {
    try {
      const profileProvider = this.getDataProvider('profiles');
      const result: ProfileDocument = await profileProvider.findOne({
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: participantId,
          },
        ],
        threshold: 0,
      });
      if(result._id){
        await profileProvider.delete(result?._id);
        return new Profile({
          uri: result.uri,
          configurations: result.configurations,
          recommendations: result.recommendations || [],
          matching: result.matching || [],
          preference: result.preference || [],
        });
      } else {
        throw new Error('Profile not found');
      }
    } catch (error) {
      Logger.error(`Error creating profile: ${(error as Error).message}`);
      throw new Error('Profile creation failed');
    }
  }
}

