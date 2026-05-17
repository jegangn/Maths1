import { test, expect } from "@playwright/test";

test("manifest.webmanifest is valid JSON with a name field", async ({
  request,
}) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(typeof json.name).toBe("string");
  expect(json.name.length).toBeGreaterThan(0);
});

test("sw.js is served and contains caches.open", async ({ request }) => {
  const res = await request.get("/sw.js");
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toContain("caches.open");
});

test("icon-192.png is served", async ({ request }) => {
  const res = await request.get("/icon-192.png");
  expect(res.status()).toBe(200);
});

test("icon-512.png is served", async ({ request }) => {
  const res = await request.get("/icon-512.png");
  expect(res.status()).toBe(200);
});
