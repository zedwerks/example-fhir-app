// launch.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { Issuer, generators } = require('openid-client');
const settings = require('../settings');

/**
 * SMART on FHIR Launch
 * Receives ?iss and ?launch, fetches SMART configuration,
 * then builds an authorization URL using openid-client + PKCE.
 */
router.get('/', async (req, res) => {
  try {
    const { iss: fhirBaseUrl, launch } = req.query;
    if (!fhirBaseUrl || !launch) {
      return res.status(400).send('Missing iss or launch parameter');
    }

    req.session.issuer = fhirBaseUrl;

    // 1️⃣ Fetch SMART configuration from the FHIR server
    const smartConfigUrl = `${fhirBaseUrl}/.well-known/smart-configuration`;
    console.log(`Fetching SMART configuration from ${smartConfigUrl}`);

    const response = await fetch(smartConfigUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new Error(`Failed to fetch SMART configuration: ${response.statusText}`);
    }

    const smartConfig = await response.json();

    const authEndpoint = smartConfig.authorization_endpoint;
    const tokenEndpoint = smartConfig.token_endpoint;
    const issuerUrl = smartConfig.issuer || fhirBaseUrl; // fallback if not provided

    // 2️⃣ Construct a temporary Issuer object with discovered endpoints
    const dynamicIssuer = new Issuer({
      issuer: issuerUrl,
      authorization_endpoint: authEndpoint,
      token_endpoint: tokenEndpoint,
    });

    // 3️⃣ Build the OIDC client
    const client = new dynamicIssuer.Client({
      client_id: settings.clientId,
      redirect_uris: [settings.callbackUrl],
      response_types: ['code'],
    });

    // 4️⃣ Generate PKCE parameters
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    req.session.code_verifier = code_verifier;

    // 5️⃣ Construct authorization URL
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: settings.callbackUrl,
      response_type: 'code',
      code_challenge,
      code_challenge_method: 'S256',
      scope: 'launch openid fhirUser patient/*.read offline_access',
      launch,
      state: generators.state(),
      aud: fhirBaseUrl, // SMART requires `aud` to match FHIR base URL
    });

    console.log(`Redirecting to: ${authorizationUrl}`);
    res.redirect(authorizationUrl);

  } catch (err) {
    console.error('SMART launch error:', err);
    res.status(500).send(`SMART Launch Error: ${err.message}`);
  }
});

module.exports = router;