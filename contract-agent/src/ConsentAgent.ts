import { Profile } from './Profile';
import { SearchCriteria } from './types';
import { Agent } from './Agent';

export class ConsentAgent extends Agent {
  private static instance: ConsentAgent;

  private constructor() {
    super();
  }

  static retrieveService(refresh: boolean = false): ConsentAgent {
    if (!ConsentAgent.instance || refresh) {
      const instance = new ConsentAgent();
      ConsentAgent.instance = instance;
    }
    return ConsentAgent.instance;
  }

  findProfiles(source: string, criteria: SearchCriteria): Promise<Profile[]> {
    throw new Error('Method not implemented.');
  }

  protected buildSearchCriteria(sourceEntity: any): SearchCriteria {
    throw new Error('Method not implemented.');
  }

  protected enrichProfileWithSystemRecommendations(): Profile {
    throw new Error('Method not implemented.');
  }

  protected handleDataInserted(data: {
    fullDocument: any;
    source: string;
  }): void {
    throw new Error('Method not implemented.');
  }

  protected handleDataUpdated(data: {
    documentKey: any;
    updateDescription: any;
    source: string;
  }): void {
    throw new Error('Method not implemented.');
  }

  protected handleDataDeleted(data: {
    documentKey: any;
    source: string;
  }): void {
    throw new Error('Method not implemented.');
  }

  protected updateMatchingForProfile(profile: Profile, data: unknown): void {
    throw new Error('Method not implemented.');
  }

  protected updateRecommendationForProfile(
    profile: Profile,
    data: unknown,
  ): void {
    throw new Error('Method not implemented.');
  }
}
