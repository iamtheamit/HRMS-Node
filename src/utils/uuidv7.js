const crypto = require('crypto');

// Simple UUIDv7 generator (RFC 4122 variant bits + version 7)
// This implementation creates a 16-byte UUID where the first 6 bytes are the
// unix millisecond timestamp (48 bits, big-endian), then 10 bytes of randomness.
// It sets the version to 7 and the RFC 4122 variant bits.

function uuidv7() {
  const ts = BigInt(Date.now()); // milliseconds since epoch
  const buf = crypto.randomBytes(16);

  // write 48-bit timestamp big-endian into buf[0..5]
  for (let i = 0; i < 6; i++) {
    // shift amount: (5 - i) * 8
    const shift = BigInt((5 - i) * 8);
    buf[i] = Number((ts >> shift) & 0xffn);
  }

  // keep rest of buf[6..15] as random, but set version and variant
  // set version (high nibble of byte 6) to 0b0111 (7)
  buf[6] = (buf[6] & 0x0f) | 0x70;
  // set variant to RFC 4122 (10xxxxxx) in byte 8
  buf[8] = (buf[8] & 0x3f) | 0x80;

  // convert to hex string and format as UUID 8-4-4-4-12
  const hex = buf.toString('hex');
  return (
    hex.slice(0, 8) + '-' +
    hex.slice(8, 12) + '-' +
    hex.slice(12, 16) + '-' +
    hex.slice(16, 20) + '-' +
    hex.slice(20)
  );
}

module.exports = uuidv7;
