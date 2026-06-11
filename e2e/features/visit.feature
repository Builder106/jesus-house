Feature: Visit page guides a first-time guest

  The visit page answers the two questions a guest has — when is the
  service, and how do I get there. The ride request (the parish picks up
  Wesleyan students on Sundays) is the signature feature; v1 is a simple
  mailto/tel CTA, with a full form coming in phase 2.

  Scenario: Visit page introduces the visit
    Given I am on the "/visit" page
    Then I see a heading about visiting

  Scenario: Visit page shows the Sunday service time
    Given I am on the "/visit" page
    Then I see the text "9:00 AM"

  Scenario: Visit page offers a ride by email
    Given I am on the "/visit" page
    Then the ride section offers an email link to the parish

  Scenario: Visit page offers a ride by phone
    Given I am on the "/visit" page
    Then the ride section offers a phone link to the parish
