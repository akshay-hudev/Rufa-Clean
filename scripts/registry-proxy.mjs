import http from "node:http";
import net from "node:net";

const allowed = new Set(["registry.npmjs.org:443"]);
const server = http.createServer((_request, response) => {
  response.writeHead(405, { "content-type": "text/plain" });
  response.end("CONNECT required\n");
});

server.on("connect", (request, clientSocket, head) => {
  if (!request.url || !allowed.has(request.url.toLowerCase())) {
    clientSocket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
    clientSocket.destroy();
    return;
  }
  const upstream = net.connect(443, "registry.npmjs.org", () => {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    if (head.length > 0) {
      upstream.write(head);
    }
    upstream.pipe(clientSocket);
    clientSocket.pipe(upstream);
  });
  upstream.on("error", () => clientSocket.destroy());
  clientSocket.on("error", () => upstream.destroy());
});

server.listen(3128, "0.0.0.0");
