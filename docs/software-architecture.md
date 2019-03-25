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

### Any iCalendar URL

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

## Software Components

### Hosting Provider — Heroku

- \+ Extremely easy setup.
- \+ Free tier suitable for development.
- \+ Automatic deployment with Git integration.
- \+ One-click load balancing and encryption.
- \+ Managed databases, if we ever need them.
- \− It's relatively expensive.

#### Alternatives

- Self-Hosting
    - \+ Easy setup.
    - \+ Payments are bundled with my Internet and electricity bill.
    - \+ I guess if I lived close to UNSW, it could be faster.
    - \− It's definitely going to be slower because Australian domestic Internet
         connections are terrible and NBN is a trainwreck.
    - \− Reliability sucks.
    - \− Lots of maintenance.
- Amazon EC2
    - \+ Cheaper (Heroku is built on top of EC2).
    - \− It'd take a lot of time to set up and maintain.
- DigitalOcean
    - \+ Cheaper.
    - \+ Free credit is provided for students.
    - \− A tiny bit more setup is needed.
    - \− DigitalOcean's managed solutions are immature and more expensive.
- Other VPS Providers
    - \− Some more setup.
    - \− Smaller communities than the alternatives, so we'd have fewer
         integrations and fewer people to ask for help.

Overall, our approach to hosting is to be as provider-agnostic as possible, and
initially use the provider that lets us avoid thinking about infrastructure.

### Cache — In-Memory

- \+ Simple.
- \− If we ever need to add more than one server, then the number of requests
     would be linear in the number of servers.
- \− The server is conceptually still stateless, but the fact that every server
     has its own hidden cache might lead to weird results when, for example, the
     user refreshes a page.

#### Alternatives

- Redis
    - \+ The cache can be shared.
    - \+ The server stays stateless.
    - \− Slightly more complicated.
- PostgreSQL
    - \− More complicated.
    - \− Much slower.
    - \− We don't need high reliability for a cache.

We decided to go with an in-memory cache because it was simple. However, we
split caching out into its own class, so that we can, if needed, switch to Redis
with minimal effort if we ever need to.

### Database — None

The database is a traditional part of the technology stack, but we don't need
one, so I don't have to pick one! I'd totally pick PostgreSQL, though.

### Serverside Platform — Node.js + JavaScript

- \+ Dynamic typing enables faster prototyping and more concise code.
- \+ A very large community and package ecosystem.
- \+ A very low barrier to entry.
- \+ The asynchronous execution model allows it to serve requests while others
     are waiting on I/O, which is particularly useful when your server is mostly
     just a facade for other servers.
- \+ Node.js' multitasking is cooperative and it's single-threaded, which means
     we don't have to worry about locking resources.
- \+ V8 is probably the fastest implementation of a scripting language ever.
- \+ Seamless de/serialization of JSON, which is used both to talk to the data
     data source and to the client.
- \− Dynamic typing makes bugs easier to miss.
- \− If we ever need to do anything computationally-intensive, Node's lack of
    parallelism means we can't just write it as a regular function. Instead,
    we'd have to use worker threads or something similarly messy.

#### Alternatives

- Node.js + TypeScript
    - \+ Static, inferred typing can help detect bugs and enforce interfaces
         without sacrificing development speed.
    - \− A relatively high barrier to entry; JavaScript is assumed knowledge.
    - \− TypeScript could easily die in the next few years, just like
         CoffeeScript, and the many other popular compile-to-JavaScript languages
         that preceded it.
    - \− Parts of TypeScript, like the sum types, are designed in a pretty
        convoluted way in order to maintain compatibility with JavaScript.
- Rust
    - \+ Very nice syntax.
    - \+ Static, inferred typing.
    - \+ As fast as C, and the frameworks regularly top benchmarks.
    - \− The ecosystem is tiny and rapidly evolving.
    - \− Many people find it hard to learn.
- C / C++
    - \+ Fast.
    - \+ You can be productive quickly.
    - \− Weakly typed and unmanaged, making them way too dangerous to use on the
         server. It's really hard to be confident that code is safe.
- Go
    - \+ A big web-development ecosystem.
    - \− The language is statically typed, but doesn't have type inference,
         algebraic data types or generics. This means that it has all the
         drawbacks of static typing, with few of the advantages.
- Java
    - \+ Fast.
    - \+ Old.
    - \+ Great IDE integration.
    - \− It's unbearably verbose.
    - \− Package management and project structure are relatively tortuous.
    - \− Most hosting providers support self-contained binaries, and all support
         Node.js, but many don't support the JVM, which limits portability.
- Python
    - \+ Dynamically, gradually typed.
    - \+ Very easy to learn.
    - \+ A big web-development ecosystem.
    - \− CPython is very slow.
    - \− Gradual typing is immature and somewhat ugly.
    - \− The async ecosystem is very immature.

Our top priorities are safety, development speed, and ecosystem size, and
because JavaScript is managed, dynamically-typed, and has a huge ecosystem, it
was a pretty easy choice.

### Serverside Operating System — Linux

We're pretty much forced to use Linux, since it's what all the hosting providers
run. Node.js abstracts away most operating system details, though, so
cross-platform support should come for free if we ever need it.

### Serverside Web Framework — Express

- \+ No boilerplate.
- \+ Extremely simple.
- \+ The largest user base, and the most integrations.

#### Alternatives

- Meteor
    - \+ Pretty popular.
    - \− Tightly integrated server and client.
    - \− Very opinionated (e.g. MongoDB is the only first-class database).
- Sails
    - \+ Automatic API generation.
    - \+ WebSocket integration.
    - \− Pretty opinionated.
    - \− Small community.
- Koa
    - \+ No boilerplate.
    - \+ Extremely simple.
    - \+ Uses Promises instead of callbacks.
    - \− Small community.

Since we value simplicity, and we don't want our framework to lock us into other
arbitrary choices, Koa and Express were the obvious choices. Although Koa does
seem to be a small improvement over Express, the frameworks are more similar
than they are different, and Express' ecosystem is more valuable than Koa's
improvements.

### Clientside Operating System — Any

The web platform makes the user's choice of OS completely irrelevant.

### Web Browser — `since 2018`

Note that the strings given can be evaluated [here](https://browserl.ist).

- \+ Enables us to use a variety of new features without massive polyfills.
- \+ Reaches 85.21% of Australia at the time of writing.
- \− Some of that 14.79% might want to use our service.

#### Alternatives

- `defaults`
    - \+ 87.02% is a bit bigger than 85.21%.
    - \− It requires over 100KB of polyfills, slowing downloads and increasing
         bandwidth costs significantly.
- `latest 2 versions`
    - \+ 86.72% is also a bit bigger than 85.21%.
    - \+ People are likely to be using the latest version of their browsers.
    - \− Still needs all of those polyfills.

We want to minimize the size of the compiled application, and we expect that our
target market, university students, keep their browsers relatively up-to-date, so
we believe that `since 2018` is a reasonable choice.

### Clientside Framework — Custom

- \+ Much smaller bundle sizes.
- \+ The framework is so small that we know exactly what's happening.
- \+ We can add any features we want.
- \− Sometimes involves reinventing the wheel.
- \− It won't have any experts working on it, so it won't be as optimized.
- \− No community.

#### Alternatives

- React
    - \+ The Virtual DOM makes it easy to write correct and fast code without
         having to think carefully about state transitions.
    - \+ A developer tools extension.
    - TODO
- Vue
    - \+ A developer tools extension.
    - \+ The framework is only 21KB GZipped.
    - \− Nonstandard HTML.
    - TODO
- Angular
    - \+ A developer tools extension.
    - \− Nonstandard HTML.
    - \− Low adoption outside Google.
    - \− The framework is 111KB GZipped.
    - \− Angular introduces a lot of its own concepts, which makes for a steep
         learning curve.
- Elm
    - \+ A very pleasant Haskell-ish language.
    - \+ A very good debugger and REPL.
    - \− A steep learning curve.
    - \− It's hard to convince people to learn an entirely new architecture, and
         so it increases the barrier to contribution.
    - \− Political issues with the package registry.

TODO: Conclusion.

## Minimum Server Requirements

Any Linux that supports the latest release of Node.js should be sufficient. But
if you want some numbers, it should run on anything that fulfils the requirements
below, including, in particular, Heroku's Free and Hobby tiers.

- Architecture: x64
- Memory: 512MB
- Storage: 256MB
- Operating System: Linux (Kernel 3.10+)

## TODO: Summary of Benefits
