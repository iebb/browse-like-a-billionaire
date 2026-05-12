(async function initOptions() {
  "use strict";

  const status = document.querySelector("#status");
  const inputs = [...document.querySelectorAll("input[name='displayNotation']")];
  const displayCurrency = document.querySelector("#displayCurrency");
  const numberFormatFieldset = inputs[0].closest("fieldset");

  function setStatus(message) {
    status.textContent = message;
    if (message) {
      setTimeout(() => {
        if (status.textContent === message) {
          status.textContent = "";
        }
      }, 1400);
    }
  }

  const stored = await chrome.storage.sync.get({
    displayNotation: "scientific",
    displayCurrency: "zwd"
  });

  const selected = stored.displayNotation === "plain" ? "plain" : "scientific";
  displayCurrency.value = stored.displayCurrency || "zwd";
  updateNumberFormatAvailability();

  displayCurrency.addEventListener("change", async () => {
    await chrome.storage.sync.set({
      displayCurrency: displayCurrency.value
    });
    updateNumberFormatAvailability();
    setStatus("Saved");
  });

  for (const input of inputs) {
    input.checked = input.value === selected;
    input.addEventListener("change", async () => {
      if (!input.checked) {
        return;
      }

      await chrome.storage.sync.set({
        displayNotation: input.value
      });
      setStatus("Saved");
    });
  }

  function updateNumberFormatAvailability() {
    const enabled = displayCurrency.value === "zwd";
    numberFormatFieldset.dataset.disabled = enabled ? "false" : "true";
    for (const input of inputs) {
      input.disabled = !enabled;
    }
  }
})();
