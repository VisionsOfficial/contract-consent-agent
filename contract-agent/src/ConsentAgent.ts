import { DataProvider } from './DataProvider';
import { Profile } from './Profile';
import { ProfilePolicy, SearchCriteria } from './types';
import { UserExperience } from './UserExperience';

export class ConsentAgent extends UserExperience {
  private static instance: ConsentAgent;
  private static dataProvider: DataProvider | null;

  private constructor() {
    if (ConsentAgent.dataProvider === null) {
      throw new Error('Data Provider not set for ContractAgent');
    }
    super(ConsentAgent.dataProvider);
  }

  static retrieveService(refresh: boolean = false): ConsentAgent {
    if (!ConsentAgent.instance || refresh) {
      const instance = new ConsentAgent();
      ConsentAgent.instance = instance;
    }
    return ConsentAgent.instance;
  }

  protected compareEntities(sourceEntity: any, targetEntity: any): number {
    throw new Error('Method not implemented.');
  }
  protected extractRelevantPolicies(entity: any): ProfilePolicy[] {
    throw new Error('Method not implemented.');
  }
  protected buildSearchCriteria(sourceEntity: any): SearchCriteria {
    throw new Error('Method not implemented.');
  }
  protected calculateSimilarity(source: any, target: Profile): number {
    throw new Error('Method not implemented.');
  }
  process(sourceEntity: any, options?: any): Promise<Profile[]> {
    throw new Error('Method not implemented.');
  }
}
