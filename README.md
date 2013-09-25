# oauth-proxy

I am an OAuth 1.0a proxy server. You can pass unsigned requests to me and
I will sign them using OAuth before sending them to their eventual destination.

Tokens and consumer keys are configurable only at start-time, so individual
proxies are limited to a single pair at a time. 2-legged OAuth (often used in
lieu of API keys) is supported by omitting `--token` and `--token-secret`
options.

## Motivations

This looks awfully similar to
[mojodna/oauth-proxy](https://github.com/mojodna/oauth-proxy), so...why?

I got frustrated with the [apparent inability to effectively package Twisted
plugins](https://github.com/mojodna/oauth-proxy/issues/4) and figured that
I would take advantage of Internet Progress to build an ever-so-slightly more
flexible version.

## Installing

Install via `npm`:

```bash
$ npm install -g oauth-proxy
```

## Running

Run the proxy with the provided `oauth-proxy` command:

```bash
$ oauth-proxy \
    --consumer-key <consumer key> \
    --consumer-secret <consumer secret> \
    [--token <token>] \
    [--token-secret <token secret>] \
    [-p <proxy port>] \
    [--ssl]
```

If you'd like to run the proxy as a daemon, run it in a screen or something
(`$PORT` is an alternative way to set the proxy port, so it's Heroku-compatible
if that's your bag).

## Using

This proxy can be used with command-line tools and web browsers alike.

To use it with `curl`:

    $ curl -x localhost:8001 http://host.name/path

To use it with `ab` (ApacheBench):

    $ ab -X localhost:8001 http://host.name/path

To use it with Firefox, open the Network settings panel, under Advanced, and
set a "Manual Proxy Configuration" after clicking the "Settings..." button.
Ensure that "No Proxy for" does *not* include the host that you are attempting
to explore.

## Environment Variables

* `PORT` - proxy port. Defaults to `8001`.
* `OAUTH_CONSUMER_KEY` - (optional) OAuth Consumer Key. Equivalent to passing
  `--consumer-key`.
* `OAUTH_CONSUMER_SECRET` - (optional) OAuth Consumer Secret. Equivalent to
  passing `--consumer-secret`.
* `OAUTH_TOKEN` - (optional) OAuth Access Token. Equivalent to passing
  `--token`.
* `OAUTH_TOKEN_SECRET` - (optional) OAuth Token Secret. Equivalent to passing
  `--token-secret`.

## More Information

More information on using an ancestor of this proxy, including instructions for
obtaining access tokens, is available in [Exploring OAuth-Protected
APIs](http://mojodna.net/2009/08/21/exploring-oauth-protected-apis.html).

## License

Copyright (c) 2013 Seth Fitzsimmons

Published under the MIT license.
