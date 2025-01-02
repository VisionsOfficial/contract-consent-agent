import { EventEmitter } from 'events';
import { FilterCondition, SearchCriteria } from './types';

export type DataProviderType = { new (...args: any[]): DataProvider };

export abstract class DataProvider extends EventEmitter {
  static childType?: DataProviderType;

  // eslint-disable-next-line no-unused-vars
  constructor(public dataSource: string) {
    super();
  }
  //

  // eslint-disable-next-line no-unused-vars
  abstract find(criteria: SearchCriteria): Promise<[]>;
  abstract findAll(): Promise<any[]>;
  // eslint-disable-next-line no-unused-vars
  abstract findOne(criteria: SearchCriteria): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  abstract findOneAndUpdate(criteria: SearchCriteria, data: any): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  abstract findOneAndPush(criteria: SearchCriteria, data: any): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  abstract findOneAndPull(criteria: SearchCriteria, data: any): Promise<any>;
  // eslint-disable-next-line no-unused-vars
  abstract create(data: unknown): Promise<unknown>;
  // eslint-disable-next-line no-unused-vars
  abstract delete(id: string): Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  abstract update(criteria: SearchCriteria, data: unknown): Promise<boolean>;

  static setChildType(childType: DataProviderType) {
    DataProvider.childType = childType;
  }

  static getChildType(): DataProviderType | undefined {
    return DataProvider.childType;
  }

  createInstance(): DataProvider {
    if (!DataProvider.childType) {
      throw new Error('Child type not linked');
    }
    return new DataProvider.childType();
  }

  async ensureReady(): Promise<void> {}

  protected abstract makeQuery(
    // eslint-disable-next-line no-unused-vars
    conditions: FilterCondition[],
  ): Record<string, any>;

  //
  protected notifyDataChange(eventName: string, data: any): void {
    this.emit(eventName, data);
  }
}
