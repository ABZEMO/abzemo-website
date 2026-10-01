(() => {
  const setupPanel = document.getElementById("setupPanel");
  const startSetup = document.getElementById("startSetup");
  const testFlow = document.getElementById("testFlow");
  const downloadManifest = document.getElementById("downloadManifest");
  const result = document.getElementById("setupResult");
  const systemSelect = document.getElementById("systemSelect");
  const authMethod = document.getElementById("authMethod");
  const connectionFields = document.getElementById("connectionFields");
  const environmentName = document.getElementById("environmentName");
  const permissionLevel = document.getElementById("permissionLevel");
  const steps = [...document.querySelectorAll(".step")];
  const wizardSteps = [...document.querySelectorAll(".wizard-step")];
  const dots = [...document.querySelectorAll("[data-wizard-dot]")];
  let currentStep = 1;
  let catalog = null;

  const connectorIds = {
    "Google Workspace": "google_workspace",
    "SAP / ERP": "sap_erp",
    "SQL Database": "sql_database",
    "REST API": "rest_api"
  };

  const fieldDefinitions = {
    google_workspace: [
      ["client_id", "OAuth client ID", "text"],
      ["redirect_uri", "OAuth redirect URI", "url"]
    ],
    sap_erp: [
      ["base_url", "SAP / ERP base URL", "url"]
    ],
    sql_database: [
      ["host", "Database host / private gateway", "text"],
      ["database", "Database name", "text"],
      ["username", "Database username", "text"]
    ],
    rest_api: [
      ["base_url", "API base URL", "url"]
    ]
  };

  const authMethods = {
    google_workspace: ["OAuth2"],
    sap_erp: ["OAuth2", "API key", "Certificate"],
    sql_database: ["Username / password", "Certificate"],
    rest_api: ["OAuth2", "API key", "Basic authentication"]
  };

  function openSetup() {
    setupPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function renderFields() {
    const connector = connectorIds[systemSelect.value];
    authMethod.innerHTML = authMethods[connector].map(value =>
      '<option value="' + value + '">' + value + '</option>'
    ).join("");
    connectionFields.innerHTML = fieldDefinitions[connector].map(([key, label, type]) =>
      '<label>' + label + '<input data-config="' + key + '" type="' + type + '" autocomplete="off"></label>'
    ).join("");
    connectionFields.insertAdjacentHTML("beforeend",
      '<p class="secret-hint">Secret fields are intentionally not collected here. Enter them only in the secure deployment/runtime secret manager.</p>'
    );
  }

  function setStep(next) {
    currentStep = Math.max(1, Math.min(4, next));
    wizardSteps.forEach(step => step.classList.toggle("active", Number(step.dataset.wizardStep) === currentStep));
    dots.forEach(dot => {
      const n = Number(dot.dataset.wizardDot);
      dot.classList.toggle("active", n <= currentStep);
    });
    if (currentStep === 4) renderReview();
  }

  function configFromForm() {
    const config = {};
    connectionFields.querySelectorAll("[data-config]").forEach(input => {
      config[input.dataset.config] = input.value.trim();
    });
    return config;
  }

  function renderReview() {
    const connector = connectorIds[systemSelect.value];
    const config = configFromForm();
    document.getElementById("setupReview").innerHTML =
      '<div><strong>Environment</strong><span>' + escapeHtml(environmentName.value.trim() || "Unnamed environment") + '</span></div>' +
      '<div><strong>Connector</strong><span>' + escapeHtml(systemSelect.value) + '</span></div>' +
      '<div><strong>Authentication</strong><span>' + escapeHtml(authMethod.value) + '</span></div>' +
      '<div><strong>Permission</strong><span>' + escapeHtml(permissionLevel.value) + '</span></div>' +
      '<div><strong>Configured fields</strong><span>' + Object.keys(config).filter(k => config[k]).length + ' of ' + Object.keys(config).length + '</span></div>';
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
  }

  async function loadCatalog() {
    const response = await fetch("/api/uzmo/connector-catalog");
    if (!response.ok) throw new Error("catalog_unavailable");
    catalog = await response.json();
    if (!catalog.connectors.some(item => item.id === connectorIds[systemSelect.value])) {
      throw new Error("connector_not_registered");
    }
  }

  async function readinessCheck() {
    const connector = connectorIds[systemSelect.value];
    result.textContent = "Validating configuration…";
    testFlow.disabled = true;
    try {
      await loadCatalog();
      const response = await fetch("/api/uzmo/validate-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: connector,
          auth_method: authMethod.value,
          permission: permissionLevel.value,
          config: configFromForm()
        })
      });
      const data = await response.json();
      result.textContent = data.ok
        ? "Configuration is valid. Live connection is not claimed."
        : "Configuration needs correction: " + data.errors.join(", ") + ".";
      if (data.ok) steps.forEach(step => step.classList.toggle("active", true));
    } catch (_) {
      result.textContent = "UZMO connector service is not reachable. No client system was contacted.";
    } finally {
      testFlow.disabled = false;
    }
  }

  const capabilityRegistry = document.getElementById("capabilityRegistry");
  const capabilitySearch = document.getElementById("capabilitySearch");
  const capabilitySummary = document.getElementById("capabilitySummary");
  let capabilityCatalog = [];

  function renderCapabilityRegistry(filter = "") {
    if (!capabilityRegistry) return;
    const query = filter.trim().toLowerCase();
    const filtered = capabilityCatalog.map(domain => ({
      ...domain,
      capabilities: domain.capabilities.filter(item =>
        !query ||
        domain.name.toLowerCase().includes(query) ||
        domain.assistant.toLowerCase().includes(query) ||
        item.toLowerCase().includes(query)
      )
    })).filter(domain => domain.capabilities.length);

    const total = filtered.reduce((sum, domain) => sum + domain.capabilities.length, 0);
    capabilitySummary.textContent = query
      ? total + " matching capabilities across " + filtered.length + " domains"
      : capabilityCatalog.length + " domains · " + capabilityCatalog.reduce((sum, domain) => sum + domain.capabilities.length, 0) + " registered capabilities";

    capabilityRegistry.innerHTML = filtered.length
      ? filtered.map(domain =>
          '<article class="capability-card">' +
            '<div class="capability-card-head">' +
              '<div><span class="capability-assistant">' + escapeHtml(domain.assistant) + '</span><h3>' + escapeHtml(domain.name) + '</h3></div>' +
              '<span class="capability-count">' + domain.capabilities.length + '</span>' +
            '</div>' +
            '<ul>' + domain.capabilities.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul>' +
          '</article>'
        ).join("")
      : '<div class="capability-empty">No registered capability matches that search.</div>';
  }

  async function loadCapabilityCatalog() {
    if (!capabilityRegistry) return;
    try {
      const response = await fetch("/api/uzmo/capability-catalog", { cache: "no-store" });
      if (!response.ok) throw new Error("capability_catalog_unavailable");
      const data = await response.json();
      if (!data.ok || !Array.isArray(data.domains)) throw new Error("invalid_capability_catalog");
      capabilityCatalog = data.domains;
      renderCapabilityRegistry();
    } catch (_) {
      capabilitySummary.textContent = "Capability registry unavailable.";
      capabilityRegistry.innerHTML = '<div class="capability-empty">UZMO could not load its capability registry. No external system was contacted.</div>';
    }
  }

  function downloadSanitizedManifest() {
    const manifest = {
      platform: "UZMO",
      version: "0.1.0",
      environment: environmentName.value.trim() || "unnamed",
      connector: connectorIds[systemSelect.value],
      authentication: authMethod.value,
      permission: permissionLevel.value,
      config: Object.fromEntries(
        Object.entries(configFromForm()).map(([key, value]) => [key, value ? "[configured-at-deployment]" : ""])
      ),
      secrets: "managed outside the browser",
      live_connection_verified: false
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "uzmo-installation-manifest.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  startSetup.addEventListener("click", openSetup);
  systemSelect.addEventListener("change", renderFields);
  document.querySelectorAll(".wizard-next").forEach(button => button.addEventListener("click", () => setStep(currentStep + 1)));
  document.querySelectorAll(".wizard-back").forEach(button => button.addEventListener("click", () => setStep(currentStep - 1)));
  testFlow.addEventListener("click", readinessCheck);
  downloadManifest.addEventListener("click", downloadSanitizedManifest);
  capabilitySearch?.addEventListener("input", event => renderCapabilityRegistry(event.target.value));
  loadCapabilityCatalog();
  renderFields();
})();