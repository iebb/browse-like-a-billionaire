(async function runBrowseLikeABillionaire() {
  "use strict";

  const api = globalThis.BrowseLikeABillionaire;
  if (!api) {
    return;
  }

  const ratesUrl = chrome.runtime.getURL("rates/usd.min.json");
  let payload;

  try {
    const response = await fetch(ratesUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    payload = await response.json();
  } catch (error) {
    console.warn("[Browse Like a Billionaire] Could not load currency rates.", error);
    return;
  }

  const rates = api.normalizeRates(payload);
  const rateDate = payload.date || "";
  let settings = await loadSettings();
  let observer = null;

  function annotate(root) {
    api.annotateRoot(root, rates, rateDate, settings);
  }

  async function loadSettings() {
    const inferredCurrency = api.inferPageCurrency(document, location);
    const renderingLocale = document.documentElement.lang || navigator.language || "en-US";

    if (!chrome.storage || !chrome.storage.sync) {
      return api.normalizeOptions({ inferredCurrency, renderingLocale });
    }

    const stored = await chrome.storage.sync.get({
      displayNotation: "scientific",
      displayCurrency: "zwd",
      customCurrencyCode: "xxx",
      customCurrencyBaseAmount: 100,
      customCurrencyBaseCurrency: "cny"
    });

    return api.normalizeOptions({
      ...stored,
      inferredCurrency,
      renderingLocale
    });
  }

  function observe() {
    if (!observer) {
      return;
    }

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function rerenderPage() {
    if (observer) {
      observer.disconnect();
    }

    api.unwrapAnnotations(document);
    annotate(document.body || document.documentElement);
    observe();
  }

  annotate(document.body || document.documentElement);

  const pending = new Set();
  let scheduled = false;

  function schedule(root) {
    if (!root) {
      return;
    }

    pending.add(root);
    if (scheduled) {
      return;
    }

    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      const roots = [...pending];
      pending.clear();

      for (const root of roots) {
        if (root.isConnected || root === document.body || root === document.documentElement) {
          annotate(root);
        }
      }
    }, 120);
  }

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        schedule(mutation.target);
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
          schedule(node);
        }
      }
    }
  });

  observe();

  document.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement) && !(target instanceof HTMLInputElement)) {
      return;
    }

    const nextSettings = await loadSettings();
    if (nextSettings.inferredCurrency !== settings.inferredCurrency) {
      settings = nextSettings;
      rerenderPage();
    }
  }, true);

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(async (changes, areaName) => {
      if (areaName !== "sync" || !changes.displayNotation && !changes.displayCurrency) {
        return;
      }

      settings = await loadSettings();
      rerenderPage();
    });
  }
})();
