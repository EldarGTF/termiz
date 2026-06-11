import { test, expect } from "@playwright/test";

test("home page shows restaurant menu", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Termiz" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "В лаваше с говядиной" })).toBeVisible();
});

test("add item to cart", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Добавить.*в корзину/i }).first().click();
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Корзина", level: 1 })).toBeVisible();
  await expect(page.getByText("В лаваше с говядиной")).toBeVisible();
});

test("orders lookup page loads", async ({ page }) => {
  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "Мои заказы" })).toBeVisible();
});

test("partner login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Вход для партнёров" })).toBeVisible();
});

test("partner login redirects to dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "partner@test.ru");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("/partner/dashboard");
  await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible();
});
