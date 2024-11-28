import { DataProvider } from 'DataProvider';

export interface ProfilePolicy {
  policy: string;
  frequency: number;
}

export interface ProfilePreference {
  policies: ProfilePolicy[];
  ecosystems: string[];
  services: string[];
}
export interface ProfileRecommendation {
  policies: ProfilePolicy[];
  ecosystemContracts: any[];
  services: any[];
}

export interface ProfileMatching {
  policies: ProfilePolicy[];
  ecosystemContracts: any[];
  services: any[];
}

export interface ProfileConfigurations {
  allowRecommendation: boolean;
  allowPolicies: boolean;
}

export interface SearchCriteria {
  conditions: FilterCondition[];
  threshold: number;
  limit?: number;
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export enum FilterOperator {
  IN = 'IN',
  EQUALS = 'EQUALS',
  GT = 'GT',
  LT = 'LT',
  CONTAINS = 'CONTAINS',
  REGEX = 'REGEX',
}

export interface Provider {
  source?: string;
  watchChanges?: boolean;
  provider: DataProvider;
}

export interface DataProviderConfig {
  source: string;
  url: string;
  dbName: string;
  watchChanges?: boolean;
}

export interface ProfileDocument {
  url: string;
  configurations: any;
  recommendations?: any[];
  matching?: any[];
  preference?: any[];
}
