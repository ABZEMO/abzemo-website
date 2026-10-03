import test from "node:test";
import assert from "node:assert/strict";
import { getConnectorManifest, listConnectorManifests } from "../uzmo/integrations/manifest.js";
test("connector manifest has unique ids", () => {
  const ids = listConnectorManifests().map(item => item.id);
  assert.equal(ids.length, new Set(ids).size);
});
test("Zoho CRM manifest exposes required configuration", () => {
  assert.deepEqual(getConnectorManifest("zoho_crm").env, ["UZMO_ZOHO_CLIENT_ID", "UZMO_ZOHO_CLIENT_SECRET", "UZMO_ZOHO_REFRESH_TOKEN"]);
});
