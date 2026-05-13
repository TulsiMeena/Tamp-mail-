/**
 * TempMail Pro - Core Logic
 * Integrated with Mail.tm API
 */

const API_URL = 'https://api.mail.tm';

// Application State
const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    theme: localStorage.getItem('mail_theme') || 'dark',
    accent: localStorage.getItem('mail_accent') || '#3498db',
    account: JSON.parse(localStorage.getItem('temp_mail_account')) || null,
    token: localStorage.getItem('temp_mail_token') || null,
    accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || [],
    messages: [],
    readMessages: JSON.parse(localStorage.getItem('read_messages')) || [],
    stats: {
        emailsReceived: parseInt(localStorage.getItem('stats_emails')) || 0,
        timeSaved: parseInt(localStorage.getItem('stats_time')) || 0
    },
    refreshInterval: 7,
    refreshTimer: null,
    remainingSeconds: 7
};

// Translations
const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-privacy': 'Privacy',
        'nav-about': 'About Us',
        'm-nav-home': 'Home',
        'm-nav-inbox': 'Inbox',
        'm-nav-privacy': 'Privacy',
        'm-nav-about': 'About Us',
        'hero-title': 'Protect Your Privacy with TempMail',
        'hero-subtitle': 'Generate instant temporary email addresses to keep your real inbox clean and safe from spam.',
        'start-btn': 'Get Started',
        'label-emails': 'Emails Received',
        'label-time': 'Time Saved',
        'h-what-is': 'What is Temp Mail?',
        'p-what-is': 'Temporary email is a service that provides you with a disposable email address. It helps you register on websites without revealing your personal email.',
        'h-how-it-works': 'How It Works',
        's1': 'Generate a random email address.',
        's2': 'Use it for any registration or service.',
        's3': 'Receive and read emails instantly in your inbox.',
        'faq-title': 'Frequently Asked Questions',
        'feedback-title': 'User Reviews & Feedback',
        'inbox-title': 'Your Inbox',
        'inbox-search-input': 'Search emails...',
        'p-empty-inbox': 'Waiting for incoming emails...',
        'btn-new-email': 'New Email',
        'btn-my-emails': 'My Emails',
        'refresh_status': 'Auto-refreshing in 7s',
        'privacy-title': 'Privacy & Security',
        'glos-title': 'Privacy Glossary',
        'h-security': 'Your Data is Secure',
        'p-security': 'All emails are automatically purged after 24 hours. We do not store any personal information or track your activity.',
        'about-title': 'About Us',
        'dev-aman-desc': 'Lead Developer & Designer',
        'dev-amit-desc': 'Backend Engineer',
        'h-skills': 'Our Skills',
        'skill1': 'Web Development',
        'skill2': 'UI/UX Design',
        'skill3': 'Cloud Architecture',
        'manager-title': 'Manage Mailboxes',
        'btn-backup': 'Backup',
        'btn-restore': 'Restore',
        'modal-subject': 'Email Subject',
        'label-from': 'From:',
        'label-date': 'Date:',
        'btn-download': 'Download',
        'btn-print': 'Print',
        'copy_success': 'Email copied to clipboard!',
        'account_created': 'New mailbox created!',
        'new_mail_notif': 'You have a new email!',
        'error_api': 'API Error. Please try again later.'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-privacy': 'गोपनीयता',
        'nav-about': 'हमारे बारे में',
        'm-nav-home': 'होम',
        'm-nav-inbox': 'इनबॉक्स',
        'm-nav-privacy': 'गोपनीयता',
        'm-nav-about': 'हमारे बारे में',
        'hero-title': 'TempMail के साथ अपनी गोपनीयता सुरक्षित करें',
        'hero-subtitle': 'अपने असली इनबॉक्स को स्पैम से सुरक्षित रखने के लिए तुरंत अस्थायी ईमेल पते बनाएं।',
        'start-btn': 'शुरू करें',
        'label-emails': 'प्राप्त ईमेल',
        'label-time': 'बचाया गया समय',
        'h-what-is': 'अस्थायी मेल क्या है?',
        'p-what-is': 'अस्थायी ईमेल एक ऐसी सेवा है जो आपको डिस्पोजेबल ईमेल पता प्रदान करती है। यह आपको अपने व्यक्तिगत ईमेल का खुलासा किए बिना वेबसाइटों पर पंजीकरण करने में मदद करती है।',
        'h-how-it-works': 'यह कैसे काम करता है',
        's1': 'एक रैंडम ईमेल पता जेनरेट करें।',
        's2': 'इसका उपयोग किसी भी पंजीकरण या सेवा के लिए करें।',
        's3': 'अपने इनबॉक्स में तुरंत ईमेल प्राप्त करें और पढ़ें।',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'feedback-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया',
        'inbox-title': 'आपका इनबॉक्स',
        'inbox-search-input': 'ईमेल खोजें...',
        'p-empty-inbox': 'आने वाले ईमेल की प्रतीक्षा है...',
        'btn-new-email': 'नया ईमेल',
        'btn-my-emails': 'मेरे ईमेल',
        'refresh_status': '7s में ऑटो-रिफ्रेश',
        'privacy-title': 'गोपनीयता और सुरक्षा',
        'glos-title': 'गोपनीयता शब्दावली',
        'h-security': 'आपका डेटा सुरक्षित है',
        'p-security': 'सभी ईमेल 24 घंटे के बाद अपने आप हटा दिए जाते हैं। हम कोई व्यक्तिगत जानकारी संग्रहीत नहीं करते हैं।',
        'about-title': 'हमारे बारे में',
        'dev-aman-desc': 'लीड डेवलपर और डिजाइनर',
        'dev-amit-desc': 'बैकएंड इंजीनियर',
        'h-skills': 'हमारा कौशल',
        'skill1': 'वेब विकास',
        'skill2': 'UI/UX डिजाइन',
        'skill3': 'क्लाउड आर्किटेक्चर',
        'manager-title': 'मेलबॉक्स प्रबंधित करें',
        'btn-backup': 'बैकअप',
        'btn-restore': 'रिफ्रेश',
        'modal-subject': 'ईमेल विषय',
        'label-from': 'प्रेषक:',
        'label-date': 'दिनांक:',
        'btn-download': 'डाउनलोड',
        'btn-print': 'प्रिंट',
        'copy_success': 'ईमेल क्लिपबोर्ड पर कॉपी हो गया!',
        'account_created': 'नया मेलबॉक्स बनाया गया!',
        'new_mail_notif': 'आपके पास एक नया ईमेल है!',
        'error_api': 'API त्रुटि। कृपया बाद में पुनः प्रयास करें।'
    }
};

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    applyLanguage();
    applyTheme();
    applyAccent(state.accent);
    setupEventListeners();
    updateStats();

    if (state.account && state.token) {
        startPolling();
        displayCurrentEmail();
    } else {
        createNewAccount();
    }

    // Expose App globally for evaluation environments
    window.App = {
        state,
        init: initApp,
        createNewAccount,
        switchAccount: (id) => {
            const acc = state.accounts.find(a => a.id === id);
            if (acc) {
                state.account = acc;
                state.token = acc.token;
                localStorage.setItem('temp_mail_account', JSON.stringify(acc));
                localStorage.setItem('temp_mail_token', acc.token);
                displayCurrentEmail();
                fetchMessages();
            }
        }
    };
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-nav');
            navigateTo(sectionId);
            if (link.classList.contains('drawer-link')) {
                toggleDrawer(false);
            }
        });
    });

    // Toggles
    document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('menu-toggle').addEventListener('click', () => toggleDrawer(true));
    document.getElementById('close-drawer').addEventListener('click', () => toggleDrawer(false));
    document.getElementById('drawer-overlay').addEventListener('click', () => toggleDrawer(false));

    // Actions
    document.getElementById('start-btn').addEventListener('click', () => navigateTo('inbox'));
    document.getElementById('copy-email-btn').addEventListener('click', copyEmail);
    document.getElementById('share-email-btn').addEventListener('click', shareEmail);
    document.getElementById('new-mail-btn').addEventListener('click', createNewAccount);
    document.getElementById('refresh-now-btn').addEventListener('click', () => {
        state.remainingSeconds = state.refreshInterval;
        fetchMessages();
    });

    // Modals
    document.getElementById('close-modal').addEventListener('click', () => closeModal('email-modal'));
    document.getElementById('close-manager-modal').addEventListener('click', () => closeModal('mailbox-manager-modal'));
    document.getElementById('manage-mailboxes-btn').addEventListener('click', openMailboxManager);

    // Accent Picker
    document.querySelectorAll('.accent-color').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            applyAccent(color);
        });
    });

    // Search
    document.getElementById('inbox-search-input').addEventListener('input', (e) => {
        filterEmails(e.target.value);
    });

    // Utilities
    document.getElementById('print-email-btn').addEventListener('click', () => {
        const frame = document.getElementById('email-body-frame');
        frame.contentWindow.focus();
        frame.contentWindow.print();
    });

    document.getElementById('download-email-btn').addEventListener('click', downloadEmail);
}

// Navigation Logic
function navigateTo(sectionId) {
    document.querySelectorAll('.spa-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');

    document.querySelectorAll('.nav-link, .drawer-link').forEach(l => {
        if (l.getAttribute('data-nav') === sectionId) {
            l.classList.add('active');
        } else {
            l.classList.remove('active');
        }
    });
}

function toggleDrawer(open) {
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (open) {
        drawer.classList.add('active');
        overlay.classList.add('active');
    } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// API Integration
async function createNewAccount() {
    showToast('Creating...', 'info');
    try {
        const domainsResponse = await fetch(`${API_URL}/domains`);
        const domainsData = await domainsResponse.json();
        const domain = domainsData['hydra:member'][0].domain;

        const username = Math.random().toString(36).substring(2, 12);
        const password = Math.random().toString(36).substring(2, 12);
        const address = `${username}@${domain}`;

        const createResponse = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!createResponse.ok) throw new Error('Account creation failed');
        const accountData = await createResponse.json();

        // Get Token
        const tokenResponse = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        const tokenData = await tokenResponse.json();
        const token = tokenData.token;

        const newAccount = { ...accountData, password, token };
        state.account = newAccount;
        state.token = token;

        // Add to registry
        state.accounts.push(newAccount);
        localStorage.setItem('temp_mail_account', JSON.stringify(newAccount));
        localStorage.setItem('temp_mail_token', token);
        localStorage.setItem('temp_mail_accounts', JSON.stringify(state.accounts));

        displayCurrentEmail();
        showToast(translations[state.lang].account_created, 'success');
        startPolling();
        fetchMessages();

    } catch (error) {
        console.error(error);
        showToast(translations[state.lang].error_api, 'error');
    }
}

async function fetchMessages() {
    if (!state.token) return;
    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await response.json();
        const newMessages = data['hydra:member'];

        // Check for new emails
        if (newMessages.length > state.messages.length) {
            handleNewEmail(newMessages[0]);
        }

        state.messages = newMessages;
        renderEmailList();
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function handleNewEmail(msg) {
    state.stats.emailsReceived++;
    state.stats.timeSaved += 5; // Simulating 5 mins saved per email
    updateStats();
    showToast(translations[state.lang].new_mail_notif, 'success');

    // Notification sound
    const sound = document.getElementById('notif-sound');
    sound.play().catch(() => {});

    // Browser notification
    if (Notification.permission === 'granted') {
        new Notification('TempMail Pro', { body: msg.subject });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// Polling Logic
function startPolling() {
    if (state.refreshTimer) clearInterval(state.refreshTimer);
    state.remainingSeconds = state.refreshInterval;

    state.refreshTimer = setInterval(() => {
        state.remainingSeconds--;
        updateRefreshUI();

        if (state.remainingSeconds <= 0) {
            state.remainingSeconds = state.refreshInterval;
            fetchMessages();
        }
    }, 1000);
}

function updateRefreshUI() {
    const progress = ((state.refreshInterval - state.remainingSeconds) / state.refreshInterval) * 100;
    document.documentElement.style.setProperty('--progress-width', `${progress}%`);

    const statusEl = document.getElementById('refresh-status');
    const text = translations[state.lang].refresh_status;
    statusEl.textContent = text.replace('7s', `${state.remainingSeconds}s`);
}

// UI Rendering
function displayCurrentEmail() {
    const el = document.getElementById('current-email');
    if (el && state.account) {
        el.value = state.account.address;
    }
}

function renderEmailList() {
    const listEl = document.getElementById('email-list');
    const emptyEl = document.getElementById('empty-inbox-msg');

    if (state.messages.length === 0) {
        emptyEl.style.display = 'flex';
        // Clear children except empty msg
        Array.from(listEl.children).forEach(child => {
            if (child.id !== 'empty-inbox-msg') child.remove();
        });
        return;
    }

    emptyEl.style.display = 'none';
    // Clear previous items
    Array.from(listEl.children).forEach(child => {
        if (child.id !== 'empty-inbox-msg') child.remove();
    });

    state.messages.forEach(msg => {
        const isRead = state.readMessages.includes(msg.id);
        const item = document.createElement('div');
        item.className = `email-item ${isRead ? '' : 'unread'}`;

        const avatarChar = msg.from.name ? msg.from.name[0] : msg.from.address[0];
        const avatarColor = stringToColor(msg.from.address);

        item.innerHTML = `
            <div class="email-avatar" style="background: ${avatarColor}">${avatarChar.toUpperCase()}</div>
            <div class="email-content">
                <h4>${msg.from.name || msg.from.address}</h4>
                <p><strong>${msg.subject}</strong> - ${msg.intro}</p>
            </div>
            <div class="email-time">${formatDate(msg.createdAt)}</div>
        `;

        item.onclick = () => openEmail(msg);
        listEl.appendChild(item);
    });
}

async function openEmail(msg) {
    const modal = document.getElementById('email-modal');
    document.getElementById('modal-subject').textContent = msg.subject;
    document.getElementById('modal-from').textContent = `${msg.from.name || ''} <${msg.from.address}>`;
    document.getElementById('modal-date').textContent = formatDate(msg.createdAt);

    // Mark as read
    if (!state.readMessages.includes(msg.id)) {
        state.readMessages.push(msg.id);
        localStorage.setItem('read_messages', JSON.stringify(state.readMessages));
        renderEmailList();
    }

    // Fetch full message content
    try {
        const response = await fetch(`${API_URL}/messages/${msg.id}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const fullMsg = await response.json();

        const frame = document.getElementById('email-body-frame');
        const content = fullMsg.html || fullMsg.text;

        // Handle array or string
        const htmlContent = Array.isArray(content) ? content.join('') : content;
        frame.srcdoc = htmlContent;

        state.currentOpenEmail = fullMsg;
        modal.style.display = 'block';
    } catch (error) {
        showToast(translations[state.lang].error_api, 'error');
    }
}

// Localization Logic
function toggleLanguage() {
    state.lang = state.lang === 'en' ? 'hi' : 'en';
    localStorage.setItem('mail_lang', state.lang);
    applyLanguage();
}

function applyLanguage() {
    const trans = translations[state.lang];
    document.getElementById('lang-toggle').querySelector('.btn-text').textContent = state.lang === 'en' ? 'HI' : 'EN';

    for (const key in trans) {
        const el = document.getElementById(key);
        if (el) {
            if (el.tagName === 'INPUT') {
                el.placeholder = trans[key];
            } else {
                // If it has an icon, preserve it
                const icon = el.querySelector('i');
                if (icon) {
                    const textSpan = el.querySelector('.btn-text') || el;
                    if (textSpan !== el) {
                        textSpan.textContent = trans[key];
                    } else {
                        el.innerHTML = '';
                        el.appendChild(icon);
                        el.appendChild(document.createTextNode(' ' + trans[key]));
                    }
                } else {
                    el.textContent = trans[key];
                }
            }
        }
    }
    updateRefreshUI();
}

// Theme & Accent
function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mail_theme', state.theme);
    applyTheme();
}

function applyTheme() {
    document.body.className = state.theme === 'dark' ? 'dark-theme' : 'light-theme';
    const icon = document.getElementById('theme-toggle').querySelector('i');
    icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function applyAccent(color) {
    state.accent = color;
    localStorage.setItem('mail_accent', color);
    document.documentElement.style.setProperty('--primary', color);
}

// Utilities
function copyEmail() {
    const el = document.getElementById('current-email');
    el.select();
    document.execCommand('copy');
    showToast(translations[state.lang].copy_success, 'success');
}

function shareEmail() {
    if (navigator.share) {
        navigator.share({
            title: 'My Temp Email',
            text: state.account.address
        }).catch(() => {});
    } else {
        copyEmail();
    }
}

async function downloadEmail() {
    if (!state.currentOpenEmail) return;
    const content = state.currentOpenEmail.text || state.currentOpenEmail.html;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentOpenEmail.subject}.txt`;
    a.click();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateStats() {
    localStorage.setItem('stats_emails', state.stats.emailsReceived);
    localStorage.setItem('stats_time', state.stats.timeSaved);

    const emailVal = document.getElementById('stat-emails');
    const timeVal = document.getElementById('stat-time');
    if (emailVal) emailVal.textContent = state.stats.emailsReceived;
    if (timeVal) timeVal.textContent = `${state.stats.timeSaved}m`;
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function openMailboxManager() {
    const modal = document.getElementById('mailbox-manager-modal');
    const listEl = document.getElementById('mailbox-list');
    listEl.innerHTML = '';

    state.accounts.forEach(acc => {
        const item = document.createElement('div');
        item.className = 'mailbox-item';
        item.style.padding = '10px';
        item.style.borderBottom = '1px solid var(--card-border)';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        const isCurrent = state.account && acc.id === state.account.id;

        item.innerHTML = `
            <div>
                <strong>${acc.address}</strong>
                ${isCurrent ? '<span class="pro-badge">Active</span>' : ''}
            </div>
            <button class="btn-outline btn-small" onclick="App.switchAccount('${acc.id}')">Use</button>
        `;
        listEl.appendChild(item);
    });

    modal.style.display = 'block';
}

// Helpers
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

function filterEmails(query) {
    const items = document.querySelectorAll('.email-item');
    query = query.toLowerCase();
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'grid' : 'none';
    });
}
