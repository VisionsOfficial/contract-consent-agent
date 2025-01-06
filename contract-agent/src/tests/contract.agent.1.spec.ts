import { expect } from 'chai';
import { NegotiationService } from '../NegotiationService';
import { Profile } from '../Profile';
import { Contract, Policy, ServiceOffering } from '../Contract';

describe('Negotiation Service Test Cases', () => {
  let negotiationService: NegotiationService;
  let profile: Profile;
  let contract: Contract;

  beforeEach(() => {
    negotiationService = NegotiationService.retrieveService(true);

    profile = new Profile({
      uri: 'test-uri',
      configurations: {
        allowPolicies: true,
        allowRecommendations: true,
      },
      preference: [
        {
          policies: [
            { policy: 'allowed-policy', frequency: 1 },
            { policy: 'another-policy', frequency: 1 },
          ],
          services: ['allowed-service'],
          ecosystems: ['test-ecosystem'],
        },
      ],
      recommendations: [],
      matching: [],
    });

    contract = new Contract({
      ecosystem: 'test-ecosystem',
      status: 'active',
      serviceOfferings: [
        {
          participant: 'test-participant',
          serviceOffering: 'allowed-service',
          policies: [
            {
              description: 'allowed-policy',
              permission: [],
              prohibition: [],
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [],
      orchestrator: '',
      purpose: [],
      revokedMembers: [],
      rolesAndObligations: [],
    });
  });

  describe('isPolicyAcceptable', () => {
    it('should accept allowed policy', () => {
      const policy: Policy = {
        description: 'allowed-policy',
        permission: [],
        prohibition: [],
      };
      expect(negotiationService.isPolicyAcceptable(profile, policy)).to.be.true;
    });

    it('should reject disallowed policy', () => {
      const policy: Policy = {
        description: 'disallowed-policy',
        permission: [],
        prohibition: [],
      };
      expect(negotiationService.isPolicyAcceptable(profile, policy)).to.be
        .false;
    });

    it('should reject all policies when allowPolicies is false', () => {
      profile.configurations.allowPolicies = false;
      const policy: Policy = {
        description: 'allowed-policy',
        permission: [],
        prohibition: [],
      };
      expect(negotiationService.isPolicyAcceptable(profile, policy)).to.be
        .false;
    });

    it('should check policy frequency', () => {
      profile.preference[0].policies[0].frequency = 0;
      const policy: Policy = {
        description: 'allowed-policy',
        permission: [],
        prohibition: [],
      };
      expect(negotiationService.isPolicyAcceptable(profile, policy)).to.be
        .false;
    });
  });

  describe('isServiceAcceptable', () => {
    it('should accept allowed service', () => {
      const service: ServiceOffering = {
        participant: 'test',
        serviceOffering: 'allowed-service',
        policies: [],
      };
      expect(negotiationService.isServiceAcceptable(profile, service)).to.be
        .true;
    });

    it('should reject disallowed service', () => {
      const service: ServiceOffering = {
        participant: 'test',
        serviceOffering: 'disallowed-service',
        policies: [],
      };
      expect(negotiationService.isServiceAcceptable(profile, service)).to.be
        .false;
    });
  });

  describe('canAcceptContract', () => {
    it('should accept valid contract', () => {
      expect(negotiationService.canAcceptContract(profile, contract)).to.be
        .true;
    });

    it('should reject inactive contract', () => {
      contract.status = 'inactive';
      expect(negotiationService.canAcceptContract(profile, contract)).to.be
        .false;
    });

    it('should reject contract with unacceptable service offering', () => {
      contract.serviceOfferings[0].serviceOffering = 'disallowed-service';
      expect(negotiationService.canAcceptContract(profile, contract)).to.be
        .false;
    });

    it('should reject contract with unacceptable policies', () => {
      contract.serviceOfferings[0].policies.push({
        description: 'disallowed-policy',
        permission: [],
        prohibition: [],
      });
      expect(negotiationService.canAcceptContract(profile, contract)).to.be
        .false;
    });
  });

  describe('negotiateContract', () => {
    it('should return successful negotiation for valid contract', () => {
      const result = negotiationService.negotiateContract(profile, contract);
      expect(result.canAccept).to.be.true;
      expect(result.reason).to.be.undefined;
    });

    it('should return failed negotiation with unacceptable policies', () => {
      contract.serviceOfferings[0].policies.push({
        description: 'disallowed-policy',
        permission: [],
        prohibition: [],
      });

      const result = negotiationService.negotiateContract(profile, contract);
      expect(result.canAccept).to.be.false;
      expect(result.unacceptablePolicies).to.include('disallowed-policy');
    });

    it('should return failed negotiation with unacceptable services', () => {
      contract.serviceOfferings[0].serviceOffering = 'disallowed-service';

      const result = negotiationService.negotiateContract(profile, contract);
      expect(result.canAccept).to.be.false;
      expect(result.unacceptableServices).to.include('disallowed-service');
    });

    it('should handle errors during negotiation', () => {
      const corruptedContract = null;
      const result = negotiationService.negotiateContract(
        profile,
        corruptedContract as any,
      );
      expect(result.canAccept).to.be.false;
      expect(result.reason).to.equal('An error occurred during negotiation.');
    });

    it('should identify multiple unacceptable policies and services', () => {
      contract.serviceOfferings = [
        {
          participant: 'test',
          serviceOffering: 'disallowed-service-1',
          policies: [
            {
              description: 'disallowed-policy-1',
              permission: [],
              prohibition: [],
            },
          ],
        },
        {
          participant: 'test',
          serviceOffering: 'disallowed-service-2',
          policies: [
            {
              description: 'disallowed-policy-2',
              permission: [],
              prohibition: [],
            },
          ],
        },
      ];

      const result = negotiationService.negotiateContract(profile, contract);
      expect(result.canAccept).to.be.false;
      expect(result.unacceptablePolicies).to.have.members([
        'disallowed-policy-1',
        'disallowed-policy-2',
      ]);
      expect(result.unacceptableServices).to.have.members([
        'disallowed-service-1',
        'disallowed-service-2',
      ]);
    });
  });

  describe('areServicePoliciesAcceptable', () => {
    it('should accept service with acceptable policies', () => {
      const service: ServiceOffering = {
        participant: 'test',
        serviceOffering: 'allowed-service',
        policies: [
          {
            description: 'allowed-policy',
            permission: [],
            prohibition: [],
          },
        ],
      };
      expect(negotiationService.areServicePoliciesAcceptable(profile, service))
        .to.be.true;
    });

    it('should reject service with unacceptable policies', () => {
      const service: ServiceOffering = {
        participant: 'test',
        serviceOffering: 'allowed-service',
        policies: [
          {
            description: 'disallowed-policy',
            permission: [],
            prohibition: [],
          },
        ],
      };
      expect(negotiationService.areServicePoliciesAcceptable(profile, service))
        .to.be.false;
    });
  });

  describe('updateProfilePreferences', () => {
    it('should add valid preferences', () => {
      const newPreferences = [
        {
          policies: [{ policy: 'new-policy', frequency: 1 }],
          services: ['new-service'],
          ecosystems: ['new-ecosystem'],
        },
      ];

      const initialLength = profile.preference.length;
      negotiationService.updateProfilePreferences(profile, newPreferences);
      expect(profile.preference.length).to.equal(initialLength + 1);
    });

    it('should filter out invalid preferences', () => {
      const invalidPreferences = [
        undefined,
        null,
        { policies: null, services: [], ecosystems: [] },
      ];

      const initialLength = profile.preference.length;
      negotiationService.updateProfilePreferences(
        profile,
        invalidPreferences as any,
      );
      expect(profile.preference.length).to.equal(initialLength);
    });
  });

  describe('NegotiationService Singleton', () => {
    it('should return the same instance without refresh', () => {
      const instance1 = NegotiationService.retrieveService();
      const instance2 = NegotiationService.retrieveService();
      expect(instance1).to.equal(instance2);
    });

    it('should return a new instance with refresh', () => {
      const instance1 = NegotiationService.retrieveService();
      const instance2 = NegotiationService.retrieveService(true);
      expect(instance1).to.not.equal(instance2);
    });
  });
});
