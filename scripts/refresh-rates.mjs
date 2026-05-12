import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const packageJsonUrl = new URL("../node_modules/@fawazahmed0/currency-api/package.json", import.meta.url);
const sourceUrl = new URL("../node_modules/@fawazahmed0/currency-api/v1/currencies/usd.min.json", import.meta.url);
const targetDirUrl = new URL("../rates/", import.meta.url);
const targetUrl = new URL("./usd.min.json", targetDirUrl);

const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8"));

await mkdir(targetDirUrl, { recursive: true });
await copyFile(sourceUrl, targetUrl);

console.log(`Copied @fawazahmed0/currency-api ${packageJson.version} USD rates to ${path.relative(process.cwd(), targetUrl.pathname)}`);
