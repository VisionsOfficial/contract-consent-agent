import { Profile } from './Profile';
import { SearchCriteria } from './types';

export interface DataProvider {
  findSimilarProfiles(criteria: SearchCriteria): Promise<Profile[]>;
}
