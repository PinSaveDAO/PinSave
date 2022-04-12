describe("Check Upload Page", () => {
  before(() => {
    cy.viewport(1280, 720);
  });
  it("should go to upload page", () => {
    cy.visit("upload/");
  });
  describe("auth", () => {
    it("Should find Upload new post title", () => {
      cy.get("body").then((body) => {
        if (body.text().includes("Please Log In")) {
          cy.findByText("Connect").click();
          cy.findByText("MetaMask").click();
          cy.task("acceptMetamaskAccess");
        }
        cy.contains("Upload new Post");
      });
    });
  });
});
