import { expect } from 'chai';
import { NegotiationService } from '../NegotiationService';
import { Profile } from '../Profile';
import { Contract, Policy, ServiceOffering } from '../Contract';

describe('NegotiationService', () => {
  let negotiationService: NegotiationService;
  let profile: Profile;
  let contract: Contract;

  beforeEach(() => {
    negotiationService = NegotiationService.retrieveService(true);

    profile = new Profile({
      url: 'test-url',
      configurations: {
        allowPolicies: true,
        allowRecommendation: true,
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

    it('should reject contract with disallowed ecosystem', () => {
      contract.ecosystem = 'disallowed-ecosystem';
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
  });
});
