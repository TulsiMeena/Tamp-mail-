import asyncio
from playwright.async_api import async_playwright

async def verify_app():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the app
        await page.goto("http://localhost:3000")
        print("Page loaded")

        # Check title
        title = await page.title()
        print(f"Title: {title}")

        # Check Home section elements
        hero_title = await page.inner_text("#hero-title")
        print(f"Hero Title: {hero_title}")

        # Take screenshot of home
        await page.screenshot(path="screenshot_home.png")
        print("Home screenshot saved")

        # Click on Generate Email button
        await page.click("#gen-email-btn")
        print("Clicked Generate Email")

        # Wait for email to be generated
        await page.wait_for_timeout(3000) # Give some time for API
        email = await page.inner_text("#current-email")
        print(f"Generated Email: {email}")

        # Navigate to Inbox
        await page.click('[data-section="inbox"]')
        await page.wait_for_timeout(1000)
        inbox_title = await page.inner_text("#inbox-title")
        print(f"Inbox Title: {inbox_title}")
        await page.screenshot(path="screenshot_inbox.png")
        print("Inbox screenshot saved")

        # Toggle Language
        await page.click("#lang-toggle")
        await page.wait_for_timeout(500)
        hero_title_hi = await page.inner_text("#hero-title")
        print(f"Hero Title (HI): {hero_title_hi}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_app())
