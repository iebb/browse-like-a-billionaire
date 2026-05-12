import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../converter.js", import.meta.url), "utf8");
const sandbox = { globalThis: {} };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "converter.js" });

const api = sandbox.BrowseLikeABillionaire;
const rates = api.normalizeRates({
  usd: {
    usd: 1,
    aud: 1.5,
    brl: 5,
    cny: 7,
    egp: 48,
    eur: 0.875,
    gbp: 0.7,
    jpy: 140,
    cad: 1.4,
    hkd: 7.8,
    kwd: 0.3,
    mxn: 18,
    nzd: 1.7,
    rub: 90,
    sar: 3.75,
    sgd: 1.3,
    shib: 100000000,
    chf: 0.8,
    krw: 1300,
    thb: 36,
    twd: 30,
    vnd: 26000,
    btc: 0.00001
  }
});

assert.equal(api.parseAmount("1,250.50"), 1250.5);
assert.equal(api.parseAmount("2.5m"), 2500000);
assert.equal(api.formatZwd(api.convertToZwd(1, "usd", rates)), "Z$3.5x10⁴¹");
assert.equal(api.formatZwd(api.convertToZwd(2, "eur", rates)), "Z$8x10⁴¹");
assert.equal(
  api.formatZwd(api.convertToZwd(1, "usd", rates), { displayNotation: "plain" }),
  "Z$350,000,000,000,000,000,000,000,000,000,000,000,000,000"
);
assert.equal(api.formatCurrency(api.convertCurrency(1, "usd", "eur", rates), "eur"), "€0.88");
assert.equal(api.formatCurrency(api.convertCurrency(1000, "jpy", "usd", rates), "usd"), "$7.14");
assert.equal(api.formatCurrency(api.convertCurrency(1, "jpy", "usd", rates), "usd"), "$0.01");
assert.equal(api.formatCurrency(api.convertCurrency(1, "usd", "jpy", rates), "jpy"), "¥140");
assert.equal(api.formatCurrency(api.convertCurrency(1, "usd", "kwd", rates), "kwd"), "KWD 0.3");
assert.equal(api.formatCurrency(10000000000, "usd", { displayNotation: "scientific" }), "$10,000,000,000");
assert.equal(api.formatCurrency(1234.5, "eur", { renderingLocale: "de-DE" }), "€1.234,5");
assert.equal(
  api.formatZwd(api.convertToZwd(1, "usd", rates), { displayNotation: "plain", renderingLocale: "de-DE" }),
  "Z$350.000.000.000.000.000.000.000.000.000.000.000.000.000"
);

const matches = api.findCurrencyMatches("A thing costs $12.99, EUR 2m, 300 GBP, CA$4, and 0.5 BTC.", rates);
assert.deepEqual(
  JSON.parse(JSON.stringify(matches.map((match) => [match.text, match.currency]))),
  [
    ["$12.99", "usd"],
    ["EUR 2m", "eur"],
    ["300 GBP", "gbp"],
    ["CA$4", "cad"],
    ["0.5 BTC", "btc"]
  ]
);

const canadianDollar = api.findCurrencyMatches("$10", rates, { inferredCurrency: "cad" })[0];
assert.equal(canadianDollar.currency, "cad");
assert.equal(canadianDollar.outputText, "Z$2.5x10⁴²");

const euroOutput = api.findCurrencyMatches("$10", rates, { inferredCurrency: "cad", displayCurrency: "eur" })[0];
assert.equal(euroOutput.currency, "cad");
assert.equal(euroOutput.outputCurrency, "eur");
assert.equal(euroOutput.outputText, "€6.25");

assert.equal(api.findCurrencyMatches("$1", rates, { displayCurrency: "shib", displayNotation: "scientific" })[0].outputText, "SHIB 1x10⁸");
assert.equal(api.findCurrencyMatches("$1", rates, { displayCurrency: "shib", displayNotation: "plain" })[0].outputText, "SHIB 100,000,000");
assert.equal(api.findCurrencyMatches("$1", rates, { displayCurrency: "usd" }).length, 0);
assert.equal(api.findCurrencyMatches("GIP 1", rates, { displayCurrency: "gbp" }).length, 0);
assert.equal(api.findCurrencyMatches("GBP 1", rates, { displayCurrency: "gip" }).length, 0);

assert.equal(api.findCurrencyMatches("35,082円", rates)[0].currency, "jpy");
assert.equal(api.findCurrencyMatches("JPY 100", rates)[0].currency, "jpy");
assert.equal(api.findCurrencyMatches("100元", rates)[0].currency, "cny");
assert.equal(api.findCurrencyMatches("100元", rates, { inferredCurrency: "sgd" })[0].currency, "sgd");
assert.equal(api.findCurrencyMatches("100元", rates, { inferredCurrency: "twd" })[0].currency, "twd");
assert.equal(api.findCurrencyMatches("CN¥100", rates, { inferredCurrency: "jpy" })[0].currency, "cny");
assert.equal(api.findCurrencyMatches("100米ドル", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("米ドル100", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("100ドル", rates, { inferredCurrency: "aud" })[0].currency, "aud");
assert.equal(api.findCurrencyMatches("100美元", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("100美金", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("100人民币", rates)[0].currency, "cny");
assert.equal(api.findCurrencyMatches("100人民幣", rates)[0].currency, "cny");
assert.equal(api.findCurrencyMatches("100新台币", rates)[0].currency, "twd");
assert.equal(api.findCurrencyMatches("100新臺幣", rates)[0].currency, "twd");
assert.equal(api.findCurrencyMatches("100新加坡元", rates)[0].currency, "sgd");
assert.equal(api.findCurrencyMatches("100港元", rates)[0].currency, "hkd");
assert.equal(api.findCurrencyMatches("100 dollars", rates, { inferredCurrency: "cad" })[0].currency, "cad");
assert.equal(api.findCurrencyMatches("100 euros", rates)[0].currency, "eur");
assert.equal(api.findCurrencyMatches("100 pounds", rates)[0].currency, "gbp");
assert.equal(api.findCurrencyMatches("100 Gibraltar pounds", rates)[0].currency, "gbp");
assert.equal(api.findCurrencyMatches("100달러", rates, { inferredCurrency: "hkd" })[0].currency, "hkd");
assert.equal(api.findCurrencyMatches("100원", rates)[0].currency, "krw");
assert.equal(api.findCurrencyMatches("100 dólares estadounidenses", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("100 dollars américains", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("100 US-Dollar", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("100 reais", rates)[0].currency, "brl");
assert.equal(api.findCurrencyMatches("100 долларов США", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("100 рублей", rates)[0].currency, "rub");
assert.equal(api.findCurrencyMatches("100 دولار أمريكي", rates)[0].currency, "usd");
assert.equal(api.findCurrencyMatches("100 ريال سعودي", rates)[0].currency, "sar");
assert.equal(api.findCurrencyMatches("100 dóllar", rates).length, 0);

assert.equal(api.inferCurrencyFromLocale("en-CA"), "cad");
assert.equal(api.inferCurrencyFromLocale("zh-SG"), "sgd");
assert.equal(api.inferCurrencyFromToken("USA"), "usd");
assert.equal(api.inferCurrencyFromToken("United Kingdom"), "gbp");
assert.equal(api.inferCurrencyFromCctld("shop.example.com.au"), "aud");

assert.equal(api.findCurrencyMatches("Version 1.2.3 and build 5000 are not money.", rates).length, 0);

console.log("converter tests passed");
