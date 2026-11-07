import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../", import.meta.url));
export const output = path.join(root, "dist");

// Source files and their corresponding paths on the published site.
export const mounts = [
  { directory: path.join(root, "public"), prefix: "" },
  { directory: path.join(root, "src/pages"), prefix: "" },
  { directory: path.join(root, "src/assets"), prefix: "assets" },
];
