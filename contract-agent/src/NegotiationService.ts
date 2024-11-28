import { Profile } from './Profile';
import { ProfilePreference } from './types';
import { Contract, Policy, ServiceOffering } from './Contract';
import { Logger } from './Logger';

export class NegotiationService {
  private static instance: NegotiationService;

  static retrieveService(refresh: boolean = false): NegotiationService {
    if (!NegotiationService.instance || refresh) {
      const instance = new NegotiationService();
      NegotiationService.instance = instance;
    }
    return NegotiationService.instance;
  }

  isPolicyAcceptable(profile: Profile, policy: Policy): boolean {
    if (!profile.configurations.allowPolicies) {
      Logger.info('Policies are not allowed by the profile configurations.');
      return false;
    }
    return profile.preference.some((pref) =>
      policy.permission.every((perm) =>
        pref.policies.some((p) => p.policy === perm.action && p.frequency > 0),
      ),
    );
  }

  areServicePoliciesAcceptable(
    profile: Profile,
    serviceOffering: ServiceOffering,
  ): boolean {
    return serviceOffering.policies.every((policy) =>
      this.isPolicyAcceptable(profile, policy),
    );
  }

  canAcceptContract(profile: Profile, contract: Contract): boolean {
    if (contract.status !== 'active') {
      Logger.info('Contract is not active.');
      return false;
    }

    const acceptableServices = contract.serviceOfferings.every(
      (serviceOffering) =>
        this.areServicePoliciesAcceptable(profile, serviceOffering),
    );

    return acceptableServices;
  }

  updateProfilePreferences(
    profile: Profile,
    preferences: Partial<ProfilePreference>[],
  ): void {
    try {
      const validPreferences = preferences.filter(
        (pref): pref is ProfilePreference =>
          pref !== undefined && pref !== null,
      );

      profile.preference = [...profile.preference, ...validPreferences];
      Logger.info(`Profile preferences updated for ${profile.url}.`);
    } catch (error) {
      Logger.error(`Failed to update profile preferences: ${error}`);
    }
  }

  negotiateContract(
    profile: Profile,
    contract: Contract,
  ): { canAccept: boolean; reason?: string } {
    try {
      if (!this.canAcceptContract(profile, contract)) {
        return {
          canAccept: false,
          reason:
            'Contract does not align with profile preferences or policies.',
        };
      }

      return { canAccept: true };
    } catch (error) {
      Logger.error(`Negotiation failed: ${error}`);
      return {
        canAccept: false,
        reason: 'An error occurred during negotiation.',
      };
    }
  }
}
