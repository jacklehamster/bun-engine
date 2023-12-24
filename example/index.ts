import Bao from "baojs";
import serveStatic from "serve-static-bun";

const app = new Bao();

app.get("/*any", serveStatic("/", { middlewareMode: "bao" }));

const server = app.listen({ port: 3001 });
console.log(`Listening on http://localhost:${server.port}`);
