async function bundle() {
  await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    // minify: true,
    sourcemap: "external",
  });
}

bundle();
