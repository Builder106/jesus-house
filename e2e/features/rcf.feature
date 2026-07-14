Feature: RCF page presents the campus fellowship

  The Wesleyan RCF page answers a student's questions — what is RCF, when
  and where does it meet, and how do I get to Sunday service. The weekly
  gathering facts are the verified-facts contract (launch + meeting
  flyers, Apr–May 2026); the ride tie-in mirrors the parish's signature
  ride ministry.

  Scenario: RCF page introduces the fellowship
    Given I am on the "/rcf" page
    Then I see the heading "Keep the fire going."
    And the page title contains "Wesleyan RCF"

  Scenario: RCF page shows the Friday gathering
    Given I am on the "/rcf" page
    Then I see the text "Friday Fellowship"
    And I see the text "Rehearsal Hall 109"

  Scenario: RCF page shows the Saturday study
    Given I am on the "/rcf" page
    Then I see the text "Saturday Study"
    And I see the text "PAC 333"

  Scenario: RCF page shows the Sunday service
    Given I am on the "/rcf" page
    Then I see the text "Sunday Service"
    And I see the text "9:00 AM"

  Scenario: RCF page offers a ride by email
    Given I am on the "/rcf" page
    Then the "Request a ride" link opens an email to the parish
