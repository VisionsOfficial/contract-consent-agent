"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Agent: () => Agent,
  ConsentAgent: () => ConsentAgent,
  ConsentAgentRouter: () => agent_consent_router_default,
  ContractAgent: () => ContractAgent,
  ContractAgentRouter: () => agent_contract_profile_router_default,
  Logger: () => Logger,
  MongoDBProvider: () => MongoDBProvider,
  MongooseProvider: () => MongooseProvider,
  NegotiationAgentRouter: () => agent_contract_negotiation_router_default,
  Profile: () => Profile
});
module.exports = __toCommonJS(index_exports);

// src/agent.contract.negotiation.router.ts
var import_express = require("express");

// src/Logger.ts
var import_fs = require("fs");
var import_path = require("path");
var import_util = require("util");
var Colors = {
  reset: "\x1B[0m",
  info: "\x1B[32m",
  // green
  warn: "\x1B[93m",
  // yellow
  error: "\x1B[31m",
  // red
  header: "\x1B[36m"
  // cyan
};
var Logger = class {
  /**
   * Configures the logger with the provided options.
   * @param {LoggerConfig} config - The configuration settings for the logger.
   */
  static configure(config) {
    this.config = __spreadValues(__spreadValues({}, this.config), config);
  }
  /**
   * Formats a log message with a timestamp and color based on the log level.
   * @param {LogLevel} level - The log level for the message.
   * @param {string} message - The message to format.
   * @returns {string} - The formatted log message.
   */
  static formatMessage(level, message) {
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${year}-${month}-${day}:${hours}.${minutes}.${seconds}`;
    return `${Colors[level]}${timestamp} [${level.toUpperCase()}]: ${message}${Colors.reset}
`;
  }
  /**
   * Logs a message with the specified log level.
   * @param {LogLevel} level - The log level of the message.
   * @param {string} message - The message to log.
   */
  static log(level, message) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const formattedMessage = this.formatMessage(level, message);
    if (!this.noPrint) {
      process.stdout.write(formattedMessage);
    }
    if (this.config.preserveLogs && this.config.externalCallback) {
      this.config.externalCallback(level, message, timestamp);
    }
  }
  /**
   * Logs an informational message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static info(message) {
    const msg = typeof message === "string" ? message : (0, import_util.format)(message);
    this.log("info", msg);
  }
  /**
   * Logs a warning message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static warn(message) {
    const msg = typeof message === "string" ? message : (0, import_util.format)(message);
    this.log("warn", msg);
  }
  /**
   * Logs an error message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static error(message) {
    const msg = typeof message === "string" ? message : (0, import_util.format)(message);
    this.log("error", msg);
  }
  /**
   * Logs a header message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static header(message) {
    const msg = typeof message === "string" ? message : (0, import_util.format)(message);
    this.log("header", msg);
  }
};
Logger.noPrint = false;
// Flag to disable console output
Logger.config = {
  preserveLogs: false
};
var DEFAULT_LOG_PATH = (0, import_path.join)(process.cwd(), "logs");
var logStream;
var getLogFileName = () => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  return `cca-${timestamp}.log`;
};
var initDiskLogger = () => {
  try {
    (0, import_fs.mkdirSync)(DEFAULT_LOG_PATH, { recursive: true });
    const logFile = (0, import_path.join)(DEFAULT_LOG_PATH, getLogFileName());
    logStream = (0, import_fs.createWriteStream)(logFile, { flags: "a" });
    return true;
  } catch (err) {
    process.stderr.write(`Failed to create log directory: ${err}
`);
    return false;
  }
};
var defaultDiskCallback = (level, message, timestamp) => {
  if (!logStream && !initDiskLogger()) {
    return;
  }
  const plainMessage = `${timestamp} [LOGGER][${level.toUpperCase()}]: ${message}
`;
  logStream.write(plainMessage);
};
Logger.configure({
  preserveLogs: true,
  externalCallback: defaultDiskCallback
});

// src/NegotiationService.ts
var NegotiationService = class _NegotiationService {
  static retrieveService(refresh = false) {
    if (!_NegotiationService.instance || refresh) {
      const instance = new _NegotiationService();
      _NegotiationService.instance = instance;
    }
    return _NegotiationService.instance;
  }
  /**
   * Checks if a policy is acceptable based on the profile preferences.
   * A policy is acceptable if it matches a profile's allowed policies
   * and has a frequency greater than 0.
   *
   * @param {Profile} profile - The profile to evaluate.
   * @param {Policy} policy - The policy to check.
   * @returns {boolean} - True if acceptable, otherwise false.
   */
  isPolicyAcceptable(profile, policy) {
    var _a;
    if (((_a = profile == null ? void 0 : profile.configurations) == null ? void 0 : _a.allowPolicies) === false) {
      Logger.info("Policies are not allowed by the profile configurations.");
      return false;
    }
    return profile.preference.some(
      (pref) => pref.policies.some(
        (p) => p.policy === policy.description && p.frequency > 0
      )
    );
  }
  /**
   * Checks if a service offering is acceptable based on the profile preferences.
   *
   * @param {Profile} profile - The profile to evaluate.
   * @param {ServiceOffering} serviceOffering - The service offering to check.
   * @returns {boolean} - True if acceptable, otherwise false.
   */
  isServiceAcceptable(profile, serviceOffering) {
    return profile.preference.some(
      (pref) => pref.services.includes(serviceOffering.serviceOffering)
    );
  }
  /**
   * Validates if all policies of a service offering are acceptable.
   * A service offering is considered acceptable if:
   * - The service is acceptable to the profile.
   * - All its policies are acceptable to the profile.
   *
   * @param {Profile} profile - The profile to evaluate.
   * @param {ServiceOffering} serviceOffering - The service offering to check.
   * @returns {boolean} - True if acceptable, otherwise false.
   */
  areServicePoliciesAcceptable(profile, serviceOffering) {
    return this.isServiceAcceptable(profile, serviceOffering) && serviceOffering.policies.every(
      (policy) => this.isPolicyAcceptable(profile, policy)
    );
  }
  /**
   * Determines if a contract can be accepted by the profile.
   * A contract is acceptable if:
   * - Its status is 'active' or 'signed'.
   * - All its service offerings and their policies are acceptable.
   *
   * @param {Profile} profile - The profile to evaluate.
   * @param {Contract} contract - The contract to evaluate.
   * @returns {boolean} - True if acceptable, otherwise false.
   */
  canAcceptContract(profile, contract) {
    if (contract.status !== "active" && contract.status !== "signed") {
      Logger.info("Contract is not active.");
      return false;
    }
    const acceptableServices = contract.serviceOfferings.every(
      (serviceOffering) => this.areServicePoliciesAcceptable(profile, serviceOffering)
    );
    return acceptableServices;
  }
  /**
   * Updates a profile's preferences by adding new valid preferences.
   * Valid preferences must:
   * - Be neither undefined nor null.
   * - Have policies, services, and ecosystems as arrays.
   */
  updateProfilePreferences(profile, preferences) {
    try {
      const validPreferences = preferences.filter(
        (pref) => pref !== void 0 && pref !== null && Array.isArray(pref.policies) && Array.isArray(pref.services) && Array.isArray(pref.ecosystems)
      );
      profile.preference = [...profile.preference, ...validPreferences];
      Logger.info(`Profile preferences updated for ${profile.uri}.`);
    } catch (error) {
      Logger.error(`Failed to update profile preferences: ${error}`);
    }
  }
  /**
   * Negotiates a contract by checking its compatibility with the profile.
   * Returns detailed information about the acceptability of the contract.
   *
   * @param {Profile} profile - The profile to evaluate.
   * @param {Contract} contract - The contract to negotiate.
   * @returns {object} - Details about contract acceptability.
   */
  negotiateContract(profile, contract) {
    try {
      const unacceptablePolicies = [];
      const unacceptableServices = [];
      contract.serviceOfferings.forEach((serviceOffering) => {
        if (!this.isServiceAcceptable(profile, serviceOffering)) {
          unacceptableServices.push(serviceOffering.serviceOffering);
        }
        serviceOffering.policies.forEach((policy) => {
          if (!this.isPolicyAcceptable(profile, policy)) {
            unacceptablePolicies.push(policy.description);
          }
        });
      });
      if (unacceptablePolicies.length > 0 || unacceptableServices.length > 0) {
        return {
          canAccept: false,
          reason: "Contract contains unacceptable policies or services",
          unacceptablePolicies,
          unacceptableServices
        };
      }
      if (!this.canAcceptContract(profile, contract)) {
        return {
          canAccept: false,
          reason: "Contract does not align with profile preferences"
        };
      }
      return { canAccept: true };
    } catch (error) {
      Logger.error(`Negotiation failed: ${error}`);
      return {
        canAccept: false,
        reason: "An error occurred during negotiation."
      };
    }
  }
};

// src/Profile.ts
var import_mongoose = __toESM(require("mongoose"));
var Profile = class {
  constructor({
    _id,
    uri,
    configurations,
    recommendations,
    matching = [],
    preference = []
  }) {
    this._id = _id;
    this.uri = uri;
    this.configurations = configurations;
    this.recommendations = recommendations;
    this.matching = matching;
    this.preference = preference;
  }
};
var ProfileSchema = new import_mongoose.Schema(
  {
    uri: { type: String, required: true },
    configurations: { type: import_mongoose.Schema.Types.Mixed, required: true },
    recommendations: { type: [import_mongoose.Schema.Types.Mixed], default: [] },
    matching: { type: [import_mongoose.Schema.Types.Mixed], default: [] },
    preference: { type: [import_mongoose.Schema.Types.Mixed], default: [] }
  },
  {
    timestamps: true
  }
);
var ProfileModel = import_mongoose.default.model(
  "Profile",
  ProfileSchema
);

// src/Contract.ts
var Contract = class {
  constructor({
    createdAt,
    updatedAt,
    ecosystem,
    members,
    orchestrator,
    purpose,
    revokedMembers,
    rolesAndObligations,
    serviceOfferings,
    status,
    _id
  }) {
    this._id = _id;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
    this.ecosystem = ecosystem;
    this.members = members;
    this.orchestrator = orchestrator;
    this.purpose = purpose;
    this.revokedMembers = revokedMembers;
    this.rolesAndObligations = rolesAndObligations;
    this.serviceOfferings = serviceOfferings;
    this.status = status;
  }
};

// src/types.ts
var CAECode;
((CAECode2) => {
  CAECode2.SERVICE_RETRIEVAL_FAILED = "SERVICE_RETRIEVAL_FAILED";
  CAECode2.PREPARATION_FAILED = "PREPARATION_FAILED";
  CAECode2.PROFILE_SEARCH_FAILED = "PROFILE_SEARCH_FAILED";
  CAECode2.PROFILE_SAVE_FAILED = "PROFILE_SAVE_FAILED";
})(CAECode || (CAECode = {}));

// src/DataProvider.ts
var import_events = require("events");
var DataProvider = class _DataProvider extends import_events.EventEmitter {
  // eslint-disable-next-line no-unused-vars
  constructor(dataSource) {
    super();
    this.dataSource = dataSource;
  }
  static setChildType(childType) {
    _DataProvider.childType = childType;
  }
  static getChildType() {
    return _DataProvider.childType;
  }
  createInstance() {
    if (!_DataProvider.childType) {
      throw new Error("Child type not linked");
    }
    return new _DataProvider.childType();
  }
  ensureReady() {
    return __async(this, null, function* () {
    });
  }
  //
  notifyDataChange(eventName, data) {
    this.emit(eventName, data);
  }
};

// src/Agent.ts
var fs = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var Agent = class _Agent {
  constructor() {
    this.dataProviders = [];
    if (!_Agent.configPath) {
      throw new Error("Config path not set");
    }
  }
  static setProfilesHost(profilesHost) {
    _Agent.profilesHost = profilesHost;
    if (!_Agent.profilesHost) {
      Logger.warn("using default profiles source");
      _Agent.profilesHost = "profiles";
    }
  }
  static getProfileHost() {
    return _Agent.profilesHost;
  }
  static setConfigPath(configPath, callerFilePath) {
    const fileDir = import_path2.default.dirname(callerFilePath);
    const agentConfigPath = import_path2.default.join(fileDir, configPath);
    _Agent.configPath = agentConfigPath;
  }
  setupProviderEventHandlers() {
    this.dataProviders.forEach(({ provider, watchChanges }) => {
      if (watchChanges !== false) {
        provider.on("dataInserted", this.handleDataInserted.bind(this));
        provider.on("dataUpdated", this.handleDataUpdated.bind(this));
        provider.on("dataDeleted", this.handleDataDeleted.bind(this));
      }
    });
  }
  getDataProvider(source) {
    var _a;
    const dataProvider = (_a = this.dataProviders.find(
      (provider) => provider.source === source
    )) == null ? void 0 : _a.provider;
    if (!dataProvider) {
      throw new Error(`DataProvider for source '${source}' not found.`);
    }
    return dataProvider;
  }
  addDataProviders(dataProviders) {
    if (!dataProviders || dataProviders.length === 0) {
      throw new Error("The dataProviders array cannot be empty.");
    }
    for (const dataProvider of dataProviders) {
      if (!dataProvider.provider) {
        continue;
      }
      dataProvider.source = dataProvider.provider.dataSource;
      if (dataProvider.hostsProfiles && dataProvider.source) {
        _Agent.setProfilesHost(dataProvider.source);
      }
    }
    this.dataProviders.push(...dataProviders);
  }
  addDefaultProviders() {
    return __async(this, null, function* () {
      if (!this.config) {
        Logger.warn("No configuration found. No data providers added.");
        return;
      }
      const providerType = DataProvider.childType;
      if (typeof providerType !== "function") {
        throw new Error("Invalid DataProvider type");
      }
      for (const dpConfig of this.config.dataProviderConfig) {
        try {
          const provider = new providerType(dpConfig);
          yield provider.ensureReady();
          const { watchChanges, source, hostsProfiles } = dpConfig;
          this.addDataProviders([
            {
              watchChanges,
              source,
              provider,
              hostsProfiles
            }
          ]);
        } catch (error) {
          Logger.error(
            `Failed to add data provider for source ${dpConfig.source}: ${error.message}`
          );
        }
      }
      if (this.config.existingDataCheck) {
        yield this.existingDataCheck();
      }
    });
  }
  loadDefaultConfiguration() {
    try {
      const configData = fs.readFileSync(_Agent.configPath, "utf-8");
      this.config = JSON.parse(configData);
      Logger.info("Configuration loaded successfully");
    } catch (error) {
      Logger.error(`Failed to load configuration: ${error.message}`);
      this.config = { dataProviderConfig: [] };
    }
  }
  getRecommendations(profile) {
    return profile.recommendations;
  }
  getMatchings(profile) {
    return profile.matching;
  }
  createProfileForParticipant(participantId) {
    return __async(this, null, function* () {
      try {
        if (!_Agent.profilesHost) {
          throw new Error(
            `Can't create profile for participant "profilesHost" is not set`
          );
        }
        const profileProvider = this.getDataProvider(_Agent.profilesHost);
        const newProfileData = {
          uri: participantId,
          configurations: {},
          recommendations: [],
          matching: []
        };
        const profile = yield profileProvider.create(newProfileData);
        return new Profile(profile);
      } catch (error) {
        Logger.error(`Error creating profile: ${error.message}`);
        throw new Error("Profile creation failed");
      }
    });
  }
};

// src/MongoDBProvider.ts
var import_mongodb = require("mongodb");
var MongoInterceptor = class _MongoInterceptor {
  constructor() {
    this.callbacks = /* @__PURE__ */ new Map();
    ["insert", "update", "delete"].forEach((op) => {
      this.callbacks.set(op, []);
    });
  }
  static getInstance() {
    if (!_MongoInterceptor.instance) {
      _MongoInterceptor.instance = new _MongoInterceptor();
    }
    return _MongoInterceptor.instance;
  }
  addCallback(changeType, callback) {
    const callbacks = this.callbacks.get(changeType) || [];
    callbacks.push(callback);
    this.callbacks.set(changeType, callbacks);
  }
  notifyCallbacks(changeType, collectionName, document) {
    const callbacks = this.callbacks.get(changeType) || [];
    callbacks.forEach((callback) => callback(collectionName, document));
  }
};
var _MongoDBProvider = class _MongoDBProvider extends DataProvider {
  findAll() {
    throw new Error("Method not implemented.");
  }
  constructor(config) {
    super(config.source);
    this.dbName = config.dbName;
    this.connectionPromise = this.connectToDatabase(config.url);
  }
  getClient() {
    return this.client;
  }
  getCollection() {
    return this.collection;
  }
  connectToDatabase(url) {
    return __async(this, null, function* () {
      if (!url) {
        throw new Error("Database URL is required");
      }
      const connectionKey = `${url}:${this.dbName}`;
      const existingConnection = _MongoDBProvider.connections.get(connectionKey);
      if (existingConnection) {
        Logger.info("Reusing existing MongoDB connection");
        this.db = existingConnection.db;
        this.client = existingConnection.client;
        return this.db;
      }
      try {
        const client = yield import_mongodb.MongoClient.connect(url);
        const db = client.db(this.dbName);
        Logger.info("MongoDB connected successfully");
        this.db = db;
        this.client = client;
        _MongoDBProvider.connections.set(connectionKey, { db, client });
        return db;
      } catch (error) {
        Logger.error(`Error connecting to MongoDB: ${error.message}`);
        throw error;
      }
    });
  }
  static disconnectFromDatabase(url, dbName) {
    return __async(this, null, function* () {
      const connectionKey = `${url}:${dbName}`;
      const existingConnection = _MongoDBProvider.connections.get(connectionKey);
      if (existingConnection) {
        try {
          yield existingConnection.client.close();
          _MongoDBProvider.connections.set(connectionKey, void 0);
          Logger.info(`MongoDB connection for ${connectionKey} closed`);
        } catch (error) {
          Logger.error(`Error during disconnect: ${error.message}`);
        }
      } else {
        Logger.warn(`No active connection found for ${connectionKey}`);
      }
    });
  }
  ensureReady(collection) {
    return __async(this, null, function* () {
      yield this.connectionPromise;
      this.collection = _MongoDBProvider.createCollectionProxy(
        collection || this.db.collection(this.dataSource)
      );
      this.setupCallbacks();
    });
  }
  static createCollectionProxy(collection) {
    const interceptor = MongoInterceptor.getInstance();
    const handler = {
      get(target, prop) {
        const original = target[prop];
        if (typeof original !== "function") return original;
        const cursorMethods = ["find", "aggregate"];
        if (cursorMethods.includes(prop)) {
          return function(...args) {
            return original.call(target, ...args);
          };
        }
        return function(...args) {
          return __async(this, null, function* () {
            const method = original;
            const result = yield method.apply(target, args);
            if (["insertOne", "save"].includes(prop)) {
              interceptor.notifyCallbacks("insert", collection.collectionName, {
                fullDocument: args[0],
                insertedId: result.insertedId,
                acknowledged: result.acknowledged
              });
            } else if (prop === "insertMany") {
              interceptor.notifyCallbacks("insert", collection.collectionName, {
                fullDocuments: args[0],
                insertedIds: result.insertedIds,
                acknowledged: result.acknowledged
              });
            } else if ([
              "updateOne",
              "updateMany",
              "replaceOne",
              "findOneAndUpdate",
              "findOneAndReplace"
            ].includes(prop)) {
              interceptor.notifyCallbacks("update", collection.collectionName, {
                filter: args[0],
                update: args[1],
                options: args[2],
                result
              });
            } else if (prop === "bulkWrite") {
              const operations = args[0];
              operations.forEach((op) => {
                var _a, _b, _c, _d, _e, _f;
                if (op.insertOne) {
                  interceptor.notifyCallbacks(
                    "insert",
                    collection.collectionName,
                    {
                      fullDocument: op.insertOne.document,
                      result
                    }
                  );
                } else if (op.updateOne || op.updateMany) {
                  interceptor.notifyCallbacks(
                    "update",
                    collection.collectionName,
                    {
                      filter: ((_a = op.updateOne) == null ? void 0 : _a.filter) || ((_b = op.updateMany) == null ? void 0 : _b.filter),
                      update: ((_c = op.updateOne) == null ? void 0 : _c.update) || ((_d = op.updateMany) == null ? void 0 : _d.update),
                      result
                    }
                  );
                } else if (op.deleteOne || op.deleteMany) {
                  interceptor.notifyCallbacks(
                    "delete",
                    collection.collectionName,
                    {
                      filter: ((_e = op.deleteOne) == null ? void 0 : _e.filter) || ((_f = op.deleteMany) == null ? void 0 : _f.filter),
                      result
                    }
                  );
                } else if (op.replaceOne) {
                  interceptor.notifyCallbacks(
                    "update",
                    collection.collectionName,
                    {
                      filter: op.replaceOne.filter,
                      replacement: op.replaceOne.replacement,
                      result
                    }
                  );
                }
              });
            } else if (["deleteOne", "deleteMany", "findOneAndDelete"].includes(
              prop
            )) {
              interceptor.notifyCallbacks("delete", collection.collectionName, {
                filter: args[0],
                options: args[1],
                result
              });
            }
            return result;
          });
        };
      }
    };
    return new Proxy(collection, handler);
  }
  setupCallbacks() {
    const interceptor = MongoInterceptor.getInstance();
    interceptor.addCallback("insert", (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange("dataInserted", {
          fullDocument: data.fullDocument,
          fullDocuments: data.fullDocuments,
          source: this.dataSource
        });
      }
    });
    interceptor.addCallback("update", (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange("dataUpdated", {
          documentKey: { _id: data.filter._id },
          updateDescription: { updatedFields: data.update.$set || {} },
          source: this.dataSource
        });
      }
    });
    interceptor.addCallback("delete", (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange("dataDeleted", {
          documentKey: { _id: data.filter._id },
          source: this.dataSource
        });
      }
    });
  }
  makeQuery(conditions) {
    return conditions.reduce((query, condition) => {
      switch (condition.operator) {
        case "IN" /* IN */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $in: condition.value }
          });
        case "EQUALS" /* EQUALS */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: condition.value
          });
        case "GT" /* GT */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $gt: condition.value }
          });
        case "LT" /* LT */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $lt: condition.value }
          });
        case "CONTAINS" /* CONTAINS */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: {
              $in: Array.isArray(condition.value) ? condition.value : [condition.value]
            }
          });
        case "REGEX" /* REGEX */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: {
              $in: Array.isArray(condition.value) ? condition.value.map((val) => new RegExp(val, "i")) : [new RegExp(condition.value, "i")]
            }
          });
        default:
          throw new Error(`Unsupported operator: ${condition.operator}`);
      }
    }, {});
  }
  create(data) {
    return __async(this, null, function* () {
      try {
        const result = yield this.collection.insertOne(data);
        if (!result.acknowledged) {
          throw new Error("Document insertion was not acknowledged");
        }
        return __spreadProps(__spreadValues({}, data), { _id: result.insertedId });
      } catch (error) {
        Logger.info(
          `Error during document insertion: ${error.message}`
        );
        throw error;
      }
    });
  }
  delete(id) {
    return __async(this, null, function* () {
      try {
        const result = yield this.collection.deleteOne({ _id: new import_mongodb.ObjectId(id) });
        if (result.deletedCount === 0) {
          Logger.warn(`No document found with id: ${id}`);
          return false;
        }
        Logger.info(`Document with id: ${id} successfully deleted`);
        return true;
      } catch (error) {
        Logger.error(
          `Error during document deletion: ${error.message}`
        );
        throw error;
      }
    });
  }
  find(criteria) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      const data = yield this.collection.find(query).limit(criteria.limit || 0).toArray();
      return data.map((item) => {
        if (item._id) {
          const _a = item, { _id } = _a, rest = __objRest(_a, ["_id"]);
          return __spreadValues({
            _id: _id.toString()
          }, rest);
        }
        return item;
      });
    });
  }
  update(criteria, data) {
    return __async(this, null, function* () {
      try {
        const updateData = data;
        const query = this.makeQuery(criteria.conditions);
        const result = yield this.collection.updateOne(query, {
          $set: updateData
        });
        if (result.matchedCount === 0) {
          Logger.warn(`No document found matching the criteria`);
          return false;
        }
        if (result.modifiedCount === 0) {
          Logger.info(`No changes made to document`);
          return false;
        }
        Logger.info(`Document successfully updated`);
        return true;
      } catch (error) {
        Logger.error(`Error during document update: ${error.message}`);
        throw error;
      }
    });
  }
  findOne(criteria) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      const data = yield this.collection.findOne(query);
      return data;
    });
  }
  findOneAndUpdate(criteria, data) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      return yield this.collection.findOneAndUpdate(query, { $set: data }, { returnDocument: "after" });
    });
  }
  findOneAndPush(criteria, data) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      Object.keys(data).map((key) => {
        data[key].map((element) => element._id = new import_mongodb.ObjectId());
        data[key] = { $each: data[key] };
      });
      return yield this.collection.findOneAndUpdate(query, { $push: data }, { returnDocument: "after" });
    });
  }
  findOneAndPull(criteria, data) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      return yield this.collection.findOneAndUpdate(query, { $pull: data }, { returnDocument: "after" });
    });
  }
};
_MongoDBProvider.connections = /* @__PURE__ */ new Map();
var MongoDBProvider = _MongoDBProvider;

// src/MatchingService.ts
var MatchingService = class _MatchingService {
  static retrieveService(refresh = false) {
    if (!_MatchingService.instance || refresh) {
      const instance = new _MatchingService();
      _MatchingService.instance = instance;
    }
    return _MatchingService.instance;
  }
  updateProfile(profile, data) {
    return __async(this, null, function* () {
      try {
        const contract = data;
        const otherParticipantsServices = contract.serviceOfferings.filter(
          (service) => service.participant !== profile.uri
        );
        if (!otherParticipantsServices.length) return;
        const currentRecommendation = profile.recommendations[0];
        if (!currentRecommendation) {
          Logger.error("No recommendations available to compare against.");
          return;
        }
        let matchingEntry = profile.matching[0];
        if (!matchingEntry) {
          matchingEntry = {
            policies: [],
            ecosystemContracts: [],
            services: []
          };
          profile.matching.push(matchingEntry);
        }
        otherParticipantsServices.forEach((service) => {
          var _a, _b;
          (_a = service.policies) == null ? void 0 : _a.forEach((policy) => {
            var _a2;
            const matchingPolicy = (_a2 = currentRecommendation == null ? void 0 : currentRecommendation.policies) == null ? void 0 : _a2.find(
              (recPolicy) => recPolicy.policy === policy.description
            );
            if (matchingPolicy) {
              const existingMatchingPolicy = matchingEntry.policies.find(
                (mp) => mp.policy === policy.description
              );
              if (existingMatchingPolicy) {
                existingMatchingPolicy.frequency += 1;
              } else {
                matchingEntry.policies.push({
                  policy: policy.description,
                  frequency: 1
                });
              }
            }
          });
          const matchingService = (_b = currentRecommendation == null ? void 0 : currentRecommendation.services) == null ? void 0 : _b.find(
            (recService) => recService.serviceOffering === service.serviceOffering
          );
          if (matchingService) {
            const existingMatchingService = matchingEntry.services.find(
              (ms) => ms.serviceOffering === service.serviceOffering
            );
            if (existingMatchingService) {
              existingMatchingService.frequency += 1;
            } else {
              matchingEntry.services.push({
                serviceOffering: service.serviceOffering,
                frequency: 1
              });
            }
          }
        });
        if (!matchingEntry.ecosystemContracts.includes(contract._id)) {
          matchingEntry.ecosystemContracts.push(contract._id);
        }
        profile.matching[0] = matchingEntry;
      } catch (error) {
        Logger.error(
          `Profile matching update failed: ${error.message}`
        );
      }
    });
  }
};

// src/RecommendationService.ts
var RecommendationService = class _RecommendationService {
  static retrieveService(refresh = false) {
    if (!_RecommendationService.instance || refresh) {
      const instance = new _RecommendationService();
      _RecommendationService.instance = instance;
    }
    return _RecommendationService.instance;
  }
  updateProfile(profile, data) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      try {
        const contract = data;
        const newPolicyDescriptions = this.collectPolicyDescriptionsForParticipant(contract, (_a = profile.uri) != null ? _a : "");
        const newServiceOfferings = this.collectServiceOfferingsForParticipant(
          contract,
          (_b = profile.uri) != null ? _b : ""
        );
        const contractId = contract._id;
        let recommendation = profile.recommendations[0];
        if (!recommendation) {
          recommendation = {
            policies: [],
            ecosystemContracts: [],
            services: []
          };
          profile.recommendations.push(recommendation);
        }
        newPolicyDescriptions.forEach((newPolicyDescription) => {
          var _a2;
          const existingPolicy = (_a2 = recommendation.policies) == null ? void 0 : _a2.find(
            (p) => p.policy === newPolicyDescription
          );
          if (existingPolicy) {
            existingPolicy.frequency += 1;
          } else {
            recommendation.policies = recommendation.policies || [];
            recommendation.policies.push({
              policy: newPolicyDescription,
              frequency: 1
            });
          }
        });
        if (contractId && !((_c = recommendation == null ? void 0 : recommendation.ecosystemContracts) == null ? void 0 : _c.includes(contractId))) {
          (_d = recommendation == null ? void 0 : recommendation.ecosystemContracts) == null ? void 0 : _d.push(contractId);
        }
        newServiceOfferings.forEach((newServiceOffering) => {
          var _a2;
          const existingService = (_a2 = recommendation.services) == null ? void 0 : _a2.find(
            (s) => s.serviceOffering === newServiceOffering
          );
          if (existingService) {
            existingService.frequency += 1;
          } else {
            recommendation.services = recommendation.services || [];
            recommendation.services.push({
              serviceOffering: newServiceOffering,
              frequency: 1
            });
          }
        });
        profile.recommendations[0] = recommendation;
      } catch (error) {
        Logger.error(
          `Profile recommendation update failed: ${error.message}`
        );
      }
    });
  }
  collectPolicyDescriptionsForParticipant(contract, participantUri) {
    var _a;
    const descriptions = /* @__PURE__ */ new Set();
    (_a = contract.serviceOfferings) == null ? void 0 : _a.forEach((service) => {
      var _a2;
      if (service.participant === participantUri) {
        (_a2 = service.policies) == null ? void 0 : _a2.forEach((policy) => {
          if (policy == null ? void 0 : policy.description) {
            descriptions.add(policy.description);
          }
        });
      }
    });
    return Array.from(descriptions);
  }
  collectServiceOfferingsForParticipant(contract, participantUri) {
    var _a;
    const services = /* @__PURE__ */ new Set();
    (_a = contract.serviceOfferings) == null ? void 0 : _a.forEach((service) => {
      if (service.participant === participantUri && service.serviceOffering) {
        services.add(service.serviceOffering);
      }
    });
    return Array.from(services);
  }
};

// src/ContractAgent.ts
var import_crypto = require("crypto");
var _ContractAgent = class _ContractAgent extends Agent {
  constructor() {
    super();
    this._uid = (0, import_crypto.randomUUID)();
  }
  /**
   * Prepares the ContractAgent instance by loading configuration and setting up providers
   * @throws {ContractAgentError} If preparation fails
   */
  prepare() {
    return __async(this, null, function* () {
      try {
        this.loadDefaultConfiguration();
        yield this.addDefaultProviders();
        this.setupProviderEventHandlers();
      } catch (error) {
        const agentError = {
          name: "PreparationError",
          message: `Failed to prepare ContractAgent: ${error.message}`,
          code: CAECode.PREPARATION_FAILED
        };
        Logger.error(agentError.message);
        throw agentError;
      }
    });
  }
  /**
   * Retrieves or creates a ContractAgent instance
   * @param dataProviderType - Type of data provider to use
   * @param refresh - Whether to force create a new instance
   * @returns Promise<ContractAgent>
   */
  static retrieveService() {
    return __async(this, arguments, function* (dataProviderType = MongoDBProvider, refresh = false) {
      try {
        if (!_ContractAgent.instance || refresh) {
          DataProvider.setChildType(dataProviderType);
          const instance = new _ContractAgent();
          yield instance.prepare();
          _ContractAgent.instance = instance;
        }
        const dpChildType = DataProvider.getChildType();
        if (!dpChildType) {
          Logger.warn("Data Provider Type not set");
        }
        return _ContractAgent.instance;
      } catch (error) {
        const serviceError = {
          name: "ServiceRetrievalError",
          message: `Failed to retrieve ContractAgent service: ${error.message}`,
          code: CAECode.SERVICE_RETRIEVAL_FAILED
        };
        Logger.error(serviceError.message);
        throw serviceError;
      }
    });
  }
  /**
   * Enriches a profile with system recommendations
   * @throws {ContractAgentError} Method not implemented
   */
  enrichProfileWithSystemRecommendations() {
    throw new Error("Method not implemented.");
  }
  /**
   * Enriches a profile with system recommendations
   * @throws {ContractAgentError} Method not implemented
   */
  existingDataCheck() {
    throw new Error("Method not implemented.");
  }
  /**
   * Finds profiles across all configured providers
   * @param criteria - Search criteria
   * @returns Promise<Profile[]>
   */
  findProfilesAcrossProviders(criteria) {
    return __async(this, null, function* () {
      const allProfiles = [];
      if (!this.config) {
        throw new Error("Configuration is not initialized");
      }
      Logger.info(
        `Searching across data sources: ${this.config.dataProviderConfig.map((config) => config.source).join(", ")}`
      );
      for (const dataProvider of this.dataProviders) {
        const { source } = dataProvider;
        if (!source) {
          throw new Error("Provider source is undefined");
        }
        const profiles = yield this.findProfiles(source, criteria);
        allProfiles.push(...profiles);
      }
      return allProfiles;
    });
  }
  /**
   * Updates profiles based on contract changes
   * @param contract - Contract instance
   * @returns Promise<void>
   */
  updateProfileFromContractChange(contract) {
    return __async(this, null, function* () {
      if (!contract) {
        throw new Error("Contract is undefined");
      }
      Logger.info("updating profiles for members...");
      yield this.updateProfilesForMembers(contract);
      Logger.info("updating profiles for offerings...");
      yield this.updateProfilesForServiceOfferings(contract);
      Logger.info("updating profiles for orchestrator...");
      yield this.updateProfileForOrchestrator(contract);
      this.signalUpdate();
    });
  }
  signalUpdate() {
  }
  /**
   * Updates profiles for all contract members
   * @param contract - Contract instance
   */
  updateProfilesForMembers(contract) {
    return __async(this, null, function* () {
      var _a, _b;
      for (const member of contract.members) {
        if ((_a = member == null ? void 0 : member.participant) == null ? void 0 : _a.length) {
          yield this.updateProfile(member.participant, contract);
        }
      }
      if (!((_b = contract == null ? void 0 : contract.members) == null ? void 0 : _b.length)) {
        Logger.warn("no members found, 0 profile updated");
      } else {
        Logger.info(`${contract.members.length} profiles found for members`);
      }
    });
  }
  /**
   * Updates profiles for all service offerings
   * @param contract - Contract instance
   */
  updateProfilesForServiceOfferings(contract) {
    return __async(this, null, function* () {
      var _a, _b;
      const uniqueParticipants = /* @__PURE__ */ new Set();
      for (const offering of contract.serviceOfferings || []) {
        if ((_a = offering == null ? void 0 : offering.participant) == null ? void 0 : _a.length) {
          uniqueParticipants.add(offering.participant);
          yield this.updateProfile(offering.participant, contract);
        }
      }
      const offeringsCount = ((_b = contract.serviceOfferings) == null ? void 0 : _b.length) || 0;
      if (!offeringsCount) {
        Logger.warn("no service offerings found, 0 profile updated");
      } else {
        Logger.info(
          `${offeringsCount} service offerings with ${uniqueParticipants.size} unique participants processed`
        );
      }
    });
  }
  /**
   * Updates profile for contract orchestrator
   * @param contract - Contract instance
   */
  updateProfileForOrchestrator(contract) {
    return __async(this, null, function* () {
      var _a;
      if ((_a = contract == null ? void 0 : contract.orchestrator) == null ? void 0 : _a.length) {
        yield this.updateProfile(contract.orchestrator, contract);
        Logger.info("Profile updated for orchestrator");
      } else {
        Logger.warn("no orchestrator found, 0 profile updated");
      }
    });
  }
  /**
   * Updates a single profile
   * @param participantId - Participant identifier
   * @param contract - Contract instance
   */
  updateProfile(participantId, contract) {
    return __async(this, null, function* () {
      var _a;
      try {
        const profileProvider = this.dataProviders.find(
          (dataProvider) => dataProvider.source === "profiles"
        );
        if (!profileProvider) {
          throw new Error("Profile DataProvider not found");
        }
        const conditions = {
          field: "uri",
          operator: "EQUALS" /* EQUALS */,
          value: participantId
        };
        const criteria = {
          conditions: [conditions],
          threshold: 0
        };
        const source = profileProvider.source;
        if (!source) {
          throw new Error('Provider "source" is undefined');
        }
        const profiles = yield this.findProfiles(source, criteria);
        const profile = (_a = profiles[0]) != null ? _a : yield this.createProfileForParticipant(participantId);
        yield this.updateRecommendationForProfile(profile, contract);
        yield this.updateMatchingForProfile(profile, contract);
      } catch (error) {
        Logger.error(`Update profile failed: ${error.message}`);
        throw error;
      }
    });
  }
  /**
   * Handles inserted data events
   * @param data - Data change event
   */
  handleDataInserted(data) {
    return __async(this, null, function* () {
      if (data.source === "contracts" && data.fullDocument) {
        try {
          yield this.updateProfileFromContractChange(
            data.fullDocument
          );
          Logger.info(`Data inserted for source: ${data.source}`);
        } catch (error) {
          Logger.error(`Data insertion failed: ${error.message}`);
          throw error;
        }
      } else {
        Logger.info(`Unhandled data insertion for source: ${data.source}`);
      }
    });
  }
  /**
   * Handles updated data events
   * @param data - Data change event
   */
  handleDataUpdated(data) {
    return __async(this, null, function* () {
      var _a;
      if (data.source === "contracts" && ((_a = data.updateDescription) == null ? void 0 : _a.updatedFields)) {
        yield this.updateProfileFromContractChange(
          data.updateDescription.updatedFields
        );
      } else {
        Logger.info(`Unhandled data update for source: ${data.source}`);
      }
    });
  }
  /**
   * Handles deleted data events
   * @param data - Data change event
   */
  handleDataDeleted(data) {
    var _a;
    if (data.source === "contracts") {
      Logger.info(`Removing contract: ${(_a = data.documentKey) == null ? void 0 : _a._id}`);
    } else {
      Logger.info(`Unhandled data deletion for source: ${data.source}`);
    }
  }
  /**
   * Updates matching information for a profile
   * @param profile - Profile instance
   * @param data - Matching data
   */
  updateMatchingForProfile(profile, data) {
    return __async(this, null, function* () {
      const matchingService = MatchingService.retrieveService();
      yield matchingService.updateProfile(profile, data);
    });
  }
  /**
   * Updates recommendations for a profile
   * @param profile - Profile instance
   * @param data - Recommendation data
   */
  updateRecommendationForProfile(profile, data) {
    return __async(this, null, function* () {
      try {
        const recommendationService = RecommendationService.retrieveService();
        yield recommendationService.updateProfile(profile, data);
        const criteria = {
          conditions: [
            {
              field: "uri",
              operator: "EQUALS" /* EQUALS */,
              value: profile.uri
            }
          ],
          threshold: 0
        };
        const saved = yield this.saveProfile("profiles", criteria, profile);
        if (!saved) {
          throw new Error(`Failed to save updated profile: ${profile.uri}`);
        }
        Logger.info(
          `Recommendations updated and profile saved for: ${profile.uri}`
        );
      } catch (error) {
        Logger.error(
          `Error updating recommendations for profile: ${error.message}`
        );
        throw error;
      }
    });
  }
  /**
   * Finds profiles based on given criteria from a specific source
   * @param source - Data source identifier
   * @param criteria - Search criteria
   * @returns Promise<Profile[]>
   */
  findProfiles(source, criteria) {
    return __async(this, null, function* () {
      try {
        const dataProvider = this.getDataProvider(source);
        if (!dataProvider) {
          throw new Error(`Data provider not found for source: ${source}`);
        }
        const results = yield dataProvider.find(criteria);
        return results.map((result) => {
          const profileData = {
            _id: result._id,
            uri: result.uri,
            configurations: result.configurations,
            recommendations: result.recommendations || [],
            matching: result.matching || [],
            preference: result.preference || []
          };
          return new Profile(profileData);
        });
      } catch (error) {
        const searchError = {
          name: "ProfileSearchError",
          message: `Failed to find profiles: ${error.message}`,
          code: CAECode.PROFILE_SEARCH_FAILED,
          context: { source, criteria }
        };
        Logger.error(searchError.message);
        throw searchError;
      }
    });
  }
  /**
   * Saves a profile to a specified data source
   * @param source - Data source identifier
   * @param criteria - Search criteria used to find the profile to update
   * @param profile - Profile to be saved
   * @returns Promise<boolean> - Indicates successful save operation
   */
  saveProfile(source, criteria, profile) {
    return __async(this, null, function* () {
      try {
        const dataProvider = this.getDataProvider(source);
        if (!dataProvider) {
          throw new Error(`Data provider not found for source: ${source}`);
        }
        const profileDocument = {
          uri: profile.uri,
          configurations: profile.configurations,
          recommendations: profile.recommendations || [],
          matching: profile.matching || [],
          preference: profile.preference || []
        };
        const updateResult = yield dataProvider.update(criteria, profileDocument);
        if (!updateResult) {
          Logger.warn(
            `No profile found matching criteria to update for source: ${source}`
          );
          return false;
        }
        Logger.info(`Profile saved successfully to source: ${source}`);
        return true;
      } catch (error) {
        const saveError = {
          name: "ProfileSaveError",
          message: `Failed to save profile: ${error.message}`,
          code: CAECode.PROFILE_SAVE_FAILED,
          context: { source, profile }
        };
        Logger.error(saveError.message);
        throw saveError;
      }
    });
  }
  createProfileForParticipant(participantURI) {
    return __async(this, null, function* () {
      try {
        if (!Agent.profilesHost) {
          throw new Error(
            `Can't create profile for participant "profilesHost" is not set`
          );
        }
        const criteria = {
          conditions: [
            {
              field: "uri",
              operator: "EQUALS" /* EQUALS */,
              value: participantURI
            }
          ],
          threshold: 0
        };
        const existingProfile = yield this.findProfiles("profiles", criteria);
        if ((existingProfile == null ? void 0 : existingProfile.length) && existingProfile[0]) {
          Logger.warn(
            `Profile already exists for participant: ${participantURI}`
          );
          return existingProfile[0];
        }
        const profileProvider = this.getDataProvider(Agent.profilesHost);
        const newProfileData = {
          uri: participantURI,
          configurations: {},
          recommendations: [],
          matching: []
        };
        const profile = yield profileProvider.create(newProfileData);
        const newProfile = new Profile(profile);
        const saved = yield this.saveProfile("profiles", criteria, newProfile);
        if (!saved) {
          throw new Error(`Failed to save new profile for: ${participantURI}`);
        }
        Logger.info(`New profile created and saved for: ${participantURI}`);
        return newProfile;
      } catch (error) {
        Logger.error(`Error creating profile: ${error.message}`);
        throw new Error("Profile creation failed");
      }
    });
  }
};
_ContractAgent.instance = null;
var ContractAgent = _ContractAgent;

// src/agent.contract.negotiation.router.ts
var router = (0, import_express.Router)();
var negotiationService = NegotiationService.retrieveService();
function fetchProfileById(profileId) {
  return __async(this, null, function* () {
    const criteria = {
      conditions: [
        {
          field: "uri",
          operator: "EQUALS" /* EQUALS */,
          value: profileId
        }
      ],
      threshold: 0
    };
    const contractAgent = yield ContractAgent.retrieveService();
    const profilesHost = Agent.getProfileHost();
    if (!profilesHost) {
      throw new Error("Fetch Profile by Id: profiles host not set");
    }
    const profiles = yield contractAgent.findProfiles(profilesHost, criteria);
    if (profiles.length === 0) {
      throw new Error(`Profile not found for ID: ${profileId}`);
    }
    return new Profile(profiles[0]);
  });
}
router.post(
  "/negotiation/contract/acceptance",
  (req, res) => __async(void 0, null, function* () {
    try {
      const { profileId, contractData } = req.body;
      const profile = yield fetchProfileById(profileId);
      const contract = new Contract(contractData);
      const canAccept = negotiationService.canAcceptContract(profile, contract);
      res.json({ canAccept });
    } catch (error) {
      Logger.error(`Error in contract acceptance check: ${error}`);
      res.status(500).json({ error: error.message });
    }
  })
);
router.post(
  "/negotiation/policy/acceptance",
  (req, res) => __async(void 0, null, function* () {
    try {
      const { profileId, policyData } = req.body;
      const profile = yield fetchProfileById(profileId);
      const policy = policyData;
      const isAcceptable = negotiationService.isPolicyAcceptable(
        profile,
        policy
      );
      res.json({ isAcceptable });
    } catch (error) {
      Logger.error(`Error in policy acceptance check: ${error}`);
      res.status(500).json({ error: error.message });
    }
  })
);
router.post(
  "/negotiation/service/acceptance",
  (req, res) => __async(void 0, null, function* () {
    try {
      const { profileId, serviceData } = req.body;
      const profile = yield fetchProfileById(profileId);
      const serviceOffering = serviceData;
      const isAcceptable = negotiationService.isServiceAcceptable(
        profile,
        serviceOffering
      );
      res.json({ isAcceptable });
    } catch (error) {
      Logger.error(`Error in service acceptance check: ${error}`);
      res.status(500).json({ error: error.message });
    }
  })
);
router.post(
  "/negotiation/contract/negotiate",
  (req, res) => __async(void 0, null, function* () {
    try {
      const { profileId, contractData } = req.body;
      const profile = yield fetchProfileById(profileId);
      const contract = new Contract(contractData);
      const negotiationResult = negotiationService.negotiateContract(
        profile,
        contract
      );
      res.json(negotiationResult);
    } catch (error) {
      Logger.error(`Error in contract negotiation: ${error}`);
      res.status(500).json({ error: error.message });
    }
  })
);
router.put(
  "/negotiation/profile/preferences",
  (req, res) => __async(void 0, null, function* () {
    try {
      const { profileId, preferences } = req.body;
      const profile = yield fetchProfileById(profileId);
      negotiationService.updateProfilePreferences(profile, preferences);
      res.json({ message: "Profile preferences updated successfully." });
    } catch (error) {
      Logger.error(`Error in updating profile preferences: ${error}`);
      res.status(500).json({ error: error.message });
    }
  })
);
var agent_contract_negotiation_router_default = router;

// src/ContractAgentHandler.ts
var _RequestHandler = class _RequestHandler {
  constructor() {
    this.profilesHost = "";
  }
  static retrieveService() {
    return __async(this, null, function* () {
      if (!_RequestHandler.instance) {
        const instance = new _RequestHandler();
        yield instance.prepare();
        _RequestHandler.instance = instance;
      }
      return _RequestHandler.instance;
    });
  }
  prepare() {
    return __async(this, null, function* () {
      this.contractAgent = yield ContractAgent.retrieveService();
      this.profilesHost = Agent.getProfileHost();
      if (!this.profilesHost) {
        throw new Error("Contract Request Handler: Profiles Host not set");
      }
    });
  }
  getContractAgent() {
    return __async(this, null, function* () {
      return ContractAgent.retrieveService();
    });
  }
  // Return only the policies from recommendations
  getPoliciesRecommendationFromProfile(profileURI) {
    return __async(this, null, function* () {
      try {
        const criteria = {
          conditions: [
            {
              field: "uri",
              operator: "EQUALS" /* EQUALS */,
              value: profileURI
            }
          ],
          threshold: 0
        };
        if (!this.contractAgent) {
          throw new Error("Contract Agent undefined");
        }
        const profiles = yield this.contractAgent.findProfiles(
          this.profilesHost,
          criteria
        );
        if (profiles.length === 0) {
          throw new Error(`Profile not found, profileURI: ${profileURI}`);
        }
        return profiles[0].recommendations.map((rec) => rec.policies);
      } catch (error) {
        Logger.error(error.message);
      }
    });
  }
  // Return only the services from recommendations
  getServicesRecommendationFromProfile(profileId) {
    return __async(this, null, function* () {
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.contractAgent) {
        throw new Error("Contract Agent undefined");
      }
      const profiles = yield this.contractAgent.findProfiles(
        this.profilesHost,
        criteria
      );
      if (profiles.length === 0) {
        throw new Error("Profile not found");
      }
      return profiles[0].recommendations.map((rec) => rec.services);
    });
  }
  // Return only the policies from matching
  getPoliciesMatchingFromProfile(profileId) {
    return __async(this, null, function* () {
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.contractAgent) {
        throw new Error("Contract Agent undefined");
      }
      const profiles = yield this.contractAgent.findProfiles(
        this.profilesHost,
        criteria
      );
      if (profiles.length === 0) {
        throw new Error("Profile not found");
      }
      return profiles[0].matching.map((match) => match.policies);
    });
  }
  // Return only the services from matching
  getServicesMatchingFromProfile(profileId) {
    return __async(this, null, function* () {
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.contractAgent) {
        throw new Error("Contract Agent undefined");
      }
      const profiles = yield this.contractAgent.findProfiles(
        this.profilesHost,
        criteria
      );
      if (profiles.length === 0) {
        throw new Error("Profile not found");
      }
      return profiles[0].matching.map((match) => match.services);
    });
  }
  // Return only the ecosystemContracts from matching
  getContractMatchingFromProfile(profileId) {
    return __async(this, null, function* () {
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.contractAgent) {
        throw new Error("Contract Agent undefined");
      }
      const profiles = yield this.contractAgent.findProfiles(
        this.profilesHost,
        criteria
      );
      if (profiles.length === 0) {
        throw new Error("Profile not found");
      }
      return profiles[0].matching.map((match) => match.ecosystemContracts);
    });
  }
  // configurations
  getConfigurationsFromProfile(profileURI) {
    return __async(this, null, function* () {
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURI
          }
        ],
        threshold: 0
      };
      if (!this.contractAgent) {
        throw new Error("Contract Agent undefined");
      }
      const profiles = yield this.contractAgent.findProfiles(
        this.profilesHost,
        criteria
      );
      if (profiles.length === 0) {
        throw new Error("Profile not found");
      }
      return profiles[0].configurations;
    });
  }
  addConfigurationsToProfile(profileURI, configurations) {
    return __async(this, null, function* () {
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURI
          }
        ],
        threshold: 0
      };
      if (!this.contractAgent) {
        throw new Error("Contract Agent undefined");
      }
      const profiles = yield this.contractAgent.findProfiles(
        this.profilesHost,
        criteria
      );
      if (profiles.length === 0) {
        throw new Error("Profile not found");
      }
      const profile = profiles[0];
      profile.configurations = __spreadValues(__spreadValues({}, profile.configurations), configurations);
      yield this.contractAgent.saveProfile(this.profilesHost, criteria, profile);
      return { message: "Configurations added successfully", profile };
    });
  }
  updateConfigurationsForProfile(profileId, configurations) {
    return __async(this, null, function* () {
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.contractAgent) {
        throw new Error("Contract Agent undefined");
      }
      const profiles = yield this.contractAgent.findProfiles(
        this.profilesHost,
        criteria
      );
      if (profiles.length === 0) {
        throw new Error("Profile not found");
      }
      const profile = profiles[0];
      profile.configurations = configurations;
      yield this.contractAgent.saveProfile(this.profilesHost, criteria, profile);
      return { message: "Configurations updated successfully", profile };
    });
  }
  removeConfigurationsFromProfile(profileId) {
    return __async(this, null, function* () {
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.contractAgent) {
        throw new Error("Contract Agent undefined");
      }
      const profiles = yield this.contractAgent.findProfiles(
        this.profilesHost,
        criteria
      );
      if (profiles.length === 0) {
        throw new Error("Profile not found");
      }
      const profile = profiles[0];
      profile.configurations = {
        allowRecommendations: false,
        allowPolicies: false
      };
      yield this.contractAgent.saveProfile(this.profilesHost, criteria, profile);
      return { message: "Configurations removed successfully", profile };
    });
  }
};
_RequestHandler.instance = null;
var RequestHandler = _RequestHandler;

// src/agent.contract.profile.router.ts
var import_express2 = require("express");
var router2 = (0, import_express2.Router)();
router2.get(
  "/profile/:id/policies-recommendations",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const policies = yield requestHandler.getPoliciesRecommendationFromProfile(
        req.params.id
      );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.get(
  "/profile/:id/services-recommendations",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const services = yield requestHandler.getServicesRecommendationFromProfile(
        req.params.id
      );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.get(
  "/profile/:id/policies-matching",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const policies = yield requestHandler.getPoliciesMatchingFromProfile(
        req.params.id
      );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.get(
  "/profile/:id/services-matching",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const services = yield requestHandler.getServicesMatchingFromProfile(
        req.params.id
      );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.get(
  "/profile/:id/service-recommendations",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const services = yield requestHandler.getServicesRecommendationFromProfile(
        req.params.id
      );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.get(
  "/profile/:id/policies-matching",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const policies = yield requestHandler.getPoliciesMatchingFromProfile(
        req.params.id
      );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.get(
  "/profile/:id/contract-matching",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const contracts = yield requestHandler.getContractMatchingFromProfile(
        req.params.id
      );
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.get(
  "/profile/:id/configurations",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const configurations = yield requestHandler.getConfigurationsFromProfile(
        req.params.id
      );
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.post("/profile/configurations", (req, res) => __async(void 0, null, function* () {
  const requestHandler = yield RequestHandler.retrieveService();
  try {
    const { profileURI, configurations } = req.body;
    const result = yield requestHandler.addConfigurationsToProfile(
      profileURI,
      configurations
    );
    res.status(201).json(__spreadValues({ success: true }, result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));
router2.put(
  "/profile/:id/configurations",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const { configurations } = req.body;
      const result = yield requestHandler.updateConfigurationsForProfile(
        req.params.id,
        configurations
      );
      res.json(__spreadValues({ success: true }, result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router2.delete(
  "/profile/:id/configurations",
  (req, res) => __async(void 0, null, function* () {
    const requestHandler = yield RequestHandler.retrieveService();
    try {
      const result = yield requestHandler.removeConfigurationsFromProfile(
        req.params.id
      );
      res.json(__spreadValues({ success: true }, result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
var agent_contract_profile_router_default = router2;

// src/ChangeStreamDataProvider.ts
var import_mongodb2 = require("mongodb");
var MongoInterceptor2 = class _MongoInterceptor {
  constructor() {
    this.callbacks = /* @__PURE__ */ new Map();
    ["insert", "update", "delete"].forEach((op) => {
      this.callbacks.set(op, []);
    });
  }
  static getInstance() {
    if (!_MongoInterceptor.instance) {
      _MongoInterceptor.instance = new _MongoInterceptor();
    }
    return _MongoInterceptor.instance;
  }
  addCallback(changeType, callback) {
    const callbacks = this.callbacks.get(changeType) || [];
    callbacks.push(callback);
    this.callbacks.set(changeType, callbacks);
  }
  notifyCallbacks(changeType, collectionName, document) {
    const callbacks = this.callbacks.get(changeType) || [];
    callbacks.forEach((callback) => callback(collectionName, document));
  }
};
var _ChangeStreamDataProvider = class _ChangeStreamDataProvider extends DataProvider {
  constructor(config) {
    super(config.source);
    this.dbName = config.dbName;
    this.connectionPromise = this.connectToDatabase(config.url);
  }
  connectToDatabase(url) {
    return __async(this, null, function* () {
      if (!url) {
        throw new Error("Database URL is required");
      }
      const connectionKey = `${url}:${this.dbName}`;
      const existingConnection = _ChangeStreamDataProvider.connections.get(connectionKey);
      if (existingConnection) {
        Logger.info("Reusing existing MongoDB connection");
        this.db = existingConnection.db;
        this.client = existingConnection.client;
        return this.db;
      }
      try {
        const client = yield import_mongodb2.MongoClient.connect(url);
        const db = client.db(this.dbName);
        Logger.info("MongoDB connected successfully");
        this.db = db;
        this.client = client;
        _ChangeStreamDataProvider.connections.set(connectionKey, { db, client });
        return db;
      } catch (error) {
        Logger.error(`Error connecting to MongoDB: ${error.message}`);
        throw error;
      }
    });
  }
  static disconnectFromDatabase(url, dbName) {
    return __async(this, null, function* () {
      const connectionKey = `${url}:${dbName}`;
      const existingConnection = _ChangeStreamDataProvider.connections.get(connectionKey);
      if (existingConnection) {
        try {
          yield existingConnection.client.close();
          _ChangeStreamDataProvider.connections.set(connectionKey, void 0);
          Logger.info(`MongoDB connection for ${connectionKey} closed`);
        } catch (error) {
          Logger.error(`Error during disconnect: ${error.message}`);
        }
      } else {
        Logger.warn(`No active connection found for ${connectionKey}`);
      }
    });
  }
  ensureReady() {
    return __async(this, null, function* () {
      yield this.connectionPromise;
      this.collection = _ChangeStreamDataProvider.createCollectionProxy(
        this.db.collection(this.dataSource)
      );
      this.setupCallbacks();
    });
  }
  static createCollectionProxy(collection) {
    const interceptor = MongoInterceptor2.getInstance();
    const changeStream = collection.watch();
    changeStream.on("change", (change) => {
      switch (change.operationType) {
        case "insert":
          interceptor.notifyCallbacks("insert", collection.collectionName, {
            fullDocument: change.fullDocument,
            insertedId: change.documentKey,
            acknowledged: change.ns
          });
          break;
        case "update":
          interceptor.notifyCallbacks("update", collection.collectionName, {
            filter: change.documentKey,
            update: change.updateDescription,
            change
          });
          break;
        case "delete":
          interceptor.notifyCallbacks("delete", collection.collectionName, {
            filter: change.documentKey,
            change
          });
          break;
      }
    });
    const handler = {
      get(target, prop) {
        const original = target[prop];
        if (typeof original !== "function") return original;
        const nonAsyncMethods = ["find", "aggregate"];
        if (nonAsyncMethods.includes(prop)) {
          return function(...args) {
            return original.call(target, ...args);
          };
        }
        return function(...args) {
          return __async(this, null, function* () {
            const method = original;
            const result = yield method.apply(target, args);
            return result;
          });
        };
      }
    };
    return new Proxy(collection, handler);
  }
  setupCallbacks() {
    const interceptor = MongoInterceptor2.getInstance();
    interceptor.addCallback("insert", (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange("dataInserted", {
          fullDocument: data.fullDocument,
          fullDocuments: data.fullDocuments,
          source: this.dataSource
        });
      }
    });
    interceptor.addCallback("update", (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange("dataUpdated", {
          documentKey: { _id: data.filter._id },
          updateDescription: { updatedFields: data.update.$set || data.update.updatedFields || {} },
          source: this.dataSource
        });
      }
    });
    interceptor.addCallback("delete", (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange("dataDeleted", {
          documentKey: { _id: data.filter._id },
          source: this.dataSource
        });
      }
    });
  }
  makeQuery(conditions) {
    return conditions.reduce((query, condition) => {
      switch (condition.operator) {
        case "IN" /* IN */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $in: condition.value }
          });
        case "EQUALS" /* EQUALS */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: condition.value
          });
        case "GT" /* GT */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $gt: condition.value }
          });
        case "LT" /* LT */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $lt: condition.value }
          });
        case "CONTAINS" /* CONTAINS */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: {
              $in: Array.isArray(condition.value) ? condition.value : [condition.value]
            }
          });
        case "REGEX" /* REGEX */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: {
              $in: Array.isArray(condition.value) ? condition.value.map((val) => new RegExp(val, "i")) : [new RegExp(condition.value, "i")]
            }
          });
        default:
          throw new Error(`Unsupported operator: ${condition.operator}`);
      }
    }, {});
  }
  create(data) {
    return __async(this, null, function* () {
      try {
        const result = yield this.collection.insertOne(data);
        if (!result.acknowledged) {
          throw new Error("Document insertion was not acknowledged");
        }
        return __spreadProps(__spreadValues({}, data), { _id: result.insertedId });
      } catch (error) {
        Logger.info(
          `Error during document insertion: ${error.message}`
        );
        throw error;
      }
    });
  }
  delete(id) {
    return __async(this, null, function* () {
      try {
        const result = yield this.collection.deleteOne({ _id: new import_mongodb2.ObjectId(id) });
        if (result.deletedCount === 0) {
          Logger.warn(`No document found with id: ${id}`);
          return false;
        }
        Logger.info(`Document with id: ${id} successfully deleted`);
        return true;
      } catch (error) {
        Logger.error(
          `Error during document deletion: ${error.message}`
        );
        throw error;
      }
    });
  }
  find(criteria) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      const data = yield this.collection.find(query).limit(criteria.limit || 0).toArray();
      return data.map((item) => {
        if (item._id) {
          const _a = item, { _id } = _a, rest = __objRest(_a, ["_id"]);
          return __spreadValues({
            _id: _id.toString()
          }, rest);
        }
        return item;
      });
    });
  }
  update(criteria, data) {
    return __async(this, null, function* () {
      try {
        const updateData = data;
        const query = this.makeQuery(criteria.conditions);
        const result = yield this.collection.updateOne(query, {
          $set: updateData
        });
        if (result.matchedCount === 0) {
          Logger.warn(`No document found matching the criteria`);
          return false;
        }
        if (result.modifiedCount === 0) {
          Logger.info(`No changes made to document`);
          return false;
        }
        Logger.info(`Document successfully updated`);
        return true;
      } catch (error) {
        Logger.error(`Error during document update: ${error.message}`);
        throw error;
      }
    });
  }
  findAll() {
    return __async(this, null, function* () {
      return this.collection.find().toArray();
    });
  }
  findOne(criteria) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      const data = yield this.collection.findOne(query);
      return data;
    });
  }
  findOneAndUpdate(criteria, data) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      return yield this.collection.findOneAndUpdate(query, { $set: data }, { returnDocument: "after" });
    });
  }
  findOneAndPush(criteria, data) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      Object.keys(data).map((key) => {
        data[key].map((element) => element._id = new import_mongodb2.ObjectId());
        data[key] = { $each: data[key] };
      });
      return yield this.collection.findOneAndUpdate(query, { $push: data }, { returnDocument: "after" });
    });
  }
  findOneAndPull(criteria, data) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      return yield this.collection.findOneAndUpdate(query, { $pull: data }, { returnDocument: "after" });
    });
  }
};
_ChangeStreamDataProvider.connections = /* @__PURE__ */ new Map();
var ChangeStreamDataProvider = _ChangeStreamDataProvider;

// src/ConsentAgent.ts
var import_axios = __toESM(require("axios"));
var import_mongodb3 = require("mongodb");
var _ConsentAgent = class _ConsentAgent extends Agent {
  constructor() {
    super();
  }
  /**
   * Prepares the ConsentAgent instance by loading configuration and setting up providers
   * @throws {ConsentAgentError} If preparation fails
   */
  prepare() {
    return __async(this, null, function* () {
      try {
        this.loadDefaultConfiguration();
        yield this.addDefaultProviders();
        this.setupProviderEventHandlers();
      } catch (error) {
        const agentError = {
          name: "PreparationError",
          message: `Failed to prepare ConsentAgent: ${error.message}`,
          code: CAECode.PREPARATION_FAILED
        };
        Logger.error(agentError.message);
        throw agentError;
      }
    });
  }
  /**
   * Retrieves or creates an instance of ConsentAgent.
   * @param dataProviderType
   * @param refresh - Whether to force creation of a new instance.
   * @returns Instance of ConsentAgent.
   */
  static retrieveService() {
    return __async(this, arguments, function* (dataProviderType = ChangeStreamDataProvider, refresh = false) {
      try {
        if (!_ConsentAgent.instance || refresh) {
          DataProvider.setChildType(dataProviderType);
          const instance = new _ConsentAgent();
          yield instance.prepare();
          _ConsentAgent.instance = instance;
        }
        return _ConsentAgent.instance;
      } catch (error) {
        const serviceError = {
          name: "ServiceRetrievalError",
          message: `Failed to retrieve ConsentAgent service: ${error.message}`,
          code: CAECode.SERVICE_RETRIEVAL_FAILED
        };
        Logger.error(serviceError.message);
        throw serviceError;
      }
    });
  }
  /**
   * Finds profiles based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @returns Promise resolving to an array of profiles.
   */
  findProfiles(source, criteria) {
    return __async(this, null, function* () {
      try {
        const dataProvider = this.getDataProvider(source);
        const results = yield dataProvider.find(criteria);
        return results.map((result) => {
          const profil = {
            uri: result.uri,
            configurations: result.configurations,
            recommendations: result.recommendations || [],
            matching: result.matching || [],
            preference: result.preference || []
          };
          return new Profile(profil);
        });
      } catch (error) {
        Logger.error(`Error while finding profile: ${error.message}`);
        throw new Error();
      }
    });
  }
  /**
   * Finds profile based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @returns Promise resolving to an array of profiles.
   */
  findProfile(source, criteria) {
    return __async(this, null, function* () {
      try {
        const dataProvider = this.getDataProvider(source);
        const result = yield dataProvider.findOne(criteria);
        return new Profile({
          _id: result == null ? void 0 : result._id,
          uri: result == null ? void 0 : result.uri,
          configurations: result == null ? void 0 : result.configurations,
          recommendations: (result == null ? void 0 : result.recommendations) || [],
          matching: (result == null ? void 0 : result.matching) || [],
          preference: (result == null ? void 0 : result.preference) || []
        });
      } catch (error) {
        Logger.error(`Error while finding profile: ${error.message}`);
        throw new Error();
      }
    });
  }
  /**
   * Finds profile based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @param data - the updated data
   * @returns Promise resolving to an array of profiles.
   */
  findProfileAndUpdate(source, criteria, data) {
    return __async(this, null, function* () {
      try {
        const dataProvider = this.getDataProvider(source);
        const result = yield dataProvider.findOneAndUpdate(
          criteria,
          data
        );
        return new Profile({
          uri: result.uri,
          configurations: result.configurations,
          recommendations: result.recommendations || [],
          matching: result.matching || [],
          preference: result.preference || []
        });
      } catch (error) {
        Logger.error(`Error while finding profile: ${error.message}`);
        throw new Error();
      }
    });
  }
  /**
   * Finds profile based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @param data - the updated data
   * @returns Promise resolving to an array of profiles.
   */
  findProfileAndPush(source, criteria, data) {
    return __async(this, null, function* () {
      try {
        const dataProvider = this.getDataProvider(source);
        const result = yield dataProvider.findOneAndPush(
          criteria,
          data
        );
        return new Profile({
          uri: result.uri,
          configurations: result.configurations,
          recommendations: result.recommendations || [],
          matching: result.matching || [],
          preference: result.preference || []
        });
      } catch (error) {
        Logger.error(`Error while finding profile: ${error.message}`);
        throw new Error();
      }
    });
  }
  /**
   * Finds profile based on the provided source and search criteria.
   * @param source - Data source identifier.
   * @param criteria - Search criteria.
   * @param data - the updated data
   *   Promise resolving to an array of profiles.
   */
  findProfileAndPull(source, criteria, data) {
    return __async(this, null, function* () {
      try {
        const dataProvider = this.getDataProvider(source);
        const result = yield dataProvider.findOneAndPull(
          criteria,
          data
        );
        return new Profile({
          uri: result.uri,
          configurations: result.configurations,
          recommendations: result.recommendations || [],
          matching: result.matching || [],
          preference: result.preference || []
        });
      } catch (error) {
        Logger.error(`Error while finding profile: ${error.message}`);
        throw new Error();
      }
    });
  }
  /**
   * Builds search criteria based on the provided source entity.
   * @param sourceEntity - Entity from which to derive search criteria.
   * @returns The constructed search criteria.
   */
  buildSearchCriteria(sourceEntity) {
    throw new Error("Method not implemented.");
  }
  /**
   * Enriches a profile with system recommendations.
   * @returns The enriched profile.
   */
  enrichProfileWithSystemRecommendations() {
    throw new Error("Method not implemented.");
  }
  /**
   * Handles inserted data events
   * @param data - Data change event
   */
  handleDataInserted(data) {
    return __async(this, null, function* () {
      if (data.fullDocument && data.fullDocument instanceof Object) {
        switch (data.source) {
          case "users":
            {
              try {
                const { _id } = data.fullDocument;
                yield this.createProfileForParticipant(_id);
                Logger.info(`Data inserted for source: ${data.source}`);
              } catch (error) {
                Logger.error(
                  `Data insertion failed: ${error.message}`
                );
                throw error;
              }
            }
            break;
          case "privacynotices":
            {
              try {
                yield this.handlePrivacyNotice(data.fullDocument);
                Logger.info(`Data inserted for source: ${data.source}`);
              } catch (error) {
                Logger.error(
                  `Data insertion failed: ${error.message}`
                );
                throw error;
              }
            }
            break;
          case "consents":
            {
              try {
                yield this.handleConsent(data.fullDocument);
                Logger.info(`Data inserted for source: ${data.source}`);
              } catch (error) {
                Logger.error(
                  `Data insertion failed: ${error.message}`
                );
                throw error;
              }
            }
            break;
        }
      } else {
        Logger.info(`Unhandled data for source: ${data.source}`);
      }
    });
  }
  /**
   * Handles data update events.
   * @param data - Data change event.
   */
  handleDataUpdated(data) {
    return __async(this, null, function* () {
      var _a, _b;
      if (data.updateDescription && data.updateDescription.updatedFields && data.updateDescription.updatedFields instanceof Object) {
        switch (data.source) {
          case "users":
            {
              try {
                if (data.updateDescription.updatedFields.identifiers) yield this.handleNewIdentifier({ _id: (_a = data.documentKey) == null ? void 0 : _a._id });
                Logger.info(`Data updated for source: ${data.source}`);
              } catch (error) {
                Logger.error(
                  `Data update failed: ${error.message}`
                );
                throw error;
              }
            }
            break;
          case "consents":
            {
              try {
                const { updatedFields } = data.updateDescription;
                if (updatedFields.status && (updatedFields.status === "revoked" || updatedFields.status === "refused" || updatedFields.status === "terminated")) {
                  yield this.handleRemoveConsent({ _id: (_b = data.documentKey) == null ? void 0 : _b._id });
                }
                Logger.info(`Data updated for source: ${data.source}`);
              } catch (error) {
                Logger.error(
                  `Data update failed: ${error.message}`
                );
                throw error;
              }
            }
            break;
        }
      } else {
        Logger.info(`Unhandled data for source: ${data.source}`);
      }
    });
  }
  /**
   * Handles data deletion events.
   * @param data - Data change event.
   */
  handleDataDeleted(data) {
    return __async(this, null, function* () {
      if (data.documentKey && data.documentKey instanceof Object) {
        switch (data.source) {
          case "users":
            {
              try {
                const { _id } = data.documentKey;
                yield this.deleteProfileForParticipant(_id);
                Logger.info(`Data deleted for source: ${data.source}`);
              } catch (error) {
                Logger.error(
                  `Data deletion failed: ${error.message}`
                );
                throw error;
              }
            }
            break;
          case "privacynotices":
            {
              try {
                yield this.handleRemovePrivacyNotice(data.documentKey);
                Logger.info(`Data deleted for source: ${data.source}`);
              } catch (error) {
                Logger.error(
                  `Data deletion failed: ${error.message}`
                );
                throw error;
              }
            }
            break;
          case "consents":
            {
              try {
                yield this.handleRemoveConsent(data.documentKey);
                Logger.info(`Data deleted for source: ${data.source}`);
              } catch (error) {
                Logger.error(
                  `Data deletion failed: ${error.message}`
                );
                throw error;
              }
            }
            break;
        }
      } else {
        Logger.info(`Unhandled data insertion for source: ${data.source}`);
      }
    });
  }
  /**
   * Updates the matching information for a profile.
   * @param profile - Profile instance.
   * @param data - Matching data to update the profile with.
   */
  updateMatchingForProfile(profile, data) {
    return __async(this, null, function* () {
      throw new Error("Method not implemented.");
    });
  }
  /**
   * Check the existing data at the Agent initialization
   * @returns {Promise<void>}
   */
  existingDataCheck() {
    return __async(this, null, function* () {
      const users = yield this.getDataProvider("users").findAll();
      const profiles = yield this.getDataProvider("profiles").findAll();
      for (const user of users) {
        const existingProfile = profiles.find(
          (profile) => profile.uri.toString() === user._id.toString()
        );
        if (!existingProfile) {
          yield this.createProfileForParticipant(user._id);
          Logger.info(`Profile created for user - ${user._id}`);
        }
      }
    });
  }
  /**
   * Updates recommendations for a profile.
   * @param profile - Profile instance.
   * @param data - Recommendation data to update the profile with.
   */
  updateRecommendationForProfile(profile, data) {
    return __async(this, null, function* () {
      const dataProvider = this.getDataProvider("profiles");
      const criteria = {
        conditions: [
          {
            field: "_id",
            operator: "EQUALS" /* EQUALS */,
            value: profile._id
          }
        ],
        threshold: 0
      };
      yield dataProvider.findOneAndUpdate(criteria, data);
    });
  }
  /**
   * Create a profile for a user
   * @param participantId - The Id of the user
   * @param allowRecommendations - boolean option to setup configuration of the profile at the creation
   */
  createProfileForParticipant(participantId, allowRecommendations) {
    return __async(this, null, function* () {
      try {
        const profileProvider = this.getDataProvider("profiles");
        const newProfileData = {
          uri: participantId.toString(),
          configurations: {
            allowRecommendations: allowRecommendations != null ? allowRecommendations : true
          },
          recommendations: {
            consents: [],
            dataExchanges: []
          },
          preference: []
        };
        const profile = yield profileProvider.create(newProfileData);
        return new Profile(profile);
      } catch (error) {
        Logger.error(`Error creating profile: ${error.message}`);
        throw new Error("Profile creation failed");
      }
    });
  }
  /**
   * Deletes a profile for a given participant.
   * 
   * @param participantId - The Id of the participant whose profile is to be deleted.
   * @returns The deleted profile.
   */
  deleteProfileForParticipant(participantId) {
    return __async(this, null, function* () {
      try {
        const profileProvider = this.getDataProvider("profiles");
        const result = yield profileProvider.findOne({
          conditions: [
            {
              field: "uri",
              operator: "EQUALS" /* EQUALS */,
              value: participantId
            }
          ],
          threshold: 0
        });
        if (result._id) {
          yield profileProvider.delete(result == null ? void 0 : result._id);
          return new Profile({
            uri: result.uri,
            configurations: result.configurations,
            recommendations: result.recommendations || [],
            matching: result.matching || [],
            preference: result.preference || []
          });
        } else {
          throw new Error("Profile not found");
        }
      } catch (error) {
        Logger.error(`Error creating profile: ${error.message}`);
        throw new Error("Profile creation failed");
      }
    });
  }
  /**
   * Handles privacy notices by updating profiles that allow recommendations.
   * 
   * This method processes the privacy notice document by first fetching the purpose and data information.
   * It then retrieves all profiles that allow recommendations and checks if they match the participants or categories
   * specified in the purpose and data. If a match is found, the method updates the profile by adding the privacy notice.
   * 
   * @param fullDocument - The full document containing the privacy notice information.
   */
  handlePrivacyNotice(fullDocument) {
    return __async(this, null, function* () {
      const purposeData = yield this.getPurposeAndData(
        fullDocument.purposes[0].serviceOffering,
        fullDocument.data[0].serviceOffering
      );
      if (!purposeData) {
        throw new Error("Purpose and data information is undefined");
      }
      const { purpose, data } = purposeData;
      const profileProvider = this.getDataProvider("profiles");
      const allProfiles = yield profileProvider.findAll();
      for (const profile of allProfiles) {
        if (profile.configurations.allowRecommendations && profile.preference.some(
          (pref) => pref.participant === purpose.providedBy || pref.participant === data.providedBy || pref.category && purpose.category.includes(pref.category) || pref.category && data.category.includes(pref.category)
        )) {
          const { recommendations } = profile;
          recommendations.dataExchanges.push(fullDocument._id);
          yield this.updateRecommendationForProfile(profile, profile);
          Logger.info(
            `Profile ${profile._id} updated with privacy notice ${fullDocument._id}`
          );
        }
      }
    });
  }
  /**
   * Handles consent by updating profiles that allow recommendations.
   * 
   * This method processes the consent document by first fetching the purpose and data information.
   * It then retrieves all profiles that allow recommendations and checks if they match the participants or categories
   * specified in the purpose and data. If a match is found, the method updates the profile by removing the privacy notice
   * and adding the consent.
   * 
   * @param fullDocument - The full document containing the consent information.
   */
  handleConsent(fullDocument) {
    return __async(this, null, function* () {
      const purposeData = yield this.getPurposeAndData(
        fullDocument.purposes[0].serviceOffering,
        fullDocument.data[0].serviceOffering
      );
      if (!purposeData) {
        throw new Error("Purpose and data information is undefined");
      }
      const { purpose, data } = purposeData;
      const profileProvider = this.getDataProvider("profiles");
      const allProfiles = yield profileProvider.findAll();
      for (const profile of allProfiles) {
        if (profile.configurations.allowRecommendations && profile.preference.some(
          (pref) => pref.participant === purpose.providedBy || pref.participant === data.providedBy || pref.category && purpose.category.includes(pref.category) || pref.category && data.category.includes(pref.category)
        )) {
          const index = profile.recommendations.dataExchanges.indexOf(
            fullDocument.privacyNotice
          );
          profile.recommendations.dataExchanges.splice(index, 1);
          profile.recommendations.consents.push(fullDocument._id);
          yield this.updateRecommendationForProfile(profile, profile);
          Logger.info(
            `Profile ${profile._id} updated with consent ${fullDocument._id}`
          );
        }
      }
    });
  }
  /**
   * Handles the removal of privacy notice from profiles.
   * @param fullDocument - The full document containing the privacy notice information.
   */
  handleRemovePrivacyNotice(fullDocument) {
    return __async(this, null, function* () {
      const profileProvider = this.getDataProvider("profiles");
      const allProfiles = yield profileProvider.findAll();
      for (const profile of allProfiles) {
        const { recommendations } = profile;
        if (recommendations.dataExchanges.includes(fullDocument._id)) {
          const pull = { "recommendations.dataExchanges": { "_id": new import_mongodb3.ObjectId(fullDocument._id) } };
          const criteria = {
            conditions: [
              {
                field: "uri",
                operator: "EQUALS" /* EQUALS */,
                value: profile.uri
              }
            ],
            threshold: 0
          };
          yield this.findProfileAndPull("profiles", criteria, pull);
          Logger.info(
            `Profile ${profile._id} updated with privacy notice ${fullDocument._id}`
          );
        }
      }
    });
  }
  /**
   * Handles the removal of consent from profiles.
   * @param fullDocument - The full document containing the consent information.
   */
  handleRemoveConsent(fullDocument) {
    return __async(this, null, function* () {
      const profileProvider = this.getDataProvider("profiles");
      const allProfiles = yield profileProvider.findAll();
      for (const profile of allProfiles) {
        const { recommendations } = profile;
        if (recommendations.consents.includes(fullDocument._id)) {
          const pull = { "recommendations.consents": { "_id": new import_mongodb3.ObjectId(fullDocument._id) } };
          const criteria = {
            conditions: [
              {
                field: "uri",
                operator: "EQUALS" /* EQUALS */,
                value: profile.uri
              }
            ],
            threshold: 0
          };
          yield this.findProfileAndPull("profiles", criteria, pull);
          Logger.info(
            `Profile ${profile._id} updated with privacy notice ${fullDocument._id}`
          );
        }
      }
    });
  }
  /**
   * Fetches purpose and data documents based on their service descriptions.
   *
   * @param purposeSd - The service description URL for the purpose document.
   * @param dataSd - The service description URL for the data document.
   * @returns An object containing the fetched purpose and data documents.
   */
  getPurposeAndData(purposeSd, dataSd) {
    return __async(this, null, function* () {
      try {
        const [purposeResponse, dataResponse] = yield Promise.all([
          import_axios.default.get(purposeSd),
          import_axios.default.get(dataSd)
        ]);
        if (!purposeResponse.data) {
          throw new Error("Purpose data is undefined");
        }
        if (!dataResponse.data) {
          throw new Error("Data data is undefined");
        }
        return { purpose: purposeResponse.data, data: dataResponse.data };
      } catch (e) {
        Logger.error(`Error fetching purpose and data: ${e.message}`);
      }
    });
  }
  /**
   * Handles new identifier events.
   * @param fullDocument - The full document of the new identifier event.
   */
  handleNewIdentifier(fullDocument) {
    return __async(this, null, function* () {
      try {
        const profileProvider = this.getDataProvider("profiles");
        const criteria = {
          conditions: [
            {
              field: "uri",
              operator: "EQUALS" /* EQUALS */,
              value: fullDocument._id
            }
          ],
          threshold: 0
        };
        const profile = yield profileProvider.findOne(criteria);
        if (!profile) {
          throw new Error("Profile not found");
        }
        const userIdentifierProvider = this.getDataProvider("useridentifiers");
        const identifierCriteria = {
          conditions: [
            {
              field: "_id",
              operator: "EQUALS" /* EQUALS */,
              value: fullDocument._id
            }
          ],
          threshold: 0
        };
        const identifier = yield userIdentifierProvider.findOne(identifierCriteria);
        if (!identifier) {
          throw new Error("Identifier not found");
        }
        const participantsProvider = this.getDataProvider("participants");
        const participantCriteria = {
          conditions: [
            {
              field: "_id",
              operator: "EQUALS" /* EQUALS */,
              value: identifier.attachedParticipant
            }
          ],
          threshold: 0
        };
        const participant = yield participantsProvider.findOne(participantCriteria);
        if (!participant) {
          throw new Error("Participant not found");
        }
        const pnProvider = this.getDataProvider("privacynotices");
        const privacyNotices = yield pnProvider.findAll();
        if (!privacyNotices) {
          throw new Error("Privacy notices not found");
        }
        const filteredPrivacyNotices = privacyNotices.filter(
          (pn) => pn.dataProvider === participant.selfDescriptionURL || pn.recipients.includes(participant.selfDescriptionURL)
        );
        const consentProvider = this.getDataProvider("consents");
        const consents = yield consentProvider.findAll();
        if (!consents) {
          throw new Error("Consents not found");
        }
        const filteredConsents = consents.filter(
          (consent) => consent.dataProvider === participant._id || consent.dataConsumer === participant._id
        );
        filteredPrivacyNotices.forEach((pn) => {
          profile.recommendations.dataExchanges.push(pn._id);
          profile.recommendations.dataExchanges = [...new Set(profile.recommendations.dataExchanges)];
        });
        filteredConsents.forEach((consent) => {
          profile.recommendations.consents.push(consent._id);
          profile.recommendations.consents = [...new Set(profile.recommendations.consents)];
        });
        yield this.updateRecommendationForProfile(profile, profile);
      } catch (error) {
        Logger.error(`Error handling new identifier: ${error.message}`);
      }
    });
  }
  /**
   *
   * @param source
   * @param criteria
   * @param profile
   */
  saveProfile(source, criteria, profile) {
    throw new Error("Method not implemented.");
  }
};
_ConsentAgent.instance = null;
var ConsentAgent = _ConsentAgent;

// src/ConsentAgentHandler.ts
var import_mongodb4 = require("mongodb");
var _ConsentAgentRequestHandler = class _ConsentAgentRequestHandler {
  constructor() {
    this.profilesHost = "";
  }
  static retrieveService() {
    return __async(this, null, function* () {
      if (!_ConsentAgentRequestHandler.instance) {
        const instance = new _ConsentAgentRequestHandler();
        yield instance.prepare();
        _ConsentAgentRequestHandler.instance = instance;
      }
      return _ConsentAgentRequestHandler.instance;
    });
  }
  prepare() {
    return __async(this, null, function* () {
      this.consentAgent = yield ConsentAgent.retrieveService();
    });
  }
  getConsentAgent() {
    return __async(this, null, function* () {
      return ConsentAgent.retrieveService();
    });
  }
  /**
   * Returns only the policies from the recommendations.
   * 
   * @param profileId - The ID of the profile to retrieve recommendations for.
   * @returns {Promise<any>} - A promise that resolves to the policies from the recommendations.
   */
  getConsentRecommendationFromProfile(profileId) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profile = yield this.consentAgent.findProfile("profiles", criteria);
      if (!profile) {
        throw new Error("Profile not found");
      }
      return profile.recommendations.consents;
    });
  }
  /**
   * Returns only the services from the recommendations.
   * 
   * @param profileId - The ID of the profile to retrieve recommendations for.
   * @returns {Promise<any>} - A promise that resolves to the services from the recommendations.
   */
  getDataExchangeRecommendationFromProfile(profileId) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profile = yield this.consentAgent.findProfile("profiles", criteria);
      if (!profile) {
        throw new Error("Profile not found");
      }
      return profile.recommendations.dataExchanges;
    });
  }
  /**
   * Return the profile's authorization
   * @param profileURL - uri of the profile
   * @return Promise<ProfilePreference[]>
   */
  getPreferencesFromProfile(profileURL) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURL
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profile = yield this.consentAgent.findProfile("profiles", criteria);
      if (!profile) throw new Error("Profile not found");
      return profile.preference;
    });
  }
  /**
   * Return the profile's authorization
   * @param profileURL - uri of the profile
   * @param {PreferencePayload} data
   * @return Promise<ProfilePreference[]>
   */
  addPreferenceToProfile(profileURL, data) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURL
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profile = yield this.consentAgent.findProfileAndPush(
        "profiles",
        criteria,
        { preference: data }
      );
      if (!profile) throw new Error("Profile not found");
      return profile.preference;
    });
  }
  /**
   * Return the profile's authorization
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @return Promise<ProfilePreference[]>
   */
  getPreferenceByIdFromProfile(profileURL, preferenceId) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURL
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profile = yield this.consentAgent.findProfile("profiles", criteria);
      if (!profile) throw new Error("Profile not found");
      return profile.preference.filter(
        (element) => {
          var _a;
          return ((_a = element._id) == null ? void 0 : _a.toString()) === preferenceId;
        }
      );
    });
  }
  /**
   * Update the profile's preference
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @param {PreferencePayload} data - Data to update
   * @return Promise<ProfilePreference[]>
   */
  updatePreferenceByIdFromProfile(profileURL, preferenceId, data) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURL
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profile = yield this.consentAgent.findProfile("profiles", criteria);
      if (!profile) throw new Error("Profile not found");
      const preferenceIndex = profile.preference.findIndex(
        (element) => {
          var _a;
          return ((_a = element._id) == null ? void 0 : _a.toString()) === preferenceId;
        }
      );
      if (data.asDataProvider) {
        profile.preference[preferenceIndex].asDataProvider = __spreadValues(__spreadValues({}, profile.preference[preferenceIndex].asDataProvider), data.asDataProvider);
      }
      if (data.asServiceProvider) {
        profile.preference[preferenceIndex].asServiceProvider = __spreadValues(__spreadValues({}, profile.preference[preferenceIndex].asServiceProvider), data.asServiceProvider);
      }
      if (data.participant) {
        profile.preference[preferenceIndex].participant = data.participant;
      }
      if (data.category) {
        profile.preference[preferenceIndex].participant = data.category;
      }
      delete profile._id;
      const profileUpdated = yield this.consentAgent.findProfileAndUpdate(
        "profiles",
        criteria,
        profile
      );
      if (!profileUpdated) throw new Error("Profile not found");
      return profileUpdated.preference.filter(
        (element) => {
          var _a;
          return ((_a = element._id) == null ? void 0 : _a.toString()) === preferenceId;
        }
      );
    });
  }
  /**
   * Update the profile's preference
   * @param {string} profileURL - URL of the profile
   * @param {string} preferenceId - ID of the preference
   * @param {PreferencePayload} data - Data to update
   * @return Promise<ProfilePreference[]>
   */
  deletePreferenceByIdFromProfile(profileURL, preferenceId) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURL
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const data = { preference: { _id: new import_mongodb4.ObjectId(preferenceId) } };
      const profile = yield this.consentAgent.findProfileAndPull(
        "profiles",
        criteria,
        data
      );
      if (!profile) throw new Error("Profile not found");
      return profile.preference;
    });
  }
  /**
   * Return the profile's authorization
   * @param profileURL - uri of the profile
   * @return Promise<ProfileConfigurations>
   */
  getConfigurationsFromProfile(profileURL) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURL
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profiles = yield this.consentAgent.findProfiles("profiles", criteria);
      if (profiles.length === 0) throw new Error("Profile not found");
      return profiles[0].configurations;
    });
  }
  // Return the profile by uri
  getProfileByURL(uri) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: uri
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profile = yield this.consentAgent.findProfile("profiles", criteria);
      if (!profile) throw new Error("Profile not found");
      return profile;
    });
  }
  // Return the authorization of the profile
  getProfiles() {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profiles = yield this.consentAgent.findProfiles("profiles", criteria);
      if (profiles.length === 0) throw new Error("Profile not found");
      return profiles;
    });
  }
  // Return the authorization of the profile
  updateProfile(profileURL, data) {
    return __async(this, null, function* () {
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileURL
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      const profile = yield this.consentAgent.findProfileAndUpdate(
        "profiles",
        criteria,
        data
      );
      if (!profile) throw new Error("Profile not found");
      return profile;
    });
  }
  /**
   * Checks if the given parameters match the preferences of a profile.
   * 
   * @param {string} profileId - The ID of the profile to check preferences for.
   * @param {string} category - The category to match preferences against.
   * @param {string} participant - The participant to match preferences against.
   * @param {string} location - The location to match preferences against.
   * @param {boolean} asDataProvider - Indicates if the check is for a data provider role.
   * @param {boolean} asServiceProvider - Indicates if the check is for a service provider role.
   * 
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the preferences match.
   */
  checkPreferenceMatch(params) {
    return __async(this, null, function* () {
      const {
        profileId,
        category,
        participant,
        location,
        asDataProvider,
        asServiceProvider
      } = params;
      if (category && participant) {
        throw new Error(
          "Cannot use both category and participant simultaneously."
        );
      }
      if (!category && !participant) {
        throw new Error("At least one of category or participant must be true.");
      }
      if (asDataProvider && asServiceProvider) {
        throw new Error(
          "Cannot use both asDataProvider and asServiceProvider simultaneously."
        );
      }
      if (!asDataProvider && !asServiceProvider) {
        throw new Error(
          "At least one of asDataProvider or asServiceProvider must be true."
        );
      }
      yield this.prepare();
      const criteria = {
        conditions: [
          {
            field: "uri",
            operator: "EQUALS" /* EQUALS */,
            value: profileId
          }
        ],
        threshold: 0
      };
      if (!this.consentAgent) {
        throw new Error("Consent Agent undefined");
      }
      if (participant) {
        criteria.conditions.push({
          field: "preference.participant",
          operator: "EQUALS" /* EQUALS */,
          value: participant
        });
      }
      if (category) {
        criteria.conditions.push({
          field: "preference.category",
          operator: "EQUALS" /* EQUALS */,
          value: category
        });
      }
      const profile = yield this.consentAgent.findProfile("profiles", criteria);
      if (!profile._id) return false;
      let preference;
      if (participant) {
        preference = profile.preference.find(
          (pref) => pref.participant === participant
        );
      }
      if (category) {
        preference = profile.preference.find(
          (pref) => pref.category === category
        );
      }
      if (preference) {
        const currentDay = (/* @__PURE__ */ new Date()).getDay().toString();
        let isMatch = false;
        if (asDataProvider && preference.asDataProvider) {
          isMatch = this.checkAuthorizationMatch(preference.asDataProvider, currentDay, location);
        } else if (asServiceProvider && preference.asServiceProvider) {
          isMatch = this.checkAuthorizationMatch(preference.asServiceProvider, currentDay, location);
        }
        return isMatch;
      }
      return true;
    });
  }
  /**
   * This function checks if the authorization matches the current day and location.
   * 
   * @param authorization - The authorization object to check.
   * @param currentDay - The current day of the week.
   * @param location - The current location.
   * @returns {boolean} - True if the authorization matches, false otherwise.
   */
  checkAuthorizationMatch(authorization, currentDay, location) {
    if (authorization.authorizationLevel === "never") {
      return false;
    } else if (authorization.authorizationLevel === "always") {
      return true;
    } else if (authorization.authorizationLevel === "conditional") {
      if (authorization.conditions) {
        return authorization.conditions.some((condition) => {
          if (condition.time && condition.time.dayOfWeek && condition.time.dayOfWeek.includes(currentDay)) {
            const startTime = new Date(condition.time.startTime || "");
            const endTime = new Date(condition.time.endTime || "");
            const currentTime = /* @__PURE__ */ new Date();
            return currentTime >= startTime && currentTime <= endTime;
          }
          if (condition.location && condition.location.countryCode === location) {
            return true;
          }
          return false;
        });
      }
    }
    return false;
  }
};
_ConsentAgentRequestHandler.instance = null;
var ConsentAgentRequestHandler = _ConsentAgentRequestHandler;

// src/agent.consent.router.ts
var import_express3 = require("express");
var router3 = (0, import_express3.Router)();
router3.get(
  "/profile/:profileId/preferences/match",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const {
        category,
        participant,
        location,
        asDataProvider,
        asServiceProvider
      } = req.query;
      const service = yield requestHandler.checkPreferenceMatch({
        profileId,
        category: category == null ? void 0 : category.toString(),
        participant: participant == null ? void 0 : participant.toString(),
        location: location == null ? void 0 : location.toString(),
        asDataProvider: asDataProvider === "true",
        asServiceProvider: asServiceProvider === "true"
      });
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.get(
  "/profile/:profileId/recommendations/consent",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const services = yield requestHandler.getConsentRecommendationFromProfile(profileId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.get(
  "/profile/:profileId/recommendations/dataexchanges",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const service = yield requestHandler.getDataExchangeRecommendationFromProfile(
        profileId
      );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.get(
  "/profile/:profileId/preferences",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const service = yield requestHandler.getPreferencesFromProfile(profileId);
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.get(
  "/profile/:profileId/preferences/:preferenceId",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId, preferenceId } = req.params;
      const service = yield requestHandler.getPreferenceByIdFromProfile(
        profileId,
        preferenceId
      );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.post(
  "/profile/:profileId/preferences",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const { preference } = req.body;
      if (!preference.every((p) => p.participant || p.category)) {
        throw new Error("Each preference must contain at least the field participant or category");
      }
      const service = yield requestHandler.addPreferenceToProfile(
        profileId,
        preference
      );
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.put(
  "/profile/:profileId/preferences/:preferenceId",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId, preferenceId } = req.params;
      const service = yield requestHandler.updatePreferenceByIdFromProfile(
        profileId,
        preferenceId,
        req.body
      );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.delete(
  "/profile/:profileId/preferences/:preferenceId",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId, preferenceId } = req.params;
      const service = yield requestHandler.deletePreferenceByIdFromProfile(
        profileId,
        preferenceId
      );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.get(
  "/profile/:profileId/configurations",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const service = yield requestHandler.getConfigurationsFromProfile(
        profileId
      );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.put(
  "/profile/:profileId/configurations",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const configurations = req.body.configurations;
      const services = yield requestHandler.updateProfile(
        profileId,
        {
          uri: profileId,
          configurations
        }
      );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.get(
  "/profile/:profileId",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const services = yield requestHandler.getProfileByURL(
        profileId
      );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
router3.get(
  "/profile/",
  (req, res) => __async(void 0, null, function* () {
    try {
      const requestHandler = yield ConsentAgentRequestHandler.retrieveService();
      const services = yield requestHandler.getProfiles();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
var agent_consent_router_default = router3;

// src/MongooseProvider.ts
var import_mongoose2 = __toESM(require("mongoose"));
var _MongooseProvider = class _MongooseProvider extends DataProvider {
  constructor(config) {
    super(config.source);
    this.mongoosePromiseResolve = null;
    this.dbName = config.dbName;
    this.url = config.url;
    this.mongoosePromise = new Promise((resolve) => {
      this.mongoosePromiseResolve = resolve;
    });
    _MongooseProvider.instances.set(config.source, this);
  }
  findAll() {
    throw new Error("Method not implemented.");
  }
  findOne(criteria) {
    throw new Error("Method not implemented.");
  }
  findOneAndUpdate(criteria, data) {
    throw new Error("Method not implemented.");
  }
  findOneAndPush(criteria, data) {
    throw new Error("Method not implemented.");
  }
  findOneAndPull(criteria, data) {
    throw new Error("Method not implemented.");
  }
  static setCollectionModel(source, schema) {
    schema.post("save", (doc) => {
      const provider = _MongooseProvider.instances.get(source);
      if (provider) {
        provider.notifyDataChange("dataInserted", {
          source,
          fullDocument: doc
        });
      }
    });
    schema.post("insertMany", (docs) => {
      const provider = _MongooseProvider.instances.get(source);
      if (provider) {
        docs.forEach((doc) => {
          provider.notifyDataChange("dataInserted", {
            source,
            fullDocument: doc
          });
        });
      }
    });
    schema.post(["updateOne", "findOneAndUpdate"], (doc) => {
      const provider = _MongooseProvider.instances.get(source);
      if (provider) {
        provider.notifyDataChange("dataUpdated", {
          source,
          updateDescription: {
            updatedFields: doc
          }
        });
      }
    });
    schema.post(["deleteOne", "findOneAndDelete"], (doc) => {
      const provider = _MongooseProvider.instances.get(source);
      if (provider) {
        provider.notifyDataChange("dataDeleted", {
          source,
          documentKey: { _id: doc._id }
        });
      }
    });
    _MongooseProvider.externalModels.set(source, schema);
    Logger.info(`External schema set for collection: ${source}`);
  }
  static getCollectionSchema(source) {
    return _MongooseProvider.externalModels.get(source);
  }
  getMongoosePromise() {
    return this.mongoosePromise;
  }
  ensureReady() {
    return __async(this, null, function* () {
      if (import_mongoose2.default.connection.readyState !== 1) {
        Logger.info("Connecting to Mongoose...");
        try {
          if (import_mongoose2.default.connection.readyState === 0) {
            yield import_mongoose2.default.connect(this.url + "/" + this.dbName, {
              retryWrites: true,
              serverSelectionTimeoutMS: 5e3,
              family: 4
            });
            if (this.mongoosePromiseResolve) {
              this.mongoosePromiseResolve();
            } else {
              throw new Error("Mongoose promise undefined");
            }
          }
          import_mongoose2.default.connection.on("disconnected", () => {
            Logger.warn("Mongoose disconnected");
          });
        } catch (error) {
          Logger.error(
            `Error during Mongoose connection: ${error.message}`
          );
          throw error;
        }
      }
      const schema = _MongooseProvider.getCollectionSchema(this.dataSource);
      if (schema) {
        try {
          this.model = import_mongoose2.default.model(this.dataSource);
        } catch (e) {
          this.model = import_mongoose2.default.model(this.dataSource, schema);
        }
      } else {
        this.model = import_mongoose2.default.model(this.dataSource, ProfileSchema);
      }
    });
  }
  setupHooks() {
    this.model.schema.post("save", (doc) => {
      this.notifyDataChange("dataInserted", {
        source: this.dataSource,
        fullDocument: doc
      });
    });
    this.model.schema.post("insertMany", (docs) => {
      docs.forEach((doc) => {
        this.notifyDataChange("dataInserted", {
          source: this.dataSource,
          fullDocument: doc
        });
      });
    });
    this.model.schema.post(
      ["updateOne", "findOneAndUpdate"],
      (doc) => {
        this.notifyDataChange("dataUpdated", {
          source: this.dataSource,
          updateDescription: {
            updatedFields: doc
          }
        });
      }
    );
    this.model.schema.post(
      ["deleteOne", "findOneAndDelete"],
      (doc) => {
        this.notifyDataChange("dataDeleted", {
          source: this.dataSource,
          documentKey: { _id: doc._id }
        });
      }
    );
  }
  makeQuery(conditions) {
    return conditions.reduce((query, condition) => {
      switch (condition.operator) {
        case "IN" /* IN */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $in: condition.value }
          });
        case "EQUALS" /* EQUALS */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: condition.value
          });
        case "GT" /* GT */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $gt: condition.value }
          });
        case "LT" /* LT */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: { $lt: condition.value }
          });
        case "CONTAINS" /* CONTAINS */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: {
              $in: Array.isArray(condition.value) ? condition.value : [condition.value]
            }
          });
        case "REGEX" /* REGEX */:
          return __spreadProps(__spreadValues({}, query), {
            [condition.field]: {
              $in: Array.isArray(condition.value) ? condition.value.map((val) => new RegExp(val, "i")) : [new RegExp(condition.value, "i")]
            }
          });
        default:
          throw new Error(`Unsupported operator: ${condition.operator}`);
      }
    }, {});
  }
  create(data) {
    return __async(this, null, function* () {
      try {
        return yield this.model.create(data);
      } catch (error) {
        Logger.error(
          `Error during document insertion: ${error.message}`
        );
        throw error;
      }
    });
  }
  delete(id) {
    return __async(this, null, function* () {
      try {
        const result = yield this.model.deleteOne({
          _id: new import_mongoose2.default.Types.ObjectId(id)
        });
        if (result.deletedCount === 0) {
          Logger.warn(`No document found with id: ${id}`);
          return false;
        }
        Logger.info(`Document with id: ${id} successfully deleted`);
        return true;
      } catch (error) {
        Logger.error(
          `Error during document deletion: ${error.message}`
        );
        throw error;
      }
    });
  }
  find(criteria) {
    return __async(this, null, function* () {
      const query = this.makeQuery(criteria.conditions);
      const data = yield this.model.find(query).limit(criteria.limit || 0).exec();
      return data.map((item) => {
        if (item._id) {
          const _a = item.toObject(), { _id } = _a, rest = __objRest(_a, ["_id"]);
          return __spreadValues({
            _id: _id.toString()
          }, rest);
        }
        return item.toObject();
      });
    });
  }
  update(criteria, data) {
    return __async(this, null, function* () {
      try {
        const updateData = data;
        const query = this.makeQuery(criteria.conditions);
        const result = yield this.model.updateOne(query, {
          $set: updateData
        }).exec();
        if (result.matchedCount === 0) {
          Logger.warn(`No document found matching the criteria`);
          return false;
        }
        if (result.modifiedCount === 0) {
          Logger.info(`No changes made to document`);
          return false;
        }
        Logger.info(`Document successfully updated`);
        return true;
      } catch (error) {
        Logger.error(`Error during document update: ${error.message}`);
        throw error;
      }
    });
  }
};
_MongooseProvider.connections = /* @__PURE__ */ new Map();
_MongooseProvider.externalModels = /* @__PURE__ */ new Map();
_MongooseProvider.instances = /* @__PURE__ */ new Map();
var MongooseProvider = _MongooseProvider;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Agent,
  ConsentAgent,
  ConsentAgentRouter,
  ContractAgent,
  ContractAgentRouter,
  Logger,
  MongoDBProvider,
  MongooseProvider,
  NegotiationAgentRouter,
  Profile
});
//# sourceMappingURL=index.js.map