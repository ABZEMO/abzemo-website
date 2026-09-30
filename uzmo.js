(() => {
  const startSetup = document.getElementById("startSetup");
  const setupPanel = document.getElementById("setupPanel");
  const testFlow = document.getElementById("testFlow");
  const result = document.getElementById("setupResult");
  const steps = [...document.querySelectorAll(".step")];

  function openSetup() {
    setupPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function readinessCheck() {
    const system = document.getElementById("systemSelect").value;
    steps.forEach((step, index) => step.classList.toggle("active", index === 0));
    result.textContent = system + " selected. UI readiness check complete; live authentication/connection requires the future UZMO connector service.";
  }

  startSetup.addEventListener("click", openSetup);
  testFlow.addEventListener("click", readinessCheck);
})();