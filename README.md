# Tamp Mail - Fast & Secure Disposable Email

Tamp Mail is a modern, privacy-focused Progressive Web App (PWA) that provides instant, temporary email addresses. Built with a clean Glassmorphism interface, it allows users to protect their primary inbox from spam and unwanted tracking.

## Features

- **Instant Setup:** No registration or personal information required. Generate a new email address with a single click.
- **Multi-Mailbox Support:** Create and manage multiple temporary email accounts simultaneously within a single session.
- **Bilingual Interface:** Fully supports both English and Hindi, with a real-time language toggle.
- **Auto-Refresh:** Features a 10-second polling mechanism with a visual progress bar to keep your inbox up to date.
- **Security & Privacy:**
  - Emails are fetched via the secure Mail.tm API.
  - Content is rendered in a sandboxed iframe to prevent XSS.
  - No user tracking or persistent personal data storage (everything stays in your browser's `localStorage`).
- **PWA Ready:** Install Tamp Mail on your home screen for a native app experience, even with offline asset caching.
- **Tools:** Includes built-in QR code generation for sharing addresses, as well as print and share options for emails.

## Technical Stack

- **Frontend:** HTML5, CSS3 (Modern Flexbox/Grid, Glassmorphism), Vanilla JavaScript.
- **Backend Integration:** [Mail.tm API](https://mail.tm/).
- **Icons:** FontAwesome 6.
- **Service Worker:** Custom PWA implementation for asset caching.

## How to Use

1. **Launch:** Open the application.
2. **Generate:** Click "Start Using Tamp Mail" or "Add Mailbox" to get a new address.
3. **Receive:** Give your temporary address to services or websites.
4. **Read:** Incoming emails will appear automatically in the Inbox section.
5. **Manage:** Use the Mailbox list to switch between different addresses or delete them when finished.

---
*Protect your identity and keep your inbox clean with Tamp Mail.*
