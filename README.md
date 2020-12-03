# example-fhir-app
Example app launched with SMART on FHIR OAuth 2.0, built using Express. This app does not use credentials, but rather the EHR launch (SMART on FHIR) workflow as documented by Epic Systems here: https://fhir.epic.com/Documentation?docId=oauth2

## Prerequisites ##
You will need an Epic App Orchard API key, which you can get by signing up for an account here: https://open.epic.com

## Installation ##
1. Clone the repository to your machine
2. Open `settings.js` and add your client ID.

## Workflow ##
3. `cd` to the directory on your machine where the code resides
4. Install dependencies: `npm install`
5. Start the application: `npm start`
6. Log in at https://open.epic.com/Launchpad/OAuth2Sso and update the settings: 
  - Launch URL: http://localhost:3000/launch
  - Redirect URL: http://localhost:3000/oauth-callback
7. Click Launch App to launch
8. If all works correctly you should see data pulled from Epic's example DB for the patient context you selected
