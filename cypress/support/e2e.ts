// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for authentication
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/signin')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/auth/signin')
})

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@example.com', 'adminpassword')
})

Cypress.Commands.add('loginAsUser', () => {
  cy.login('user@example.com', 'userpassword')
})

// Add custom commands for data management
Cypress.Commands.add('createSchool', (schoolData: any) => {
  cy.request({
    method: 'POST',
    url: '/api/schools',
    body: schoolData,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})

Cypress.Commands.add('createScholarship', (scholarshipData: any) => {
  cy.request({
    method: 'POST',
    url: '/api/scholarships',
    body: scholarshipData,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})

// Add custom commands for navigation
Cypress.Commands.add('visitAdmin', (path: string = '') => {
  cy.visit(`/admin${path}`)
})

Cypress.Commands.add('visitDashboard', (path: string = '') => {
  cy.visit(`/dashboard${path}`)
})

// Add custom commands for form interactions
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([name, value]) => {
    cy.get(`[name="${name}"]`).type(value)
  })
})

Cypress.Commands.add('selectOption', (selectName: string, optionValue: string) => {
  cy.get(`[name="${selectName}"]`).click()
  cy.get(`[data-value="${optionValue}"]`).click()
})

// Add custom commands for assertions
Cypress.Commands.add('shouldShowSuccessMessage', (message: string) => {
  cy.get('[data-testid="success-message"]').should('contain', message)
})

Cypress.Commands.add('shouldShowErrorMessage', (message: string) => {
  cy.get('[data-testid="error-message"]').should('contain', message)
})

// Add custom commands for table interactions
Cypress.Commands.add('clickTableRow', (rowIndex: number) => {
  cy.get('tbody tr').eq(rowIndex).click()
})

Cypress.Commands.add('deleteTableRow', (rowIndex: number) => {
  cy.get('tbody tr').eq(rowIndex).find('[data-testid="delete-button"]').click()
  cy.get('[data-testid="confirm-delete"]').click()
})

// Extend Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      loginAsAdmin(): Chainable<void>
      loginAsUser(): Chainable<void>
      createSchool(schoolData: any): Chainable<any>
      createScholarship(scholarshipData: any): Chainable<any>
      visitAdmin(path?: string): Chainable<void>
      visitDashboard(path?: string): Chainable<void>
      fillForm(formData: Record<string, string>): Chainable<void>
      selectOption(selectName: string, optionValue: string): Chainable<void>
      shouldShowSuccessMessage(message: string): Chainable<void>
      shouldShowErrorMessage(message: string): Chainable<void>
      clickTableRow(rowIndex: number): Chainable<void>
      deleteTableRow(rowIndex: number): Chainable<void>
    }
  }
}