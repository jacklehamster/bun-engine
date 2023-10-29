import { plugin } from "bun";

plugin({
  name: "GLSL",
  async setup(build) {
    const { readFileSync } = await import("fs");

    // when a .yaml file is imported...
    build.onLoad({ filter: /.(glsl)$/ }, (args) => {

      // read and parse the file
      const text = readFileSync(args.path, "utf8");

      // and returns it as a module
      return text;
    });
  },
});
