import express from "express";
import fetch from "node-fetch";
import settings from "../settings.js"; // 👈 make sure the .js extension is included
const router = express.Router();

function extractImmunizations(data) {
  if (data.resourceType === "Bundle" && Array.isArray(data.entry))
    return data.entry.map((e) => e.resource).filter((r) => r.resourceType === "Immunization");
  if (data.resourceType === "Immunization") return [data];
  if (Array.isArray(data)) return data;
  return [];
}

function getVaccineDisplay(immunization) {
  if (
    immunization.vaccineCode &&
    Array.isArray(immunization.vaccineCode.coding) &&
    immunization.vaccineCode.coding[0].display
  ) {
    return immunization.vaccineCode.coding[0].display;
  }
  return "Unknown Vaccine";
}



/* GET launch page. */
router.get("/", async (req, res, next) => {
  try {
    const options = {
      headers: {
        "Authorization": `Bearer ${req.session.access_token}`,
        "Accept": "application/json",
      },
    };

    console.log("SMART route accessed");

    // Ensure we have the required session data
    if (!req.session.access_token || !req.session.patient_id) {
      return res.status(400).send("Missing access token or patient ID in session");
    }

    // Fetch patient info from FHIR server
    const response = await fetch(
      `${req.session.fhirServerUrl}/Patient/${req.session.patient_id}`,
      options
    );

    if (!response.ok) {
      throw new Error(`FHIR fetch for Patient failed: ${response.status} ${response.statusText}`);
    }

    const patientJson = await response.json();
    console.log("FHIR Patient Data:", patientJson);

    req.session.patient = patientJson;

    // Fetch patient info from FHIR server
    const immzResponse = await fetch(
      `${req.session.fhirServerUrl}/Immunization/?patient=${req.session.patient_id}`,
      options
    );

    if (!immzResponse.ok) {
      throw new Error(`FHIR fetch for Immunization failed: ${immzResponse.status} ${immzResponse.statusText}`);
    }

    const immzJson = await immzResponse.json();

    // Output results
    const famName = patientJson?.name?.[0]?.family || "Unknown";
    const givenName = patientJson?.name?.[0]?.given?.[0] || "Unknown";
    const patientName = `${famName}, ${givenName}`;
    res.render('smart', {
      title: "Example FHIR App",
      patient: JSON.stringify(patientJson, null, 2),
      immunizations: JSON.stringify(immzJson, null, 2),
      patient_name: patientName,
    });
  } catch (error) {
    console.error("Error in route:", error);
    next(error);
  }
});

export default router;