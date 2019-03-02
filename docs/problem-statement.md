# Problem Statement

## Ideal

Ideally UNSW students should have a place where they can quickly access the
university-related information that they rely on every day, in a succinct and
actionable format. This information includes:

- what classes they have, especially in the present and in the near future,
- the bus schedules between UNSW Kensington and Central station, and
- whether rain is forecast at UNSW.

Ideally this information is also available offline, so that people without
mobile data also have easy access to at least their class timetable.

## Reality

Currently, this information is extremely scattered. Regarding timetables,

- the MyUNSW website provides timetables, but is very cumbersome.
- the Uni-Verse app offers much of the desired functionality but is very buggy
  and provides a very cluttered interface.
- the TimeWeave app shows users timetables, but is bizarrely fixated on social
  messaging and timetable sharing, neither of which users often want. Moreover,
  they use questionable means of obtaining user data, which involve taking
  students' credentials and scraping the MyUNSW website.
- UNSW provides a Personal Timetable service that can be integrated with any
  calendar, but this is a well-hidden feature, and calendars generally don't
  provide a well-tailored experience for school timetables. Moreover, at least
  in Google Calendar, class locations are not accurately displayed, which makes
  the timetable less useful.
- many students (especially first-years) ultimately enter their timetable
  manually into their calendar application, which is tedious and error-prone.

Regarding the other pieces of information, they usually need to be sought out
separately, which is pretty inconvenient. Additionally, some optimistic students
don't even check the weather, and end up getting drenched.

## Consequences

The lack of an easy way to access all of this information is annoying, since
arguably every single student needs access to most or all of it every day. The
current solutions are either poorly implemented or too general, and so there is
definite room for improvement.

## Proposal

We propose the development of a new application that will serve as the ideal
place to quickly access this information. It must be a web app in order to
maximize reach, and it must be offline-capable, so that people aren't left
without access to their class timetable.

Our plan is to provide a layer over UNSW's Personal Timetable service,
integrating it with various other services, including Transport for New South
Wales' trip planner API, in order to provide all this information in a more
pleasant and digestible format than what's currently available.
