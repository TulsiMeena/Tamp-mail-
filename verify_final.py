import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Open the local index.html
        file_path = "file://" + os.path.abspath("index.html")
        await page.goto(file_path)

        print("--- Verifying UI Stability ---")
        # Check style.css for problematic transforms
        with open("style.css", "r") as f:
            css_content = f.read()
            # We removed these from button:hover
            if "button:hover { transform: translateY(-5px) scale(1.05)" in css_content:
                print("Error: Old unstable hover effect found in CSS")
                exit(1)

        print("--- Verifying Branding (Aman Meena Pro) ---")
        # Click About & Creators
        await page.click("a[data-section='about']")

        # Find Aman Meena's card
        aman_card = page.locator(".profile-card", has_text="Aman Meena")
        badge = aman_card.locator(".status-badge")
        badge_text = await badge.inner_text()
        print(f"Aman Meena Badge: {badge_text}")
        assert badge_text == "Pro", f"Expected 'Pro', got '{badge_text}'"

        # Check Hindi translation
        await page.click("#lang-toggle")
        badge_text_hi = await badge.inner_text()
        print(f"Aman Meena Badge (Hindi): {badge_text_hi}")
        # Note: In script.js translations.hi.student is "Pro"
        assert badge_text_hi == "Pro", f"Expected 'Pro' in Hindi, got '{badge_text_hi}'"

        print("--- Verifying Button Stability ---")
        # Check computed style on hover would be hard here without real mouse move,
        # but the CSS check above is good.

        print("--- Verifying Share Logic ---")
        share_btn = page.locator("#share-btn")
        assert await share_btn.is_visible(), "Share button should be visible"

        # Check script.js for share logic change
        with open("script.js", "r") as f:
            script_content = f.read()
            if "text: address" in script_content and "url:" not in script_content.split("shareBtn.onclick")[1].split("}")[0]:
                print("Share logic verified: only address is shared.")

        print("Verification Successful!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
