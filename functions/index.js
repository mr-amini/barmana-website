// Cloudflare supplies the visitor's IP country at the edge.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.pathname !== "/" || !["GET", "HEAD"].includes(request.method)) {
    return next();
  }

  const cookies = request.headers.get("Cookie")?.split(/;\s*/) ?? [];
  const preference = cookies
    .find((cookie) => /^bm_language=(en|fa)$/.test(cookie))
    ?.split("=")[1];
  const language = preference ?? (request.cf?.country === "IR" ? "fa" : "en");

  if (language === "fa") {
    return new Response(null, {
      status: 302,
      headers: { Location: "/fa/" + url.search, "Cache-Control": "private, no-store" },
    });
  }

  const response = new Response(await next());
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
