Feature: First-time guest plans a Sunday visit

  A continuous narrative walkthrough modeling how a first-time guest —
  say, a Wesleyan student — discovers the parish: landing on the home
  page, taking in the hero, scanning the Sunday service time and address,
  following "Plan a Visit", and finding the ride offer.

  Scenario: New guest lands, reads the service time, plans a visit, finds the ride offer
    Given I am on the home page
    When I pause for narration
    And I scroll down by 700 pixels
    Then I see the text "Sunday Service"
    And I see the text "9:00 AM"
    When I pause for narration
    And I scroll down by 700 pixels
    Then I see the text "120 Washington Street"
    When I scroll back to the top
    And I click the "Plan a Visit" link
    Then I see the visit page welcome
    When I pause for narration
    And I scroll down by 800 pixels
    Then the ride section offers an email link to the parish
    And the ride section offers a phone link to the parish
    And I pause for narration
