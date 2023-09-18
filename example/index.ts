import { hello } from "../build/hello-world";
import Bao from "baojs";
import serveStatic from "serve-static-bun";

const app = new Bao();
hello();

app.get("/*any", serveStatic("/", { middlewareMode: "bao" }));

const server = app.listen({ port: 3000 });
console.log(`Listening on http://localhost:${server.port}`);
