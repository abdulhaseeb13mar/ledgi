import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const APP_TYPE = process.argv[2];

const CONFIGS = {
  ledgi: {
    title: "Ledgi",
    favicon: "/khaata-logo.svg",
    loaderSrc: "/khaata-logo.svg",
    loaderClass: "boot-logo loader-image-khaata",
  },
  "kamel-hisaab": {
    title: "Kamel Hisaab",
    favicon: "/kamel-hisaab-app-logo.svg",
    loaderSrc: "/kamel-hisaab-primary.svg",
    loaderClass: "boot-logo",
  },
};

if (!APP_TYPE || !Object.keys(CONFIGS).includes(APP_TYPE)) {
  console.error(`Usage: node scripts/set-app-config.mjs <${Object.keys(CONFIGS).join("|")}>`);
  process.exit(1);
}

const config = CONFIGS[APP_TYPE];
const htmlPath = resolve(__dirname, "../index.html");
let html = readFileSync(htmlPath, "utf-8");

// Replace active (uncommented) favicon
html = html.replace(/^(\s*)<link rel="icon" type="image\/svg\+xml" href="[^"]*" \/>/m, `$1<link rel="icon" type="image/svg+xml" href="${config.favicon}" />`);

// Replace title (use ^ with multiline to skip commented-out lines)
html = html.replace(/^(\s*)<title>[^<]*<\/title>/m, `$1<title>${config.title}</title>`);

// Replace loader image src and class
html = html.replace(
  /<img id="loader-img-id" src="[^"]*" alt="[^"]*" class="[^"]*" \/>/,
  `<img id="loader-img-id" src="${config.loaderSrc}" alt="loader img Logo" class="${config.loaderClass}" />`,
);

writeFileSync(htmlPath, html, "utf-8");
console.log(`index.html configured for: ${APP_TYPE}`);
