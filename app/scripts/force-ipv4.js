// Preload: forces dns.lookup to IPv4-only.
// Required because this machine has no global IPv6 route, and Node v22+'s
// native fetch (undici) does not reliably fall back from ENETUNREACH IPv6
// to IPv4 — causing intermittent "TypeError: fetch failed" on expo start.
const dns = require('dns');
const _orig = dns.lookup.bind(dns);
dns.lookup = function ipv4Lookup(hostname, options, callback) {
  if (typeof options === 'function') { callback = options; options = {}; }
  if (typeof options === 'number') { options = { family: options }; }
  return _orig(hostname, { ...options, family: 4 }, callback);
};
