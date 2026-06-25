# Tamp Mail - Fast & Secure Disposable Email

Tamp Mail is a modern, responsive Single Page Application (SPA) that provides free, secure, and disposable temporary email addresses. It helps you stay anonymous and keep your real inbox clean from spam.

## Features

- **Instant Mailbox Generation:** Get a random email address immediately upon visiting.
- **Multi-Mailbox Support:** Create and manage multiple email addresses simultaneously.
- **Real-time Updates:** Automatically polls for new emails every 10 seconds with a visual progress bar.
- **Bilingual Support:** Fully localized in English and Hindi.
- **PWA Ready:** Installable as a Progressive Web App for a native-like experience.
- **Sandboxed Rendering:** Emails are rendered in a secure iframe to protect against malicious content.
- **Custom Themes:** Multiple accent color options (Blue, Green, Red, Pink).
- **Responsive Design:** Works perfectly on both desktop and mobile devices.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Icons:** FontAwesome
- **API:** [Mail.tm](https://mail.tm/)
- **Service Worker:** Custom implementation for offline caching and PWA support.

## How to Use

1. Navigate to the website.
2. Click "Get Started" to enter your inbox.
3. Your first temporary email is created automatically.
4. Use the "New Mailbox" button to add more if needed.
5. Copy your address and use it anywhere.
6. Messages appear instantly in the inbox list.

## Development

The application is built using a clean SPA architecture. All logic is contained within `script.js`, and styling is handled by `style.css`. It uses localStorage to persist your mailboxes and preferences across sessions.
