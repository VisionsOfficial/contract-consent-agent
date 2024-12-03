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

export namespace CAECode {
  export type Type =
    | 'SERVICE_RETRIEVAL_FAILED'
    | 'PREPARATION_FAILED'
    | 'PROFILE_SEARCH_FAILED';
  export const SERVICE_RETRIEVAL_FAILED: Type = 'SERVICE_RETRIEVAL_FAILED';
  export const PREPARATION_FAILED: Type = 'PREPARATION_FAILED';
  export const PROFILE_SEARCH_FAILED: Type = 'PROFILE_SEARCH_FAILED';
}

export interface ContractAgentError extends Error {
  code: CAECode.Type;
  context?: unknown;
}

export interface DataProviderResult<T> {
  success: boolean;
  data?: T;
  error?: ContractAgentError;
}

export interface ProfileUpdateResult {
  success: boolean;
  profileId: string;
  error?: ContractAgentError;
}

export type DataChangeEvent = {
  source: string;
  type: 'insert' | 'update' | 'delete';
  documentKey?: { _id: string };
  fullDocument?: unknown;
  updateDescription?: {
    updatedFields: unknown;
    removedFields?: string[];
  };
};
