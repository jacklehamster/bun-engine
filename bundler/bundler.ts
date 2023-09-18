async function bundle(Bun: { build: Function }) {
    await Bun.build({
        entrypoints: ['./src/hello-world.tsx'],
        outdir: './build',
        minify: true,
      });
}

bundle(Bun as unknown as { build: Function });