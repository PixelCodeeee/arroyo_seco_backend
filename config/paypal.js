const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 * PayPal HTTP client setup
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (mode === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  }
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };