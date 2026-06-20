# Tamp Mail - Fast & Secure Disposable Email Service

Tamp Mail is a modern, privacy-focused Progressive Web Application (PWA) that provides temporary, disposable email addresses. Built for users and developers, it helps keep your personal inbox clean from spam and protects your privacy during sign-ups and testing.

## 🚀 Features

- **Instant Setup:** Generate a secure temporary email address immediately upon arrival—no registration required.
- **Multi-Mailbox Support:** Create and manage multiple temporary email addresses simultaneously within a single session.
- **Bilingual Support:** Fully localized in **English** and **Hindi** (Hinglish friendly) to cater to a wider audience.
- **Modern UI/UX:**
  - Glassmorphism design with a dark/light mode foundation.
  - Multiple accent colors (Blue, Green, Red, Pink) to personalize your experience.
  - Responsive design that works flawlessly on mobile, tablet, and desktop.
- **Security & Privacy:**
  - Email content is rendered in a sandboxed iframe to prevent XSS.
  - No user tracking or persistent personal data storage.
  - Powered by the robust Mail.tm API.
- **PWA Ready:** Installable on your device for quick access, with offline caching support.
- **Interactive Tools:**
  - Integrated QR code generation for sharing email addresses.
  - Real-time inbox polling with a visual progress bar.
  - Print and copy-to-clipboard functionality.

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Custom Variables & Glassmorphism)
- **API:** [Mail.tm](https://mail.tm/)
- **Icons:** FontAwesome 6
- **Offline/PWA:** Service Workers, Web App Manifest

## 📂 Project Structure

- `index.html`: The main Single Page Application (SPA) container.
- `style.css`: Comprehensive styles including themes, layouts, and animations.
- `script.js`: Core application logic, API integration, and localization.
- `sw.js`: Service worker for asset caching and PWA functionality.
- `manifest.json`: Web app manifest for PWA installation.

## 📝 Usage

1.  **Generate:** Open the site to receive your first temporary email address automatically.
2.  **Manage:** Click "New Mailbox" to add more addresses. Switch between them in the side grid.
3.  **Receive:** Emails appear instantly in the inbox list. Click an email to read its content securely.
4.  **Customize:** Use the header toggles to switch languages or change the UI accent color.

## 🛡️ Privacy & Safety

All emails are fetched securely via the Mail.tm API. We recommend using this service for non-sensitive registrations, newsletters, and testing to protect your primary email identity.

---
© 2024 Tamp Mail. Built for a cleaner, safer web.
