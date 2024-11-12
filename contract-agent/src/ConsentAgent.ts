import { DataProvider } from './DataProvider';
import { Profile } from './Profile';
import { ProfilePolicy, SearchCriteria } from './types';
import { UserExperience } from './UserExperience';

export class ConsentAgent extends UserExperience {
  private static instance: ConsentAgent;
  private static dataProvider: DataProvider | null;

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

  protected buildSearchCriteria(sourceEntity: any): SearchCriteria {
    throw new Error('Method not implemented.');
  }

  protected enrichProfileWithSystemRecommendations(): Profile {
    throw new Error('Method not implemented.');
  }
}
