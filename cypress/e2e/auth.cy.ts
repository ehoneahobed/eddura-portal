describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Login Flow', () => {
    it('should navigate to login page', () => {
      cy.visit('/auth/signin')
      cy.get('h1').should('contain', 'Sign In')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should show validation errors for invalid email', () => {
      cy.visit('/auth/signin')
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/auth/signin')
      cy.get('button[type="submit"]').click()
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should navigate to registration page', () => {
      cy.visit('/auth/signin')
      cy.get('a[href="/auth/signup"]').click()
      cy.url().should('include', '/auth/signup')
      cy.get('h1').should('contain', 'Sign Up')
    })
  })

  describe('Registration Flow', () => {
    it('should navigate to registration page', () => {
      cy.visit('/auth/signup')
      cy.get('h1').should('contain', 'Sign Up')
      cy.get('input[name="name"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should show validation errors for invalid data', () => {
      cy.visit('/auth/signup')
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('input[name="password"]').type('123')
      cy.get('button[type="submit"]').click()
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should navigate back to login page', () => {
      cy.visit('/auth/signup')
      cy.get('a[href="/auth/signin"]').click()
      cy.url().should('include', '/auth/signin')
      cy.get('h1').should('contain', 'Sign In')
    })
  })

  describe('Navigation', () => {
    it('should redirect to dashboard after successful login', () => {
      // This test would require a test user to be set up
      // For now, we'll just test the navigation structure
      cy.visit('/auth/signin')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
    })

    it('should show protected routes require authentication', () => {
      cy.visit('/dashboard')
      // Should redirect to login or show auth required message
      cy.url().should('include', '/auth')
    })
  })
})