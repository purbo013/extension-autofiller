import { getVersion, syncManifestVersion } from "./version.mjs";

syncManifestVersion();
console.log(`v${getVersion()}`);
