import asyncio
import os
from playwright.async_api import async_playwright

async def verify_app():
    # Make sure we have the screenshots folder or current dir
    os.makedirs("verification", exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            permissions=["clipboard-read", "clipboard-write"]
        )
        page = await context.new_page()

        # Navigate to the app
        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000")
        await page.wait_for_load_state("networkidle")
        print("Page loaded.")

        # Check Page Title
        title = await page.title()
        print(f"Title: {title}")
        assert "Tamp Mail" in title, f"Title incorrect: {title}"

        # 01. Capture Landing Page EN
        hero_title = await page.inner_text("#hero-title")
        print(f"Hero Title (EN): {hero_title}")
        await page.screenshot(path="verification/01_landing_en.png")
        print("Captured: 01_landing_en.png")

        # 02. Toggle Language to Hindi & Capture
        print("Toggling language to Hindi...")
        await page.click("#lang-toggle")
        await page.wait_for_timeout(500)
        hero_title_hi = await page.inner_text("#hero-title")
        print(f"Hero Title (HI): {hero_title_hi}")
        await page.screenshot(path="verification/02_landing_hi.png")
        print("Captured: 02_landing_hi.png")

        # Toggle Language back to English for further testing
        print("Toggling language back to English...")
        await page.click("#lang-toggle")
        await page.wait_for_timeout(500)

        # 03. Navigate to Inbox & Capture
        print("Clicking 'Get Started Now' to enter inbox...")
        await page.click("#btn-get-started")
        await page.wait_for_timeout(4000) # Wait for initial mailbox generation via Mail.tm API

        # Check if mailbox address is displayed
        current_email = await page.inner_text("#current-mail-label")
        print(f"Current Mailbox Label: {current_email}")

        # Check if email-list is showing waiting message
        empty_msg = await page.inner_text("#empty-msg")
        print(f"Inbox Empty Msg: {empty_msg}")

        await page.screenshot(path="verification/03_inbox_en.png")
        print("Captured: 03_inbox_en.png")

        # Create a new mailbox
        print("Creating a secondary mailbox...")
        await page.click("#btn-add-mail")
        await page.wait_for_timeout(4000) # Wait for mailbox creation

        # Check current mailboxes count
        mailbox_cards = await page.query_selector_all(".mailbox-card")
        print(f"Total active mailboxes: {len(mailbox_cards)}")

        # 04. Navigate to About Us
        print("Navigating to About Us...")
        await page.click("#nav-about")
        await page.wait_for_timeout(500)
        about_title = await page.inner_text("#about-title")
        print(f"About Title: {about_title}")
        await page.screenshot(path="verification/04_section_about.png")
        print("Captured: 04_section_about.png")

        # 05. Navigate to FAQ
        print("Navigating to FAQ...")
        await page.click("#nav-faq")
        await page.wait_for_timeout(500)
        faq_title = await page.inner_text("#faq-title")
        print(f"FAQ Title: {faq_title}")
        await page.screenshot(path="verification/05_section_faq.png")
        print("Captured: 05_section_faq.png")

        # 06. Navigate to Privacy
        print("Navigating to Privacy...")
        await page.click("#nav-privacy")
        await page.wait_for_timeout(500)
        glos_title = await page.inner_text("#glos-title")
        print(f"Glossary Title: {glos_title}")
        await page.screenshot(path="verification/06_section_privacy.png")
        print("Captured: 06_section_privacy.png")

        await browser.close()
        print("Verification completed successfully!")

if __name__ == "__main__":
    asyncio.run(verify_app())
