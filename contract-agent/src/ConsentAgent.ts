import { Profile, ProfileJSON } from './Profile';
import {
  ProfileDocument,
  SearchCriteria,
  DataChangeEvent,
  PreferencePayload,
  ProfilePayload,
  CAECode,
  ConsentAgentError,
  FilterOperator,
  ProfilePreference,
} from './types';
import { Agent } from './Agent';
import { DataProvider, DataProviderType } from './DataProvider';
import { Logger } from './Logger';
import { ChangeStreamDataProvider } from './ChangeStreamDataProvider';
import axios from 'axios';
import { ObjectId } from 'mongodb';

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
    try {
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
        _id: result?._id,
        uri: result?.uri,
        configurations: result?.configurations,
        recommendations: result?.recommendations || [],
        matching: result?.matching || [],
        preference: result?.preference || [],
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
    data: ProfilePayload | PreferencePayload | ProfileDocument,
  ): Promise<Profile> {
    try {
      const dataProvider = this.getDataProvider(source);
      const result: ProfileDocument = await dataProvider.findOneAndUpdate(
        criteria,
        data,
      );
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
      const result: ProfileDocument = await dataProvider.findOneAndPush(
        criteria,
        data,
      );
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
   *   Promise resolving to an array of profiles.
   */
  async findProfileAndPull(
    source: string,
    criteria: SearchCriteria,
    data: any,
  ): Promise<Profile> {
    try {
      const dataProvider = this.getDataProvider(source);
      const result: ProfileDocument = await dataProvider.findOneAndPull(
        criteria,
        data,
      );
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
    if (data.fullDocument && data.fullDocument instanceof Object) {
      switch (data.source) {
        case 'users':
          {
            try {
              const { _id } = data.fullDocument as any;
              await this.createProfileForParticipant(_id);
              Logger.info(`Data inserted for source: ${data.source}`);
            } catch (error) {
              Logger.error(
                `Data insertion failed: ${(error as Error).message}`,
              );
              throw error;
            }
          }
          break;
        case 'privacynotices':
          {
            try {
              //update data exchanges recommendation profiles
              await this.handlePrivacyNotice(data.fullDocument);
              Logger.info(`Data inserted for source: ${data.source}`);
            } catch (error) {
              Logger.error(
                `Data insertion failed: ${(error as Error).message}`,
              );
              throw error;
            }
          }
          break;
        case 'consents':
          {
            try {
              //update consents recommendation profiles
              await this.handleConsent(data.fullDocument);
              Logger.info(`Data inserted for source: ${data.source}`);
            } catch (error) {
              Logger.error(
                `Data insertion failed: ${(error as Error).message}`,
              );
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
    if (data.updateDescription && data.updateDescription.updatedFields && data.updateDescription.updatedFields instanceof Object) {
      switch (data.source) {
        case 'users':
          {
            try {
              //update profiles
              // watch for new identifier
              if((data.updateDescription.updatedFields as any).identifiers) await this.handleNewIdentifier({ _id: data.documentKey?._id });
              Logger.info(`Data updated for source: ${data.source}`);
            } catch (error) {
              Logger.error(
                `Data update failed: ${(error as Error).message}`,
              );
              throw error;
            }
          }
          break;
        case 'consents':
          {
            try {
              const { updatedFields } = data.updateDescription as any
              //watch for revoked consent
              if (updatedFields.status && (updatedFields.status === 'revoked' || updatedFields.status === 'refused' || updatedFields.status === 'terminated')) {
                //update profiles
                //remove element from profiles
                await this.handleRemoveConsent({ _id: data.documentKey?._id });
              }
              Logger.info(`Data updated for source: ${data.source}`);
            } catch (error) {
              Logger.error(
                `Data update failed: ${(error as Error).message}`,
              );
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
    if (data.documentKey && data.documentKey instanceof Object) {
      switch (data.source) {
        case 'users':
          {
            try {
              const { _id } = data.documentKey as any;
              await this.deleteProfileForParticipant(_id);
              Logger.info(`Data deleted for source: ${data.source}`);
            } catch (error) {
              Logger.error(
                `Data deletion failed: ${(error as Error).message}`,
              );
              throw error;
            }
          }
          break;
        case 'privacynotices':
          {
            try {
              //update profiles
              //remove element from profiles
              await this.handleRemovePrivacyNotice(data.documentKey);
              Logger.info(`Data deleted for source: ${data.source}`);
            } catch (error) {
              Logger.error(
                `Data deletion failed: ${(error as Error).message}`,
              );
              throw error;
            }
          }
          break;
        case 'consents':
          {
            try {
              //update profiles
              //remove element from profiles
              await this.handleRemoveConsent(data.documentKey);
              Logger.info(`Data deleted for source: ${data.source}`);
            } catch (error) {
              Logger.error(
                `Data deletion failed: ${(error as Error).message}`,
              );
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
   * @returns {Promise<void>}
   */
  protected async existingDataCheck(): Promise<void> {
    const users = await this.getDataProvider('users').findAll();
    const profiles = await this.getDataProvider('profiles').findAll();

    for (const user of users) {
      const existingProfile = profiles.find(
        (profile) => profile.uri.toString() === user._id.toString(),
      );

      if (!existingProfile) {
        await this.createProfileForParticipant(user._id);
        Logger.info(`Profile created for user - ${user._id}`);
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
    data: ProfileDocument,
  ): Promise<void> {
    const dataProvider = this.getDataProvider('profiles');
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: '_id',
          operator: FilterOperator.EQUALS,
          value: profile._id,
        },
      ],
      threshold: 0,
    };
    await dataProvider.findOneAndUpdate(criteria, data);
  }

  /**
   * Create a profile for a user
   * @param participantId - The Id of the user
   * @param allowRecommendations - boolean option to setup configuration of the profile at the creation
   */
  public async createProfileForParticipant(
    participantId: string,
    allowRecommendations?: boolean,
  ): Promise<Profile> {
    try {
      const profileProvider = this.getDataProvider('profiles');
      const newProfileData = {
        uri: participantId.toString(),
        configurations: {
          allowRecommendations: allowRecommendations ?? true,
        },
        recommendations: {
          consents: [] as unknown,
          dataExchanges: [] as unknown,
        },
        preference: [] as unknown,
      };
      const profile = await profileProvider.create(newProfileData);
      return new Profile(profile as ProfileJSON);
    } catch (error) {
      Logger.error(`Error creating profile: ${(error as Error).message}`);
      throw new Error('Profile creation failed');
    }
  }

  /**
   * Deletes a profile for a given participant.
   * 
   * @param participantId - The Id of the participant whose profile is to be deleted.
   * @returns The deleted profile.
   */
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
      if (result._id) {
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

  /**
   * Handles privacy notices by updating profiles that allow recommendations.
   * 
   * This method processes the privacy notice document by first fetching the purpose and data information.
   * It then retrieves all profiles that allow recommendations and checks if they match the participants or categories
   * specified in the purpose and data. If a match is found, the method updates the profile by adding the privacy notice.
   * 
   * @param fullDocument - The full document containing the privacy notice information.
   */
  public async handlePrivacyNotice(fullDocument: any) {
    // Fetch purpose and data information
    const purposeData = await this.getPurposeAndData(
      fullDocument.purposes[0].serviceOffering,
      fullDocument.data[0].serviceOffering,
    );

    if (!purposeData) {
      throw new Error('Purpose and data information is undefined');
    }
    
    const { purpose, data } = purposeData;

    // Retrieve profiles that allow recommendations
    const profileProvider = this.getDataProvider('profiles');
    const allProfiles = await profileProvider.findAll();

    for (const profile of allProfiles) {
      if (
        profile.configurations.allowRecommendations &&
        profile.preference.some(
          (pref: ProfilePreference) =>
            pref.participant === purpose.providedBy ||
            pref.participant === data.providedBy ||
            (pref.category && purpose.category.includes(pref.category)) ||
            (pref.category && data.category.includes(pref.category))
        )
      ) {
        // Update profile
        const { recommendations } = profile;
        recommendations.dataExchanges.push(fullDocument._id);
        await this.updateRecommendationForProfile(profile, profile);
        Logger.info(
          `Profile ${profile._id} updated with privacy notice ${fullDocument._id}`,
        );
      }
    }
  }

  
  /**
   * Handles consent by updating profiles that allow recommendations.
   * 
   * This method processes the consent document by first fetching the purpose and data information.
   * It then retrieves all profiles that allow recommendations and checks if they match the participants or categories
   * specified in the purpose and data. If a match is found, the method updates the profile by removing the privacy notice
   * and adding the consent.
   * 
   * @param fullDocument - The full document containing the consent information.
   */
  public async handleConsent(fullDocument: any) {
    // Fetch purpose and data information
    const purposeData = await this.getPurposeAndData(
      fullDocument.purposes[0].serviceOffering,
      fullDocument.data[0].serviceOffering,
    );

    if (!purposeData) {
      throw new Error('Purpose and data information is undefined');
    }
    
    const { purpose, data } = purposeData;

    // Retrieve profiles that allow recommendations
    const profileProvider = this.getDataProvider('profiles');
    const allProfiles = await profileProvider.findAll();

    for (const profile of allProfiles) {
      if (
        profile.configurations.allowRecommendations &&
        profile.preference.some(
          (pref: ProfilePreference) =>
            pref.participant === purpose.providedBy ||
            pref.participant === data.providedBy ||
            (pref.category && purpose.category.includes(pref.category)) ||
            (pref.category && data.category.includes(pref.category))
        )
      ) {
        // Update profile
        // Remove privacy notice
        const index = profile.recommendations.dataExchanges.indexOf(
          fullDocument.privacyNotice,
        );
        profile.recommendations.dataExchanges.splice(index, 1);
        // Add consent
        profile.recommendations.consents.push(fullDocument._id);
        await this.updateRecommendationForProfile(profile, profile);
        Logger.info(
          `Profile ${profile._id} updated with consent ${fullDocument._id}`,
        );
      }
    }
  }

  /**
   * Handles the removal of privacy notice from profiles.
   * @param fullDocument - The full document containing the privacy notice information.
   */
  public async handleRemovePrivacyNotice(fullDocument: any) {
    // Retrieve profiles that allow recommendations
    const profileProvider = this.getDataProvider('profiles');
    const allProfiles = await profileProvider.findAll();

    for (const profile of allProfiles) {
      const { recommendations } = profile;
      if (
        recommendations.dataExchanges.includes(fullDocument._id)
      ) {
        // Update profile
        const pull = { 'recommendations.dataExchanges': { '_id': new ObjectId(fullDocument._id) } }
        const criteria: SearchCriteria = {
          conditions: [
            {
              field: 'uri',
              operator: FilterOperator.EQUALS,
              value: profile.uri,
            }
          ],
          threshold: 0,
        };
        await this.findProfileAndPull('profiles', criteria, pull);
        Logger.info(
          `Profile ${profile._id} updated with privacy notice ${fullDocument._id}`,
        );
      }
    }
  }

  /**
   * Handles the removal of consent from profiles.
   * @param fullDocument - The full document containing the consent information.
   */
  public async handleRemoveConsent(fullDocument: any) {
    // Retrieve profiles that allow recommendations
    const profileProvider = this.getDataProvider('profiles');
    const allProfiles = await profileProvider.findAll();

    for (const profile of allProfiles) {
      const { recommendations } = profile;
      if (
        recommendations.consents.includes(fullDocument._id)
      ) {
        // Update profile
        const pull = { 'recommendations.consents': { '_id': new ObjectId(fullDocument._id) } }
        const criteria: SearchCriteria = {
          conditions: [
            {
              field: 'uri',
              operator: FilterOperator.EQUALS,
              value: profile.uri,
            }
          ],
          threshold: 0,
        };
        await this.findProfileAndPull('profiles', criteria, pull);
        Logger.info(
          `Profile ${profile._id} updated with privacy notice ${fullDocument._id}`,
        );
      }
    }
  }

  /**
   * Fetches purpose and data documents based on their service descriptions.
   *
   * @param purposeSd - The service description URL for the purpose document.
   * @param dataSd - The service description URL for the data document.
   * @returns An object containing the fetched purpose and data documents.
   */
  private async getPurposeAndData(
    purposeSd: string,
    dataSd: string,
  ): Promise<
    | {
        purpose: { providedBy: string; category: string[] };
        data: { providedBy: string; category: string[] };
      }
    | undefined
  > {
    try {
      const [purposeResponse, dataResponse] = await Promise.all([
        axios.get(purposeSd),
        axios.get(dataSd),
      ]);
      if (!purposeResponse.data) {
        throw new Error('Purpose data is undefined');
      }
      if (!dataResponse.data) {
        throw new Error('Data data is undefined');
      }
      return { purpose: purposeResponse.data, data: dataResponse.data };
    } catch (e) {
      Logger.error(`Error fetching purpose and data: ${(e as Error).message}`);
    }
  }

  /**
   * Handles new identifier events.
   * @param fullDocument - The full document of the new identifier event.
   */
  private async handleNewIdentifier(fullDocument: any){
    try {
      //find the profile
      const profileProvider = this.getDataProvider('profiles');
      const criteria: SearchCriteria = {
        conditions: [
          {
            field: 'uri',
            operator: FilterOperator.EQUALS,
            value: fullDocument._id,
          }
        ],
        threshold: 0,
      };
      const profile = await profileProvider.findOne(criteria);
      if (!profile) {
        throw new Error('Profile not found');
      }

      // Retrieve profiles that allow recommendations
      const userIdentifierProvider = this.getDataProvider('useridentifiers');
      const identifierCriteria: SearchCriteria = {
        conditions: [
          {
            field: '_id',
            operator: FilterOperator.EQUALS,
            value: fullDocument._id,
          }
        ],
        threshold: 0,
      };
      const identifier = await userIdentifierProvider.findOne(identifierCriteria);
      if (!identifier) {
        throw new Error('Identifier not found');
      }

      //find participant
      const participantsProvider = this.getDataProvider('participants');
      const participantCriteria: SearchCriteria = {
        conditions: [
          {
            field: '_id',
            operator: FilterOperator.EQUALS,
            value: identifier.attachedParticipant,
          }
        ],
        threshold: 0,
      };
      const participant = await participantsProvider.findOne(participantCriteria);
      if (!participant) {
        throw new Error('Participant not found');
      }

      //find all the privacy notices and filter
      const pnProvider = this.getDataProvider('privacynotices');
      const privacyNotices = await pnProvider.findAll();
      if (!privacyNotices) {
        throw new Error('Privacy notices not found');
      }
      const filteredPrivacyNotices = privacyNotices.filter((pn: {dataProvider: string, recipients: string[]}) => 
        pn.dataProvider === participant.selfDescriptionURL || 
        pn.recipients.includes(participant.selfDescriptionURL)
      );

      //find all the consents and filter
      const consentProvider = this.getDataProvider('consents');
      const consents = await consentProvider.findAll();
      if (!consents) {
        throw new Error('Consents not found');
      }
      const filteredConsents = consents.filter((consent: {dataProvider: string, dataConsumer: string}) => 
        consent.dataProvider === participant._id || 
        consent.dataConsumer === participant._id
      );

      //add filtered privacy notices and consents to profile
      filteredPrivacyNotices.forEach((pn: {_id: string}) => {
        profile.recommendations.dataExchanges.push(pn._id);
        profile.recommendations.dataExchanges = [...new Set(profile.recommendations.dataExchanges)];
      });

      filteredConsents.forEach((consent: {_id: string}) => {
        profile.recommendations.consents.push(consent._id);
        profile.recommendations.consents = [...new Set(profile.recommendations.consents)];
      });

      await this.updateRecommendationForProfile(profile, profile);
    } catch (error) {
      Logger.error(`Error handling new identifier: ${(error as Error).message}`);
    }
  }
  
  /**
   *
   * @param source
   * @param criteria
   * @param profile
   */
  saveProfile(
    source: string,
    criteria: SearchCriteria,
    profile: Profile,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
