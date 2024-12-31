import { DataProvider } from './DataProvider';

export interface ProfilePolicy {
  policy: string;
  frequency: number;
}

export interface ProfilePreference {
  _id?: string;
  policies: ProfilePolicy[];
  ecosystems: string[];
  services: string[];
  participant?: string;
  category?: string;
  asDataProvider?: {
    authorizationLevel?: AuthorizationLevelEnum,
    conditions?: Condition[]
  };
  asServiceProvider?: {
    authorizationLevel?: AuthorizationLevelEnum,
    conditions?: Condition[]
  };
}

export interface ProfileRecommendation {
  policies?: ProfilePolicy[];
  ecosystemContracts?: any[];
  services?: any[];
  consents?: any[];
  dataExchanges?: any[];
}

export interface ConsentProfileRecommendation {
  consents?: any[];
  dataExchanges?: any[];
}

export interface ProfileMatching {
  policies: ProfilePolicy[];
  ecosystemContracts: any[];
  services: any[];
}

export interface ProfileConfigurations {
  allowRecommendations?: boolean;
  allowPolicies?: boolean;
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
  hostsProfiles?: boolean;
}

export interface DataProviderConfig {
  source: string;
  url: string;
  dbName: string;
  watchChanges?: boolean;
  hostsProfiles?: boolean;
}

export interface ProfileDocument {
  _id?: string;
  uri?: string;
  configurations: any;
  recommendations?: any[] | ConsentProfileRecommendation;
  matching?: any[];
  preference?: any[];
}

export interface ProfilePayload {
  configurations?: any;
  recommendations?: any[];
  matching?: any[];
  preference?: any[];
}

export namespace CAECode {
  export type Type =
    | 'SERVICE_RETRIEVAL_FAILED'
    | 'PREPARATION_FAILED'
    | 'PROFILE_SEARCH_FAILED'
    | 'PROFILE_SAVE_FAILED';
  export const SERVICE_RETRIEVAL_FAILED: Type = 'SERVICE_RETRIEVAL_FAILED';
  export const PREPARATION_FAILED: Type = 'PREPARATION_FAILED';
  export const PROFILE_SEARCH_FAILED: Type = 'PROFILE_SEARCH_FAILED';
  export const PROFILE_SAVE_FAILED: Type = 'PROFILE_SAVE_FAILED';
}

export interface ContractAgentError extends Error {
  code: CAECode.Type;
  context?: unknown;
}

export interface ConsentAgentError extends Error {
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

export type PreferencePayload = {
  participant: string,
  category: string,
  asDataProvider: {
    authorizationLevel?: AuthorizationLevelEnum,
    conditions?: Condition[]
  };
  asServiceProvider: {
    authorizationLevel?: AuthorizationLevelEnum,
    conditions?: Condition[]
  };
}

export type Condition = {
  time?: TimeCondition,
  location?: LocationCondition
}

export type TimeCondition = {
  dayOfWeek?: string[],
  startTime?: string,
  endTime?: string,
}

export type LocationCondition = {
  countryCode: string
}

export enum AuthorizationLevelEnum {
  NEVER = 'never',
  ALWAYS = 'always',
  CONDITIONAL = 'conditional',
}
