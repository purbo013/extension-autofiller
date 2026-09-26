import { bumpVersionIfSourcesChanged } from "./version.mjs";

const { bumped, version } = bumpVersionIfSourcesChanged();
if (bumped) {
  console.log(`Versi extension: ${version} (patch +1 karena ada perubahan kode)`);
} else {
  console.log(`Versi extension: ${version} (tanpa perubahan sejak build terakhir)`);
}
