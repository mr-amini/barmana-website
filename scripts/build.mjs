import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { mounts, output } from "./project.mjs";

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const { directory, prefix } of mounts) {
  await cp(directory, path.join(output, prefix), {
    recursive: true,
    filter: (file) => path.basename(file) !== ".DS_Store",
  });
}

await writeFile(
  path.join(output, "404.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found</title><h1>Page not found</h1><p><a href="/">Return to home</a></p></html>\n',
);
console.log("Built dist/ — deploy this directory to a static host.");
