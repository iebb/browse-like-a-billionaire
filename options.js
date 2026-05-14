(async function initOptions() {
  "use strict";

  const CUSTOM_DISPLAY_CURRENCY = "__custom";
  const LARGE_NUMBER_RATE_THRESHOLD = 1_000_000;

  const status = document.querySelector("#status");
  const inputs = [...document.querySelectorAll("input[name='displayNotation']")];
  const displayCurrency = document.querySelector("#displayCurrency");
  const customCurrencyFieldset = document.querySelector("#customCurrencyFieldset");
  const customCurrencyCode = document.querySelector("#customCurrencyCode");
  const customCurrencyBaseAmount = document.querySelector("#customCurrencyBaseAmount");
  const customCurrencyBaseCurrency = document.querySelector("#customCurrencyBaseCurrency");
  const numberFormatFieldset = inputs[0].closest("fieldset");

  const rates = await loadRates();
  const rateCodes = Object.keys(rates).sort();

  populateCurrencySelect(displayCurrency, rateCodes, { includeZwd: true, includeCustom: true });
  populateCurrencySelect(customCurrencyBaseCurrency, rateCodes);

  const stored = await chrome.storage.sync.get({
    displayNotation: "scientific",
    displayCurrency: "zwd",
    customCurrencyCode: "xxx",
    customCurrencyBaseAmount: 100,
    customCurrencyBaseCurrency: "cny"
  });

  const selected = stored.displayNotation === "plain" ? "plain" : "scientific";
  displayCurrency.value = resolveDisplayCurrencyValue(stored.displayCurrency);
  customCurrencyCode.value = normalizeCustomCode(stored.customCurrencyCode) || "xxx";
  customCurrencyBaseAmount.value = Number(stored.customCurrencyBaseAmount) > 0 ? stored.customCurrencyBaseAmount : 100;
  customCurrencyBaseCurrency.value = rates[stored.customCurrencyBaseCurrency] ? stored.customCurrencyBaseCurrency : "cny";
  updateCustomCurrencyVisibility();
  updateNumberFormatAvailability();

  displayCurrency.addEventListener("change", async () => {
    await saveSettings();
    updateCustomCurrencyVisibility();
    updateNumberFormatAvailability();
    setStatus("Saved");
  });

  for (const element of [customCurrencyCode, customCurrencyBaseAmount, customCurrencyBaseCurrency]) {
    element.addEventListener("change", async () => {
      await saveSettings();
      updateNumberFormatAvailability();
      setStatus("Saved");
    });
  }

  for (const input of inputs) {
    input.checked = input.value === selected;
    input.addEventListener("change", async () => {
      if (!input.checked) {
        return;
      }

      await saveSettings();
      setStatus("Saved");
    });
  }

  async function loadRates() {
    const response = await fetch(chrome.runtime.getURL("rates/usd.min.json"));
    const payload = await response.json();
    return payload.usd || {};
  }

  function populateCurrencySelect(select, codes, options = {}) {
    select.replaceChildren();

    if (options.includeZwd) {
      select.append(new Option("ZWD - Original Zimbabwe dollar (Z$)", "zwd"));
    }

    if (options.includeCustom) {
      select.append(new Option("Custom currency", CUSTOM_DISPLAY_CURRENCY));
    }

    for (const code of codes) {
      select.append(new Option(code.toUpperCase(), code));
    }
  }

  function resolveDisplayCurrencyValue(value) {
    if (value === CUSTOM_DISPLAY_CURRENCY) {
      return CUSTOM_DISPLAY_CURRENCY;
    }

    if (value === "zwd" || rates[value]) {
      return value;
    }

    return "zwd";
  }

  async function saveSettings() {
    const checkedNotation = inputs.find((input) => input.checked);
    await chrome.storage.sync.set({
      displayCurrency: displayCurrency.value,
      displayNotation: checkedNotation ? checkedNotation.value : "scientific",
      customCurrencyCode: normalizeCustomCode(customCurrencyCode.value) || "xxx",
      customCurrencyBaseAmount: Number(customCurrencyBaseAmount.value) > 0 ? Number(customCurrencyBaseAmount.value) : 100,
      customCurrencyBaseCurrency: rates[customCurrencyBaseCurrency.value] ? customCurrencyBaseCurrency.value : "cny"
    });
  }

  function normalizeCustomCode(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
  }

  function updateCustomCurrencyVisibility() {
    customCurrencyFieldset.hidden = displayCurrency.value !== CUSTOM_DISPLAY_CURRENCY;
  }

  function updateNumberFormatAvailability() {
    const enabled = displayCurrency.value === "zwd" || Boolean(rates[displayCurrency.value] > LARGE_NUMBER_RATE_THRESHOLD);
    numberFormatFieldset.dataset.disabled = enabled ? "false" : "true";
    for (const input of inputs) {
      input.disabled = !enabled;
    }
  }

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
})();
