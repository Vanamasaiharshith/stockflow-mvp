import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const screenshotsDir = path.join(process.cwd(), "public", "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function capture() {
  console.log("🚀 Launching headless Chrome via puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Login Page
  console.log("📸 Capturing 01-login.png...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(screenshotsDir, "01-login.png") });

  // 2. Perform Login
  console.log("🔑 Logging in as demo tenant...");
  await page.type('input[type="email"]', "demo@stockflow.com");
  await page.type('input[type="password"]', "password123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);

  // 3. Dashboard Page
  console.log("📸 Capturing 02-dashboard.png...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2000)); // Allow charts to animate and render
  await page.screenshot({ path: path.join(screenshotsDir, "02-dashboard.png") });

  // 4. Products Catalog
  console.log("📸 Capturing 03-products.png...");
  await page.goto("http://localhost:3000/products", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, "03-products.png") });

  // 5. Inventory Insights
  console.log("📸 Capturing 04-insights.png...");
  await page.goto("http://localhost:3000/inventory-insights", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, "04-insights.png") });

  await browser.close();
  console.log("✅ All screenshots captured successfully in public/screenshots/!");
}

capture().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
