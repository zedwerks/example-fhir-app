// launch.js

import express from 'express';
import fetch from 'node-fetch';
import * as client from 'openid-client';
import settings from '../settings.js'; // 👈 make sure the .js extension is included
const router = express.Router();

async function smartConfiguration(fhirBaseUrl) {
  const base = new URL(fhirBaseUrl);
  const smartConfigUrl = new URL('/.well-known/smart-configuration', base);

  console.log(`Fetching SMART configuration from ${smartConfigUrl.href}`);

  return fetch(smartConfigUrl.href, {
    headers: { Accept: 'application/json' },
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch SMART configuration: ${response.status} ${response.statusText}`);
    }
    return response.json();
  });
}

/**
 * SMART on FHIR Launch
 * Receives ?iss and ?launch, fetches SMART configuration,
 * then builds an authorization URL using openid-client + PKCE.
 */
router.get('/', async (req, res) => {
  try {
    const { iss, launch } = req.query;
    if (!iss || !launch) {
      return res.status(400).send('Missing iss or launch parameter');
    }

    const fhirBaseUrl = decodeURIComponent(iss);
    req.session.issuer = fhirBaseUrl;

    // 1️⃣ Fetch SMART configuration from the FHIR server

    const smartConfig = await smartConfiguration(fhirBaseUrl);

    console.log(`SMART Config: ${JSON.stringify(smartConfig, null, 2)}`);

    const issuerUrlString = smartConfig.issuer || null; // bullshit. 


    // 2️⃣ Conduct discovery using openid-client
    const clientId = settings.clientId;
    const issuerUrl = new URL(issuerUrlString); // 👈 ensure it's a URL object
    let config = await client.discovery(issuerUrl, clientId);

    // 3️⃣ Generate PKCE parameters
    const code_verifier = client.randomPKCECodeVerifier();
    const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
    const state = client.randomState();
    const nonce = client.randomNonce();;

    req.session.code_verifier = code_verifier;

    // 4️⃣ Build the parameters for the OIDC client
    const redirect_uri = settings.callbackUrl;
    const code_challenge_method = 'S256';
    const scope = settings.scopes || 'openid launch patient/Patient.read';

    const parameters = {
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method,
      aud: fhirBaseUrl, // SMART requires `aud` to match FHIR base URL
      launch,
      state,
      nonce, // optional but recommended
    };

    // ✅ store minimal context
    req.session.oauth = { code_verifier, state, nonce };

    // 5️⃣ Invoke the OIDC authorization
    let redirectTo = client.buildAuthorizationUrl(config, parameters);
    console.log('redirecting to', redirectTo.href)
    // now redirect the user to redirectTo.href
    res.redirect(redirectTo);

  } catch (err) {
    console.error('SMART launch error:', err);
    res.status(500).send(`SMART Launch Error: ${err.message}`);
  }
});

export default router;