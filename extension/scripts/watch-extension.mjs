import * as esbuild from "esbuild";

let context;

try {
  context = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    external: ["vscode"],
    outfile: "dist/extension.js",
    sourcemap: true,
    plugins: [
      {
        name: "watch-status",
        setup(build) {
          build.onStart(() => {
            console.log("[watch] extension build started");
          });
          build.onEnd((result) => {
            if (result.errors.length > 0) {
              console.log("[watch] extension build failed");
              return;
            }

            console.log("[watch] extension build finished");
          });
        },
      },
    ],
  });

  await context.watch();
  console.log("[watch] extension watching for changes");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

async function shutdown() {
  if (context) {
    await context.dispose();
  }

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});

