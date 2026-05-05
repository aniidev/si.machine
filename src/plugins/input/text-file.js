import { readFile } from "node:fs/promises";
import path from "node:path";

export default {
  type: "text-file",
  kind: "input",
  create(context, options = {}) {
    return {
      async capture() {
        if (!options.path) {
          throw new Error('The "text-file" input plugin requires options.path.');
        }

        const filePath = path.resolve(context.rootDir, options.path);
        const text = await readFile(filePath, "utf8");

        return {
          sourceType: "text",
          contentType: "text/plain",
          data: text,
          metadata: {
            filePath
          }
        };
      }
    };
  }
};
