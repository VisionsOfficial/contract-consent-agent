import { Profile } from './Profile';
import { Logger } from './Logger';
import { Contract } from './Contract';

export class MatchingService {
  private static instance: MatchingService;

  static retrieveService(refresh: boolean = false): MatchingService {
    if (!MatchingService.instance || refresh) {
      const instance = new MatchingService();
      MatchingService.instance = instance;
    }
    return MatchingService.instance;
  }

  async updateProfile(profile: Profile, data: unknown): Promise<void> {
    try {
      const contract: Contract = data as Contract;

      const otherParticipantsServices = contract.serviceOfferings.filter(
        (service) => service.participant !== profile.uri,
      );

      if (!otherParticipantsServices.length) return;

      const currentRecommendation = profile.recommendations[0];
      if (!currentRecommendation) {
        Logger.error('No recommendations available to compare against.');
        return;
      }

      let matchingEntry = profile.matching[0];
      if (!matchingEntry) {
        matchingEntry = {
          policies: [],
          ecosystemContracts: [],
          services: [],
        };
        profile.matching.push(matchingEntry);
      }

      otherParticipantsServices.forEach((service) => {
        service.policies?.forEach((policy) => {
          const matchingPolicy = currentRecommendation?.policies?.find(
            (recPolicy) => recPolicy.policy === policy.description,
          );

          if (matchingPolicy) {
            const existingMatchingPolicy = matchingEntry.policies.find(
              (mp) => mp.policy === policy.description,
            );
            if (existingMatchingPolicy) {
              existingMatchingPolicy.frequency += 1;
            } else {
              matchingEntry.policies.push({
                policy: policy.description,
                frequency: 1,
              });
            }
          }
        });

        const matchingService = currentRecommendation?.services?.find(
          (recService) =>
            recService.serviceOffering === service.serviceOffering,
        );

        if (matchingService) {
          const existingMatchingService = matchingEntry.services.find(
            (ms) => ms.serviceOffering === service.serviceOffering,
          );
          if (existingMatchingService) {
            existingMatchingService.frequency += 1;
          } else {
            matchingEntry.services.push({
              serviceOffering: service.serviceOffering,
              frequency: 1,
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
        `Profile matching update failed: ${(error as Error).message}`,
      );
    }
  }
}
