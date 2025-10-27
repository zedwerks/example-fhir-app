import express from "express";
import settings from "../settings.js"; // note the .js extension for ESM

const router = express.Router();

// ✅ Simple version
function getCurrentUrl() {
    return new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
}

/* GET OAuth callback */
router.get("/", async (req, res, next) => {
    try {
        console.log(`Got OAuth code: ${req.query.code}`);
        console.log(`State: ${req.query.state}`);

        const error = req.query.error;
        if (error) {
            console.error(`OAuth error: ${error}`);
            return res.status(400).send(`OAuth error: ${error}`);
        }

        if (!req.query.code) {
            return res.status(400).send("Missing authorization code");
        }
        if (!req.query.state) {
            return res.status(400).send("Missing state");
        }

        const { code_verifier, state, nonce } = req.session.oauth;
        const issuerUrl = req.session.issuer;
        const clientId = settings.clientId;

        console.log(`Issuer URL: ${issuerUrl}`);
        console.log(`Client ID: ${clientId}`);
        console.log(`Code Verifier: ${code_verifier}`);
        console.log(`State: ${state}`);
        console.log(`Nonce: ${nonce}`);

        let config = await client.discovery(new URL(issuerUrl), clientId);
        let currentUrl = getCurrentUrl(req);  // URL object

        let tokenResponse = await client.authorizationCodeGrant(config, currentUrl, {
            pkceCodeVerifier: code_verifier,
            expectedNonce: nonce,
            state: state,
            idTokenExpected: true,
        });
        console.log('Token Endpoint Response', tokenResponse);

        req.session.patient_id = tokenResponse.patient;
        req.session.access_token = tokenResponse.access_token;
        req.session.tokenResponse = tokenResponse;
        res.redirect("/app/index");
    } catch (error) {
        console.error("Error in OAuth callback:", error);
        next(error);
    }
});

export default router;