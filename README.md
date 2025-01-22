# Consent/Contracts Negotiating Agent

## Overview

The Consent/Contracts Agent is a comprehensive library designed to seamlessly integrate with the contract-manager and consent-manager. It offers a range of features, including the automatic creation and management of profiles, automation of processes, personalized recommendations, and the ability to set and manage profile preferences. Additionally, the agent provides a robust routing system to facilitate the efficient flow of these functionalities.

## Design Document
See the design document [here](docs/design-document.md).

## Features

- **Consent Profile Management**: Enables profiles for users in the consent-manager.
- **Contract Profile Management**: Enables profiles for contract-manager.
- **Contract Negotiation Management**: Enables organizations to define default rules and conditions for negotiation.

## Building instructions
_Describe how to build the BB._

E.g.: `docker build -t <bb name>:latest .` or `npm install` 

## Running instructions
_Describe how to run the BB._

E.g.: `docker compose up` or `npm run`

## Technical Usage Scenarios

- Individuals can manage their consent preferences effectively.
- Organizations can streamline the negotiation process for data sharing agreements.
- Automatic recommendations for services based on consent profiles and contract profiles.

## API Documentation

The API for the Consent/Contracts Negotiating Agent is documented using Swagger. You can find the API routes and their descriptions in the `swagger.json` file located in the `contract-agent/docs` directory.

### Example API Endpoints

- **Get Recommendations**: `GET /profile/{profileId}/recommendations/consent`
- **Set Preferences**: `POST /profile/{profileId}/preferences`
- **Get Preferences**: `GET /profile/{profileId}/preferences`
- **Negotiate Contract**: `POST /negotiation/contract/negotiate`

### Example usage
_Describe how to check some basic functionality of the BB._
E.g.:

Send the following requests to the designated endpoints:
| Endpoint      | Example input | Expected output   |
| ------------- | ------------- | ----------------- |
| /hello        | World         | 200, Hello World! |
|               |               |                   |
|               |               |                   |

## Integrations

### Direct Integrations with Other Building Blocks

- [Consent Manager](https://github.com/Prometheus-X-association/consent-manager)
- [Contract Manager](https://github.com/Prometheus-X-association/contract-manager)

### Standards

- **Data Format Standards**: JSON-LD, ISO 3166-1 alpha-2, ISO 8601, ODRL

## Architecture

The architecture consists of several key components:

1. **Contract Agent**: Manages contract profiles of organizations and facilitates contract negotiations.
2. **Consent Agent**: Manages consent preferences of individuals and automates responses to consent requests.

## Logging and Operations

The agent logs operations, errors, and warnings to facilitate troubleshooting and debugging. It also imposes limits and usage constraints to ensure efficient operation.

## Testing

The testing strategy includes unit tests, integration tests, and UI tests to ensure the correctness and reliability of functionalities.

## Usage in the Dataspace

The Consent/Contracts Negotiating Agent enhances data usage and sharing agreements management, ensuring compliance with policies and streamlining processes for individuals and organizations.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## Contact
For more information, please contact the project maintainers.