import { EventEmitter } from 'events';
import { Profile } from './Profile';
import { FilterCondition, SearchCriteria } from './types';

export type DataProviderType = { new (...args: any[]): DataProvider };

export abstract class DataProvider extends EventEmitter {
  static childType?: DataProviderType;

  constructor(public dataSource: string) {
    super();
  }
  //

  abstract find(criteria: SearchCriteria): Promise<[]>;
  abstract create(data: unknown): Promise<unknown>;

  static setChildType(childType: DataProviderType) {
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
  protected notifyDataChange(eventName: string, data: any): void {
    this.emit(eventName, data);
  }
}
