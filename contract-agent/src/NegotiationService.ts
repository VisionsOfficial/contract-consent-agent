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

  /**
   * Checks if a policy is acceptable based on the profile preferences.
   * A policy is acceptable if it matches a profile's allowed policies
   * and has a frequency greater than 0.
   *
   * @param {Profile} profile - The profile to evaluate.
   * @param {Policy} policy - The policy to check.
   * @returns {boolean} - True if acceptable, otherwise false.
   */
  isPolicyAcceptable(profile: Profile, policy: Policy): boolean {
    if (profile?.configurations?.allowPolicies === false) {
      Logger.info('Policies are not allowed by the profile configurations.');
      return false;
    }
    return profile.preference.some((pref) =>
      pref.policies.some(
        (p) => p.policy === policy.description && p.frequency > 0,
      ),
    );
  }

  /**
   * Checks if a service offering is acceptable based on the profile preferences.
   *
   * @param {Profile} profile - The profile to evaluate.
   * @param {ServiceOffering} serviceOffering - The service offering to check.
   * @returns {boolean} - True if acceptable, otherwise false.
   */
  isServiceAcceptable(
    profile: Profile,
    serviceOffering: ServiceOffering,
  ): boolean {
    return profile.preference.some((pref) =>
      pref.services.includes(serviceOffering.serviceOffering),
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
  areServicePoliciesAcceptable(
    profile: Profile,
    serviceOffering: ServiceOffering,
  ): boolean {
    return (
      this.isServiceAcceptable(profile, serviceOffering) &&
      serviceOffering.policies.every((policy) =>
        this.isPolicyAcceptable(profile, policy),
      )
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
  canAcceptContract(profile: Profile, contract: Contract): boolean {
    if (contract.status !== 'active' && contract.status !== 'signed') {
      Logger.info('Contract is not active.');
      return false;
    }
    const acceptableServices = contract.serviceOfferings.every(
      (serviceOffering) =>
        this.areServicePoliciesAcceptable(profile, serviceOffering),
    );
    return acceptableServices;
  }

  /**
   * Updates a profile's preferences by adding new valid preferences.
   * Valid preferences must:
   * - Be neither undefined nor null.
   * - Have policies, services, and ecosystems as arrays.
   */
  updateProfilePreferences(
    profile: Profile,
    preferences: Partial<ProfilePreference>[],
  ): void {
    try {
      const validPreferences = preferences.filter(
        (pref): pref is ProfilePreference =>
          pref !== undefined &&
          pref !== null &&
          Array.isArray(pref.policies) &&
          Array.isArray(pref.services) &&
          Array.isArray(pref.ecosystems),
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
  negotiateContract(
    profile: Profile,
    contract: Contract,
  ): {
    canAccept: boolean;
    reason?: string;
    unacceptablePolicies?: string[];
    unacceptableServices?: string[];
  } {
    try {
      const unacceptablePolicies: string[] = [];
      const unacceptableServices: string[] = [];
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
          reason: 'Contract contains unacceptable policies or services',
          unacceptablePolicies,
          unacceptableServices,
        };
      }
      if (!this.canAcceptContract(profile, contract)) {
        return {
          canAccept: false,
          reason: 'Contract does not align with profile preferences',
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
