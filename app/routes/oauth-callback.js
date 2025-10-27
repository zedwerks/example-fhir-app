import express from "express";
import settings from "../settings.js"; // Ensure this has { clientId, clientSecret?, redirectUri? }
import fetch from "node-fetch"; // npm install node-fetch if needed

const router = express.Router();

function getCurrentUrl(req) {
  return new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
}

router.get("/", async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    console.log(`Got OAuth code: ${code}`);
    console.log(`State: ${state}`);

    if (error) {
      console.error(`OAuth error: ${error}`);
      return res.status(400).send(`OAuth error: ${error}`);
    }
    if (!code) return res.status(400).send("Missing authorization code");
    if (!state) return res.status(400).send("Missing state");

    const { code_verifier, state: expectedState, nonce } = req.session.oauth || {};
    const issuerUrl = req.session.oidc_issuer || settings.oidcIssuerUrl || "";
    const client_id = settings.clientId;
    const redirect_uri = settings.redirectUri || "http://localhost:3000/oauth-callback";

    if (state !== expectedState) {
      return res.status(400).send("State mismatch");
    }

    console.log("Issuer URL:", issuerUrl);
    console.log("Client ID:", client_id);
    console.log("Redirect URI:", redirect_uri);
    console.log("Code Verifier:", code_verifier);

    // Discover token endpoint dynamically
    const discoveryUrl = `${issuerUrl}/.well-known/openid-configuration`;
    const discovery = await fetch(discoveryUrl);
    const openidConfig = await discovery.json();
    const tokenEndpoint = openidConfig.token_endpoint;
    console.log("Token endpoint:", tokenEndpoint);

    // Prepare the token request
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      code_verifier,
    });

    // If your client uses client_secret (confidential client), include it:
    if (settings.clientSecret) {
      body.append("client_secret", settings.clientSecret);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body,
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      throw new Error(`Token endpoint error (${tokenResponse.status}): ${text}`);
    }

    if (!tokenResponse.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Expected JSON response from token endpoint");
    }

    // Parse the token response

    const tokenJson = await tokenResponse.json();
    console.log("🔑 Full token JSON response:", tokenJson);

    // Store relevant info in session
    req.session.access_token = tokenJson.access_token;
    req.session.id_token = tokenJson.id_token;
    req.session.refresh_token = tokenJson.refresh_token;
    req.session.tokenResponse = tokenJson;

    // SMART-specific context (FHIR launch params)
    req.session.patient_id = tokenJson.patient;
    req.session.encounter_id = tokenJson.encounter;
    req.session.fhir_context = tokenJson.fhirContext;

    res.redirect("/app/launched");
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    next(error);
  }
});

export default router;