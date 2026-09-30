(() => {
  const startSetup = document.getElementById("startSetup");
  const setupPanel = document.getElementById("setupPanel");
  const testFlow = document.getElementById("testFlow");
  const result = document.getElementById("setupResult");
  const select = document.getElementById("systemSelect");
  const steps = [...document.querySelectorAll(".step")];

  const connectorIds = {
    "Google Workspace": "google_workspace",
    "SAP / ERP": "sap_erp",
    "SQL Database": "sql_database",
    "REST API": "rest_api"
  };

  function openSetup() {
    setupPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function readinessCheck() {
    const system = select.value;
    const connector = connectorIds[system];
    result.textContent = "Checking UZMO connector service…";
    testFlow.disabled = true;

    try {
      const catalogResponse = await fetch("/api/uzmo/connector-catalog");
      if (!catalogResponse.ok) throw new Error("catalog_unavailable");
      const catalog = await catalogResponse.json();
      const found = catalog.connectors.some(item => item.id === connector);
      if (!found) throw new Error("connector_not_registered");

      const response = await fetch("/api/uzmo/validate-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: connector, config: {} })
      });
      const data = await response.json();

      steps.forEach((step, index) => step.classList.toggle("active", index === 0));
      result.textContent = data.ok
        ? system + " configuration is valid."
        : system + " is registered, but configuration is not complete yet: " + data.errors.join(", ") + ".";

    } catch (error) {
      result.textContent = "UZMO connector service is not reachable yet. No client system was contacted.";
    } finally {
      testFlow.disabled = false;
    }
  }

  startSetup.addEventListener("click", openSetup);
  testFlow.addEventListener("click", readinessCheck);
})();