// To execute:
//  bun run server.tsx

function httpServer() {
  const server = Bun.serve({
    port: 3000,
    fetch(request) {
      return new Response("Welcome to Bun!");
    },
  });
  
  console.log(`Listening on http://localhost:${server.port}`);
  return server;
}

httpServer();
