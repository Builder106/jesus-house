Feature: Wesleyan student finds RCF

  A continuous narrative walkthrough modeling how a Wesleyan student
  discovers the campus fellowship: landing on the RCF page, scrolling
  into the flame (the hero dive), meeting the fellowship, reading the
  week's three gatherings, and finding the Sunday ride offer.

  Scenario: Student scrolls into the flame, reads the week, finds the ride
    Given I am on the "/rcf" page
    When I pause for narration
    And I scroll down by 1600 pixels
    And I scroll down by 1600 pixels
    Then I see the heading "A campus fellowship, run by students."
    When I pause for narration
    And I scroll down by 1400 pixels
    Then I see the text "Friday Fellowship"
    And I see the text "Rehearsal Hall 109"
    When I scroll down by 1000 pixels
    Then I see the text "Saturday Study"
    And I see the text "PAC 333"
    When I scroll down by 1000 pixels
    Then I see the text "Sunday Service"
    And I see the text "9:00 AM"
    When I pause for narration
    And I scroll down by 1400 pixels
    Then the "Request a ride" link opens an email to the parish
    When I scroll down by 1200 pixels
    Then I see the heading "Your first Friday is on us."
    And I pause for narration
