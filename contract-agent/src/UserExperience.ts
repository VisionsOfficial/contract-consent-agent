import { Profile } from './Profile';
import { DataProvider } from './DataProvider';
import {
  SearchCriteria,
  ProfilePolicy,
  ProfileRecommendation,
  ProfileMatching,
} from './types';

export abstract class UserExperience {
  protected dataProviders: DataProvider[] = [];
  constructor() {}

  addDataProviders(dataProviders: DataProvider[]) {
    if (!dataProviders || dataProviders.length === 0) {
      throw new Error('Data Providers array cannot be empty');
    }
    this.dataProviders.push(...dataProviders);
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

  // Method to enrich the user profile by adding system-generated recommendations
  protected abstract enrichProfileWithSystemRecommendations(): Profile;

  // Search criteria
  protected abstract buildSearchCriteria(sourceEntity: any): SearchCriteria;
}
