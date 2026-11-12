const checkoutVariables = {
  "/subscribe/essentials/monthly": "CHECKOUT_ESSENTIALS_MONTHLY_URL",
  "/subscribe/essentials/yearly": "CHECKOUT_ESSENTIALS_YEARLY_URL",
  "/subscribe/pro/monthly": "CHECKOUT_PRO_MONTHLY_URL",
  "/subscribe/pro/yearly": "CHECKOUT_PRO_YEARLY_URL",
} as const;

export function subscriptionCheckout(request: Request, env: Cloudflare.Env): Response {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
  }

  const url = new URL(request.url);
  const variable = checkoutVariables[url.pathname as keyof typeof checkoutVariables];
  if (!variable) return new Response("Plan not found", { status: 404 });

  const billing = url.pathname.endsWith("/yearly") ? "yearly" : "monthly";
  const checkout = URL.parse(env[variable] ?? "");
  const destination = checkout?.protocol === "https:" && !checkout.username && !checkout.password
    ? checkout.href
    : new URL(`/?checkout=unavailable&billing=${billing}#pricing`, url).href;

  return new Response(null, {
    status: 303,
    headers: { Location: destination, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}
