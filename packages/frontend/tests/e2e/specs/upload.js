describe('Check Upload Page', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
  })
  
            it('Should navigate to Upload page', () => {
                cy.visit('/upload')
            });
            describe('auth', () => {
                it('gets 420 error when not connected', () => {
                  cy.contains("420").should("exist")
                })
            })
            
})