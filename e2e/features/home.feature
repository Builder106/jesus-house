Feature: Home page renders core parish content

  The homepage is the parish's entire web presence in phase 1. These
  scenarios verify the SSR-rendered HTML carries the parish identity,
  the Sunday rhythm, and the two CTAs a first-time guest needs.

  Scenario: Home shows the Sunday service time
    Given I am on the home page
    Then I see the text "Sunday Service"
    And I see the text "9:00 AM"

  Scenario: Home shows the parish address
    Given I am on the home page
    Then I see the text "120 Washington Street"

  Scenario: "Plan a Visit" navigates to the visit page
    Given I am on the home page
    When I click the "Plan a Visit" link
    Then the URL is "/visit"

  Scenario: The ride CTA is an email link to the parish
    Given I am on the home page
    Then the "Need a ride?" link opens an email to the parish

  Scenario: Footer shows the RCCG affiliation
    Given I am on the home page
    Then the footer shows the parish affiliation
