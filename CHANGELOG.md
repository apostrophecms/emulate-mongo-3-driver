## 1.0.2

Tolerate MongoDB URIs that break the WHATWG URL parser.

## 1.0.1

We no longer set `useNewUrlParser` and `useUnifiedTopology` by default. These caused bc breaks for some and while the old parser and topology generate deprecation warnings they work correctly with 2.x code. We shouldn't default these on again unless we've added measures to mitigate incompatibilities with 2.x code.

## 1.0.0

Initial release.
