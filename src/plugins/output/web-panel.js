import http from "node:http";

function html(result) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Assistant Panel</title>
  <style>
    body { margin: 0; font: 14px system-ui, sans-serif; background: #f7f7f4; color: #20211f; }
    main { max-width: 780px; margin: 0 auto; padding: 28px; }
    pre { white-space: pre-wrap; line-height: 1.5; background: white; border: 1px solid #ddd; padding: 18px; border-radius: 8px; }
  </style>
</head>
<body>
  <main>
    <h1>AI Assistant Panel</h1>
    <pre>${escapeHtml(result.text)}</pre>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default {
  type: "web-panel",
  kind: "output",
  create(context, options = {}) {
    return {
      async render(result) {
        const port = options.port || 4177;
        const server = http.createServer((_request, response) => {
          response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
          response.end(html(result));
        });

        await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
        context.logger.info(`Web panel running at http://127.0.0.1:${port}`);
      }
    };
  }
};
