// import { MongoDBProvider } from '../MongoDBProvider';
// import { ConsentAgent } from '../ConsentAgent';
// import sinon, { SinonSpy } from 'sinon';
// import { expect } from 'chai';
// import { Agent } from '../Agent';
//
// describe('Consent Agent Test Cases 0', function () {
//   let createdDocument: any;
//   let consentAgent: ConsentAgent;
//   let consentProvider: MongoDBProvider;
//
//   const delay = (ms: number) =>
//     new Promise((resolve) => setTimeout(resolve, ms));
//
//   let updateProfileFromConsentChangeSpy: SinonSpy;
//   let updateProfilesForMembersSpy: SinonSpy;
//   let updateProfilesForServiceOfferingsSpy: SinonSpy;
//   let updateProfileForOrchestratorSpy: SinonSpy;
//   let updateProfileSpy: SinonSpy;
//
//   before(async function () {
//     Agent.setConfigPath('./mocks/consent-agent.config.json', __filename);
//
//     consentAgent = await ConsentAgent.retrieveService();
//     consentProvider = consentAgent.getDataProvider(
//       'consents',
//     ) as MongoDBProvider;
//
//     updateProfileFromConsentChangeSpy = sinon.spy(
//             ConsentAgent.prototype as any,
//             'updateProfileFromConsentChange',
//     );
//     updateProfilesForMembersSpy = sinon.spy(
//             ConsentAgent.prototype as any,
//             'updateProfilesForMembers',
//     );
//     updateProfilesForServiceOfferingsSpy = sinon.spy(
//             ConsentAgent.prototype as any,
//             'updateProfilesForServiceOfferings',
//     );
//     updateProfileForOrchestratorSpy = sinon.spy(
//             ConsentAgent.prototype as any,
//             'updateProfileForOrchestrator',
//     );
//     updateProfileSpy = sinon.spy(
//             ConsentAgent.prototype as any,
//             'updateProfile',
//     );
//   });
//
//   after(async function () {
//     updateProfileFromConsentChangeSpy.restore();
//     updateProfilesForMembersSpy.restore();
//     updateProfilesForServiceOfferingsSpy.restore();
//     updateProfileForOrchestratorSpy.restore();
//     updateProfileSpy.restore();
//   });
//
//   it('should verify the flow for creating a consent and updating profiles', async function () {
//     // createdDocument = await consentProvider.create(ConsentBase);
//     // expect(createdDocument).to.have.property('_id');
//
//     await delay(100);
//     await new Promise(setImmediate);
//
//     sinon.assert.calledOnce(updateProfileFromConsentChangeSpy);
//     expect(updateProfileFromConsentChangeSpy.calledOnce).to.be.true;
//
//     sinon.assert.calledOnce(updateProfilesForMembersSpy);
//     sinon.assert.calledOnce(updateProfilesForServiceOfferingsSpy);
//     sinon.assert.calledOnce(updateProfileForOrchestratorSpy);
//
//     // sinon.assert.callCount(
//     //     updateProfileSpy,
//     //     ConsentBase.members.length + ConsentBase.serviceOfferings.length + 1,
//     // );
//   });
//
//   it('should delete the previously created consent successfully', async function () {
//     expect(createdDocument).to.not.be.undefined;
//
//     const deleteResult = await consentProvider.delete(
//       createdDocument._id.toString(),
//     );
//     expect(deleteResult).to.be.true;
//
//     const secondDeleteResult = await consentProvider.delete(
//       createdDocument._id.toString(),
//     );
//     expect(secondDeleteResult).to.be.false;
//   });
// });
