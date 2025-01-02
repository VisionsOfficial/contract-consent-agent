import { Profile } from './Profile';
import { Logger } from './Logger';
import { Contract } from './Contract';

export class RecommendationService {
  private static instance: RecommendationService;

  static retrieveService(refresh: boolean = false): RecommendationService {
    if (!RecommendationService.instance || refresh) {
      const instance = new RecommendationService();
      RecommendationService.instance = instance;
    }
    return RecommendationService.instance;
  }

  async updateProfile(profile: Profile, data: unknown): Promise<void> {
    try {
      const contract: Contract = data as Contract;

      const newPolicyDescriptions =
        this.collectPolicyDescriptionsForParticipant(contract, profile.uri ?? '');
      const newServiceOfferings = this.collectServiceOfferingsForParticipant(
        contract,
        profile.uri ?? '',
      );
      const contractId = contract._id;

      let recommendation = profile.recommendations[0];

      if (!recommendation) {
        recommendation = {
          policies: [],
          ecosystemContracts: [],
          services: [],
        };
        profile.recommendations.push(recommendation);
      }

      newPolicyDescriptions.forEach((newPolicyDescription) => {
        const existingPolicy = recommendation.policies?.find(
          (p) => p.policy === newPolicyDescription,
        );

        if (existingPolicy) {
          existingPolicy.frequency += 1;
        } else {
          recommendation.policies = recommendation.policies || [];
          recommendation.policies.push({
            policy: newPolicyDescription,
            frequency: 1,
          });
        }
      });

      if (
        contractId &&
        !recommendation?.ecosystemContracts?.includes(contractId)
      ) {
        recommendation?.ecosystemContracts?.push(contractId);
      }

      newServiceOfferings.forEach((newServiceOffering) => {
        const existingService = recommendation.services?.find(
          (s) => s.serviceOffering === newServiceOffering,
        );

        if (existingService) {
          existingService.frequency += 1;
        } else {
          recommendation.services = recommendation.services || [];
          recommendation.services.push({
            serviceOffering: newServiceOffering,
            frequency: 1,
          });
        }
      });

      profile.recommendations[0] = recommendation;
    } catch (error) {
      Logger.error(
        `Profile recommendation update failed: ${(error as Error).message}`,
      );
    }
  }

  private collectPolicyDescriptionsForParticipant(
    contract: Contract,
    participantUri: string,
  ): string[] {
    const descriptions = new Set<string>();

    contract.serviceOfferings?.forEach((service) => {
      if (service.participant === participantUri) {
        service.policies?.forEach((policy) => {
          if (policy?.description) {
            descriptions.add(policy.description);
          }
        });
      }
    });

    return Array.from(descriptions);
  }

  private collectServiceOfferingsForParticipant(
    contract: Contract,
    participantUri: string,
  ): string[] {
    const services = new Set<string>();

    contract.serviceOfferings?.forEach((service) => {
      if (service.participant === participantUri && service.serviceOffering) {
        services.add(service.serviceOffering);
      }
    });

    return Array.from(services);
  }
}
