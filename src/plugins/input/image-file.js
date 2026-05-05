import { readFile } from "node:fs/promises";
import path from "node:path";

export default {
  type: "image-file",
  kind: "input",
  create(context, options = {}) {
    return {
      async capture() {
        if (!options.path) {
          throw new Error('The "image-file" input plugin requires options.path.');
        }

        const filePath = path.resolve(context.rootDir, options.path);
        const buffer = await readFile(filePath);

        return {
          sourceType: "image",
          contentType: options.contentType || "image/png",
          data: buffer.toString("base64"),
          metadata: {
            filePath,
            encoding: "base64"
          }
        };
      }
    };
  }
};
