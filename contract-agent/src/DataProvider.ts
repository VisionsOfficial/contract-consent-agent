import { EventEmitter } from 'events';
import { Profile } from './Profile';
import { SearchCriteria } from './types';

export abstract class DataProvider extends EventEmitter {
  //
  constructor() {
    super();
  }
  //
  abstract findSimilarProfiles(criteria: SearchCriteria): Promise<Profile[]>;
  //
  protected notifyDataChange(eventName: string, data: any): void {
    this.emit(eventName, data);
  }
}
