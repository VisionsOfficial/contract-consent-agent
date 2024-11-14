import { EventEmitter } from 'events';
import { Profile } from './Profile';
import { FilterCondition, SearchCriteria } from './types';

type ChildType = { new (...args: any[]): DataProvider };

export abstract class DataProvider extends EventEmitter {
  static childType?: ChildType;

  constructor(protected dataSource: string) {
    super();
  }
  //

  setChildType(childType: ChildType) {
    DataProvider.childType = childType;
  }

  createInstance(): DataProvider {
    if (!DataProvider.childType) {
      throw new Error('Child type not linked');
    }
    return new DataProvider.childType();
  }

  protected abstract makeQuery(
    conditions: FilterCondition[],
  ): Record<string, any>;
  //
  abstract findProfiles(criteria: SearchCriteria): Promise<Profile[]>;
  //
  protected notifyDataChange(eventName: string, data: any): void {
    this.emit(eventName, data);
  }
}
