# Software Architecture

Architecturally, the software is a standard web application.

- There is conceptually one server, although this may simply be a facade for
  multiple instances of the server behind a proxy.
- The server receives requests from many clients, and serves them responses.
- The server also requests data from several third-party data sources, which it
  transforms and combines appropriately before sending to the client.
- The server is conceptually stateless, but caches responses in order to improve
  performance and avoid hitting the usage limits of the third-party sources.

## Data Sources

### Transport for New South Wales Trip Planner API

- **Homepage**: https://opendata.transport.nsw.gov.au/node/601/exploreapi
- **Terms**: Creative Commons Attribution 4.0
- **Usage Limits**:
    - Quota: 60,000 requests / day
    - Rate Limit: 5 requests / second

The Trip Planner API, given any two locations and a list of allowed modes of
transport, returns a list of the trips between the two locations that will soon
depart.

For our application, we exclusively use UNSW and Central Station as our two
locations. This enables us to cache the results, and thus ignore the harsh rate
limit. It should be emphasized that this isn't a compromise, since we never
wanted our product to include an entire trip planner.

Additionally, we use almost none of the information returned by the trip planner
API, and return JSON following our own schema. Compared to directly feeding the
API's JSON to the client, this results in much less transferred data. But more
importantly, it eliminates the coupling between the client and the Trip Planner
API, which means that the client is impervious to any changes made by TfNSW, and
we could hypothetically even replace their API with that of another provider.

### Dark Sky API

- **Homepage**: https://darksky.net/dev
- **Terms**: [Attribution with Link](https://darksky.net/dev/docs/terms)
- **Usage Limits**: 1,000 requests / day

The Dark Sky API provides weather forecasts at various timescales, including
precipitation data, temperature data and human-readable summaries of the weather
in multiple languages.

For our application, we want to provide rain alerts on an optimistic basis.
Moreover, we do not have access to the user's location, since asking for it
would require an amount of trust that we simply haven't earnt. As a consequence
of these two factors, we only need the precipitation data at UNSW.

As with the TfNSW Trip Planner API, we cache the results, enabling us to easily
meet the usage limits. And again, we throw away almost all of the provided data,
and convert the important data to fit our own schema, eliminating coupling
between the client and the weather API. It is especially important to avoid
coupling in the case of weather APIs, since they are often shut down.

### iCalendar Endpoints

- **Homepage**: N/A
- **Terms**: N/A
- **Usage Limits**: N/A

Fetching a user-supplied iCalendar endpoint should return an iCalendar file
encoding the user's events. The main iCalendar endpoints are those provided by
UNSW's Personal Timetable Service, but the user is free to use any source that
they want (e.g. Google Calendar), or to use multiple sources.

The calendars are the most important data displayed in our application, since
they are used to display both the user's timetable and the current / upcoming
day of classes. Since the iCalendar format is standardized and there is at least
one popular clientside library for parsing them (namely, mozilla-comm/iCal.js),
we opted to directly process the iCalendar files on the client.

Due to CORS restrictions, the client cannot simply fetch the URL provided by the
user. Instead, the server needs to act as a forward proxy, for arbitrary URLs.
Of course, this presents a security problem, since it can be used to mask one's
identity, or to circumvent school / workplace website filters. In order to
greatly reduce the utility of this proxy, we ensured that it only serves files
with the MIME type `text/calendar`.

## TODO: Software Components

TODO: Stack Diagram

- Load Balancer
- Serverside Operating System
- Serverside Platform
- Serverside Framework
- Server Code

- Client Code
- Clientside Framework
- Clientside Platform
- Clientside Operating System

- Client Bundler
- NO Serverside Cache
- NO Serverside Database

- What are the components?
- Decide which language should be used for each component.
- Choose the technologies and frameworks.
- Decide on suitable languages for the prototype.

## TODO: Machine Requirements
## TODO: Benefits
