import asyncio
from playwright.async_api import async_playwright
import os

async def verify_localized_buttons():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Navigate to the app
        await page.goto('http://localhost:3000')

        # Switch to Hindi
        await page.click('#lang-toggle')

        # Go to Inbox and open the modal (we need to trigger createMailbox or mock it)
        # For simplicity, let's just check the button text in the DOM if possible
        # Or switch to Inbox section to see if translations applied

        await page.click('#nav-inbox')

        # Check translation of some elements
        inbox_title = await page.text_content('#inbox-title')
        print(f"Inbox Title (HI): {inbox_title}")

        # Check Print button text
        # The modal might be hidden, but textContent should still work
        print_text = await page.text_content('#btn-print-text')
        share_text = await page.text_content('#btn-share-text')

        print(f"Print Button Text (HI): {print_text}")
        print(f"Share Button Text (HI): {share_text}")

        # Switch back to English
        await page.click('#lang-toggle')
        print_text_en = await page.text_content('#btn-print-text')
        print(f"Print Button Text (EN): {print_text_en}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_localized_buttons())
