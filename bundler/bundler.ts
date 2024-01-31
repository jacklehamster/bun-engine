async function bundle() {
  await Bun.build({
    entrypoints: ['./src/index.tsx'],
    outdir: './dist',
    // minify: true,
    sourcemap: "external",
  });
}

bundle();
