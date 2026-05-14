# Browse Like a Billionaire

Chrome extension that annotates currency-like text with a ruby showing the value in original Zimbabwe ZWD.

The target conversion is fixed at `Z$3.5x10⁴¹` per `1 USD`. Other currencies are converted to USD with the USD rate table published by `@fawazahmed0/currency-api`, then multiplied by that fixed ZWD rate.

## Use

1. Run `npm install`.
2. Run `npm run refresh-rates`.
3. Open `chrome://extensions`.
4. Enable Developer mode.
5. Load this folder as an unpacked extension.

## Development

- `npm run refresh-rates` copies `node_modules/@fawazahmed0/currency-api/v1/currencies/usd.min.json` into `rates/usd.min.json`.
- `npm test` validates parsing, symbol inference, and conversion math.
- The extension options page can switch ruby output to any currency in the bundled `@fawazahmed0/currency-api` USD table.
- You can define a custom display currency with a fixed tie to an API currency, for example `XXX = 100 CNY`.
- Fiat outputs use locale-aware formatting; non-fiat outputs use source-significant digits, such as `123 USD -> 0.00123 BTC`.
- Large-number format controls only apply to ZWD and display currencies above `1,000,000` per USD.
- Ambiguous source symbols such as `$` and `kr` are inferred from selected page country/currency controls, ccTLD, and page language before falling back to their default currency.
