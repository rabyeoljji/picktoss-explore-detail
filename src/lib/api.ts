type ApiFetchInit = RequestInit & { locale?: "ko" | "en" };

export function apiFetch(path: string, init: ApiFetchInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("X-Locale", init.locale ?? "en");

  return fetch(`${process.env.API_URL!}${path}`, {
    ...init,
    headers,
  });
}
