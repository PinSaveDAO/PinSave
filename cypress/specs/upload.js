describe("Check Upload Page", () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });
  it(`setupMetamask should finish metamask setup using secret words`, () => {
    cy.setupMetamask(
      "shuffle stay hair student wagon senior problem drama parrot creek enact pluck",
      "kovan",
      "Tester@1234"
    ).then((setupFinished) => {
      expect(setupFinished).to.be.true;
    });
  });
  it("Should navigate to Upload page", () => {
    cy.visit("/upload");
  });
  describe("auth", () => {
    it("gets 420 error when not connected", () => {
      cy.contains("420").should("exist");
    });
  });
});
