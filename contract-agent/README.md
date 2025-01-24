# Contract-Consent-Agent

## Configuring a DataProvider (`contract-agent.config`)

The configuration file is a JSON document consisting of sections, where each section describes the configuration for a specific **DataProvider**. Below is a detailed explanation of the available attributes:

- **`source`**: The name of the target collection or table that the DataProvider connects to.
- **`url`**: The base URL of the database host.
- **`dbName`**: The name of the database to be used.
- **`watchChanges`**: A boolean that enables or disables change monitoring for the DataProvider. When enabled, events will be fired upon detecting changes.
- **`hostsProfiles`**: A boolean indicating whether the DataProvider hosts the profiles.
- **`existingDataCheck`**: A boolean that enables the creation of profiles when the module is initialized.

### Example Configuration

Here’s an example of a JSON configuration:

```json
{
  "source": "profiles",
  "url": "mongodb://localhost:27017",
  "dbName": "contract_consent_agent_db",
  "watchChanges": false,
  "hostsProfiles": true,
  "existingDataCheck": true
}
```
## Installation
```bash
pnpm install
```

## Run Tests Independently by Agent

### Contract Agent
```bash
pnpm test-cca-contract
```

### Consent Agent
```bash
pnpm test-cca-consent
```

## Generate Test Reports Independently by Agent

### Contract Agent
```bash
pnpm report-cca-contract
```

### Consent Agent
```bash
pnpm report-cca-consent
```

## Run Full Test Suite
```bash
pnpm test
```

## Build the Project
```bash
pnpm build
```

## Swagger Documentation
You can find the Swagger documentation at the following link:

[Swagger Documentation](./docs/swagger.json)
