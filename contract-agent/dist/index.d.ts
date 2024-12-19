import { Router } from 'express';
import { EventEmitter } from 'events';
import { MongoClient, Collection, Document, WithId } from 'mongodb';

declare const router$1: Router;

declare const router: Router;

type DataProviderType = {
    new (...args: any[]): DataProvider;
};
declare abstract class DataProvider extends EventEmitter {
    dataSource: string;
    static childType?: DataProviderType;
    constructor(dataSource: string);
    abstract find(criteria: SearchCriteria): Promise<[]>;
    abstract create(data: unknown): Promise<unknown>;
    abstract delete(id: string): Promise<boolean>;
    abstract update(criteria: SearchCriteria, data: unknown): Promise<boolean>;
    static setChildType(childType: DataProviderType): void;
    static getChildType(): DataProviderType | undefined;
    createInstance(): DataProvider;
    ensureReady(): Promise<void>;
    protected abstract makeQuery(conditions: FilterCondition[]): Record<string, any>;
    protected notifyDataChange(eventName: string, data: any): void;
}

interface ProfilePolicy {
    policy: string;
    frequency: number;
}
interface ProfilePreference {
    policies: ProfilePolicy[];
    ecosystems: string[];
    services: string[];
}
interface ProfileRecommendation {
    policies: ProfilePolicy[];
    ecosystemContracts: any[];
    services: any[];
}
interface ProfileMatching {
    policies: ProfilePolicy[];
    ecosystemContracts: any[];
    services: any[];
}
interface ProfileConfigurations {
    allowRecommendation: boolean;
    allowPolicies: boolean;
}
interface SearchCriteria {
    conditions: FilterCondition[];
    threshold: number;
    limit?: number;
}
interface FilterCondition {
    field: string;
    operator: FilterOperator;
    value: any;
}
declare enum FilterOperator {
    IN = "IN",
    EQUALS = "EQUALS",
    GT = "GT",
    LT = "LT",
    CONTAINS = "CONTAINS",
    REGEX = "REGEX"
}
interface Provider {
    source?: string;
    watchChanges?: boolean;
    provider: DataProvider;
    hostsProfiles?: boolean;
}
interface DataProviderConfig {
    source: string;
    url: string;
    dbName: string;
    watchChanges?: boolean;
    hostsProfiles?: boolean;
}
interface ProfileDocument {
    _id?: string;
    uri: string;
    configurations: any;
    recommendations?: any[];
    matching?: any[];
    preference?: any[];
}
type DataChangeEvent = {
    source: string;
    type: 'insert' | 'update' | 'delete';
    documentKey?: {
        _id: string;
    };
    fullDocument?: unknown;
    updateDescription?: {
        updatedFields: unknown;
        removedFields?: string[];
    };
};

type ProfileJSON = Omit<Pick<Profile, keyof Profile>, 'createdAt' | 'updatedAt'> & {
    createdAt?: string | Date;
    updatedAt?: string | Date;
};
declare class Profile {
    _id?: string;
    uri: string;
    configurations: ProfileConfigurations;
    recommendations: ProfileRecommendation[];
    matching: ProfileMatching[];
    preference: ProfilePreference[];
    constructor({ _id, uri, configurations, recommendations, matching, preference, }: ProfileJSON);
}

interface AgentConfig {
    dataProviderConfig: DataProviderConfig[];
}
declare abstract class Agent {
    protected static configPath: string;
    protected static profilesHost: string;
    protected config?: AgentConfig;
    protected dataProviders: Provider[];
    protected constructor();
    static setProfilesHost(profilesHost: string): void;
    static getProfileHost(): string;
    static setConfigPath(configPath: string, callerFilePath: string): void;
    protected setupProviderEventHandlers(): void;
    getDataProvider(source: string): DataProvider;
    protected abstract handleDataInserted(data: DataChangeEvent): Promise<void>;
    protected abstract handleDataUpdated(data: DataChangeEvent): Promise<void>;
    protected abstract handleDataDeleted(data: DataChangeEvent): void;
    abstract findProfiles(source: string, criteria: SearchCriteria): Promise<Profile[]>;
    addDataProviders(dataProviders: Provider[]): void;
    protected addDefaultProviders(): Promise<void>;
    protected loadDefaultConfiguration(): void;
    getRecommendations(profile: Profile): ProfileRecommendation[];
    getMatchings(profile: Profile): ProfileMatching[];
    abstract createProfileForParticipant(participantId: string): Promise<Profile>;
    abstract saveProfile(source: string, criteria: SearchCriteria, profile: Profile): Promise<boolean>;
    protected abstract updateMatchingForProfile(profile: Profile, data: unknown): Promise<void>;
    protected abstract updateRecommendationForProfile(profile: Profile, data: unknown): Promise<void>;
    protected abstract enrichProfileWithSystemRecommendations(): Profile;
}

/**
 * Represents the log levels for the Logger.
 * @typedef {'info' | 'warn' | 'error' | 'header'} LogLevel
 */
type LogLevel = 'info' | 'warn' | 'error' | 'header';
/**
 * Configuration options for the Logger.
 * @interface LoggerConfig
 * @property {boolean} [preserveLogs] - If true, logs will be preserved and passed to an external callback.
 * @property {function(LogLevel, string, string): void} [externalCallback] - A callback function to handle preserved logs.
 */
interface LoggerConfig {
    preserveLogs?: boolean;
    externalCallback?: (_level: LogLevel, _message: string, _timestamp: string) => void;
}
/**
 * Logger class for logging messages to the console and optionally to disk.
 */
declare class Logger {
    private static noPrint;
    private static config;
    /**
     * Configures the logger with the provided options.
     * @param {LoggerConfig} config - The configuration settings for the logger.
     */
    static configure(config: LoggerConfig): void;
    /**
     * Formats a log message with a timestamp and color based on the log level.
     * @param {LogLevel} level - The log level for the message.
     * @param {string} message - The message to format.
     * @returns {string} - The formatted log message.
     */
    private static formatMessage;
    /**
     * Logs a message with the specified log level.
     * @param {LogLevel} level - The log level of the message.
     * @param {string} message - The message to log.
     */
    private static log;
    /**
     * Logs an informational message.
     * @param {string | object} message - The message to log, can be a string or an object.
     */
    static info(message: string | object): void;
    /**
     * Logs a warning message.
     * @param {string | object} message - The message to log, can be a string or an object.
     */
    static warn(message: string | object): void;
    /**
     * Logs an error message.
     * @param {string | object} message - The message to log, can be a string or an object.
     */
    static error(message: string | object): void;
    /**
     * Logs a header message.
     * @param {string | object} message - The message to log, can be a string or an object.
     */
    static header(message: string | object): void;
}

/**
 * ContractAgent class handles contract-related operations and profile management
 * @extends Agent
 */
declare class ContractAgent extends Agent {
    private static instance;
    private constructor();
    /**
     * Prepares the ContractAgent instance by loading configuration and setting up providers
     * @throws {ContractAgentError} If preparation fails
     */
    prepare(): Promise<void>;
    /**
     * Retrieves or creates a ContractAgent instance
     * @param dataProviderType - Type of data provider to use
     * @param refresh - Whether to force create a new instance
     * @returns Promise<ContractAgent>
     */
    static retrieveService(dataProviderType?: DataProviderType, refresh?: boolean): Promise<ContractAgent>;
    /**
     * Enriches a profile with system recommendations
     * @throws {ContractAgentError} Method not implemented
     */
    protected enrichProfileWithSystemRecommendations(): Profile;
    /**
     * Finds profiles across all configured providers
     * @param criteria - Search criteria
     * @returns Promise<Profile[]>
     */
    findProfilesAcrossProviders(criteria: SearchCriteria): Promise<Profile[]>;
    /**
     * Updates profiles based on contract changes
     * @param contract - Contract instance
     * @returns Promise<void>
     */
    private updateProfileFromContractChange;
    /**
     * Updates profiles for all contract members
     * @param contract - Contract instance
     */
    private updateProfilesForMembers;
    /**
     * Updates profiles for all service offerings
     * @param contract - Contract instance
     */
    private updateProfilesForServiceOfferings;
    /**
     * Updates profile for contract orchestrator
     * @param contract - Contract instance
     */
    private updateProfileForOrchestrator;
    /**
     * Updates a single profile
     * @param participantId - Participant identifier
     * @param contract - Contract instance
     */
    private updateProfile;
    /**
     * Handles inserted data events
     * @param data - Data change event
     */
    protected handleDataInserted(data: DataChangeEvent): Promise<void>;
    /**
     * Handles updated data events
     * @param data - Data change event
     */
    protected handleDataUpdated(data: DataChangeEvent): Promise<void>;
    /**
     * Handles deleted data events
     * @param data - Data change event
     */
    protected handleDataDeleted(data: DataChangeEvent): void;
    /**
     * Updates matching information for a profile
     * @param profile - Profile instance
     * @param data - Matching data
     */
    protected updateMatchingForProfile(profile: Profile, data: unknown): Promise<void>;
    /**
     * Updates recommendations for a profile
     * @param profile - Profile instance
     * @param data - Recommendation data
     */
    protected updateRecommendationForProfile(profile: Profile, data: unknown): Promise<void>;
    /**
     * Finds profiles based on given criteria from a specific source
     * @param source - Data source identifier
     * @param criteria - Search criteria
     * @returns Promise<Profile[]>
     */
    findProfiles(source: string, criteria: SearchCriteria): Promise<Profile[]>;
    /**
     * Saves a profile to a specified data source
     * @param source - Data source identifier
     * @param criteria - Search criteria used to find the profile to update
     * @param profile - Profile to be saved
     * @returns Promise<boolean> - Indicates successful save operation
     */
    saveProfile(source: string, criteria: SearchCriteria, profile: Profile): Promise<boolean>;
    createProfileForParticipant(participantURI: string): Promise<Profile>;
}

declare class MongoDBProvider extends DataProvider {
    private static connections;
    private db?;
    private client?;
    private collection;
    private dbName;
    private connectionPromise?;
    constructor(config: DataProviderConfig);
    getClient(): MongoClient | undefined;
    getCollection(): Collection<Document>;
    private connectToDatabase;
    static disconnectFromDatabase(url: string, dbName: string): Promise<void>;
    ensureReady(): Promise<void>;
    private static createCollectionProxy;
    private setupCallbacks;
    protected makeQuery(conditions: FilterCondition[]): Record<string, any>;
    create(data: Document): Promise<WithId<Document>>;
    delete(id: string): Promise<boolean>;
    find(criteria: SearchCriteria): Promise<[]>;
    update(criteria: SearchCriteria, data: unknown): Promise<boolean>;
}

export { Agent, ContractAgent, router as ContractAgentRouter, type DataProviderConfig, type FilterCondition, Logger, MongoDBProvider, router$1 as NegotiationAgentRouter, Profile, type ProfileConfigurations, type ProfileDocument, type ProfileMatching, type ProfilePolicy, type ProfilePreference, type ProfileRecommendation, type Provider, type SearchCriteria };
