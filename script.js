/**
 * TempMail Pro - Core Script
 * Handles API integration, UI management, and localization.
 */

// --- Constants & State ---
const API_URL = 'https://api.mail.tm';
const POLL_INTERVAL = 7000; // 7 seconds

let state = {
    account: JSON.parse(localStorage.getItem('temp_mail_account')) || null,
    token: localStorage.getItem('temp_mail_token') || null,
    accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || [],
    theme: localStorage.getItem('mail_theme') || 'light',
    lang: localStorage.getItem('mail_lang') || 'en',
    messages: [],
    readMessages: JSON.parse(localStorage.getItem('read_messages')) || [],
    countdown: 7,
    isPolling: false
};

// --- Translations ---
const translations = {
    en: {
        "hero-title": "Your Disposable Email Address",
        "hero-subtitle": "Don't give your real email to everyone. Use TempMail Pro to stay anonymous and avoid spam.",
        "btn-refresh": "Refresh Inbox",
        "btn-new": "New Address",
        "refresh-text": "Autorefresh in 7s",
        "inbox-title": "Your Inbox",
        "btn-manage": "Manage Mailboxes",
        "empty-msg": "Your inbox is empty. Waiting for incoming emails...",
        "f1-title": "Privacy Protection",
        "f1-desc": "Hide your real identity and protect your personal inbox from trackers and hackers.",
        "f2-title": "Instant Setup",
        "f2-desc": "No registration required. Get a temporary address instantly with one click.",
        "f3-title": "Auto Disposal",
        "f3-desc": "Emails are automatically deleted after 24 hours. Your data stays clean.",
        "nav-home": "Home",
        "nav-about": "About Us",
        "nav-contact": "Contact Us",
        "nav-privacy": "Privacy Policy",
        "about-title": "About TempMail Pro",
        "contact-title": "Contact Us",
        "privacy-title": "Privacy Policy",
        toast_copy: "Email copied to clipboard!",
        toast_new_mail: "New email received!",
        toast_error: "Something went wrong. Please try again.",
        toast_acc_created: "New account created successfully!"
    },
    hi: {
        "hero-title": "आपका डिस्पोजेबल ईमेल पता",
        "hero-subtitle": "हर किसी को अपना असली ईमेल न दें। गुमनाम रहने और स्पैम से बचने के लिए TempMail Pro का उपयोग करें।",
        "btn-refresh": "इनबॉक्स रीफ्रेश करें",
        "btn-new": "नया पता",
        "refresh-text": "7s में ऑटो-रीफ्रेश",
        "inbox-title": "आपका इनबॉक्स",
        "btn-manage": "मेलबॉक्स प्रबंधित करें",
        "empty-msg": "आपका इनबॉक्स खाली है। आने वाले ईमेल की प्रतीक्षा है...",
        "f1-title": "गोपनीयता सुरक्षा",
        "f1-desc": "अपनी वास्तविक पहचान छुपाएं और अपने व्यक्तिगत इनबॉक्स को ट्रैकर्स और हैकर्स से बचाएं।",
        "f2-title": "त्वरित सेटअप",
        "f2-desc": "किसी पंजीकरण की आवश्यकता नहीं है। एक क्लिक के साथ तुरंत एक अस्थायी पता प्राप्त करें।",
        "f3-title": "ऑटो निपटान",
        "f3-desc": "ईमेल 24 घंटे के बाद अपने आप डिलीट हो जाते हैं। आपका डेटा साफ रहता है।",
        "nav-home": "होम",
        "nav-about": "हमारे बारे में",
        "nav-contact": "संपर्क करें",
        "nav-privacy": "गोपनीयता नीति",
        "about-title": "TempMail Pro के बारे में",
        "contact-title": "संपर्क करें",
        "privacy-title": "गोपनीयता नीति",
        toast_copy: "ईमेल क्लिपबोर्ड पर कॉपी किया गया!",
        toast_new_mail: "नया ईमेल प्राप्त हुआ!",
        toast_error: "कुछ गलत हो गया। कृपया पुन: प्रयास करें।",
        toast_acc_created: "नया खाता सफलतापूर्वक बनाया गया!"
    }
};

// --- Service Worker ---
const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(err => {
                console.error('SW registration failed:', err);
            });
        });
    }
};

// --- UI Helpers ---
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const applyLanguage = (lang) => {
    state.lang = lang;
    localStorage.setItem('mail_lang', lang);
    const trans = translations[lang];

    Object.keys(trans).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.classList.contains('nav-link')) {
                el.textContent = trans[key];
            } else if (el.querySelector('.btn-text')) {
                el.querySelector('.btn-text').textContent = trans[key];
            } else {
                // Handle special cases where text is inside elements with icons
                const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                if (textNodes.length > 0) {
                    textNodes[textNodes.length - 1].textContent = ' ' + trans[key];
                } else {
                    el.textContent = trans[key];
                }
            }
        }
    });

    document.getElementById('lang-toggle').querySelector('span').textContent = lang.toUpperCase();
};

const toggleTheme = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.className = `${state.theme}-theme`;
    localStorage.setItem('mail_theme', state.theme);
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.innerHTML = state.theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
};

// --- API Integration ---
async function fetchDomains() {
    try {
        const res = await fetch(`${API_URL}/domains`);
        const data = await res.json();
        return data['hydra:member'].map(d => d.domain);
    } catch (err) {
        console.error("Error fetching domains:", err);
        return ['tempmail.com']; // Fallback
    }
}

async function createAccount(customEmail = null, customPass = null) {
    try {
        const domains = await fetchDomains();
        const domain = domains[0];
        const username = customEmail || Math.random().toString(36).substring(2, 12);
        const address = (customEmail && customEmail.includes('@')) ? customEmail : `${username}@${domain}`;
        const password = customPass || Math.random().toString(36).substring(2, 15);

        const res = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!res.ok) throw new Error("Failed to create account");

        const data = await res.json();

        // Get Token
        const tokenRes = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });
        const tokenData = await tokenRes.json();

        state.account = { id: data.id, address: data.address, password };
        state.token = tokenData.token;

        localStorage.setItem('temp_mail_account', JSON.stringify(state.account));
        localStorage.setItem('temp_mail_token', state.token);

        // Add to saved accounts if not already there
        if (!state.accounts.find(a => a.address === address)) {
            state.accounts.push({ ...state.account, token: state.token });
            localStorage.setItem('temp_mail_accounts', JSON.stringify(state.accounts));
        }

        state.messages = [];
        updateUI();
        showToast(translations[state.lang].toast_acc_created, 'success');
        return true;
    } catch (err) {
        console.error("Error creating account:", err);
        showToast(translations[state.lang].toast_error, 'danger');
        return false;
    }
}

function updateUI() {
    if (state.account) {
        document.getElementById('email-address').value = state.account.address;
    }
    renderMessages();
    renderMailboxList();
}

function renderMailboxList() {
    const list = document.getElementById('saved-mailboxes');
    if (!list) return;

    list.innerHTML = state.accounts.map(acc => `
        <div class="mailbox-item ${state.account && acc.address === state.account.address ? 'active' : ''}">
            <div class="mailbox-info" onclick="switchMailbox('${acc.address}')">
                <div class="mailbox-address">${acc.address}</div>
            </div>
            <button class="icon-btn delete-acc" onclick="deleteMailbox('${acc.address}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function switchMailbox(address) {
    const acc = state.accounts.find(a => a.address === address);
    if (acc) {
        state.account = { id: acc.id, address: acc.address, password: acc.password };
        state.token = acc.token;
        state.messages = [];
        localStorage.setItem('temp_mail_account', JSON.stringify(state.account));
        localStorage.setItem('temp_mail_token', state.token);
        updateUI();
        fetchMessages();
        document.getElementById('mailbox-modal').classList.remove('active');
        showToast(`Switched to ${address}`, 'success');
    }
}

function deleteMailbox(address) {
    state.accounts = state.accounts.filter(a => a.address !== address);
    localStorage.setItem('temp_mail_accounts', JSON.stringify(state.accounts));

    if (state.account && state.account.address === address) {
        if (state.accounts.length > 0) {
            switchMailbox(state.accounts[0].address);
        } else {
            createAccount();
        }
    } else {
        renderMailboxList();
    }
}

async function fetchMessages() {
    if (!state.token || state.isPolling) return;
    state.isPolling = true;

    try {
        const res = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        const newMessages = data['hydra:member'];

        if (newMessages.length > state.messages.length) {
            showToast(translations[state.lang].toast_new_mail, 'success');
        }

        state.messages = newMessages;
        renderMessages();
    } catch (err) {
        console.error("Error fetching messages:", err);
    } finally {
        state.isPolling = false;
    }
}

function renderMessages() {
    const list = document.getElementById('email-list');
    const search = document.getElementById('inbox-search').value.toLowerCase();

    const filtered = state.messages.filter(msg =>
        msg.subject.toLowerCase().includes(search) ||
        msg.from.address.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-inbox">
                <i class="fas fa-inbox"></i>
                <p id="empty-msg">${translations[state.lang]["empty-msg"]}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(msg => `
        <div class="email-item ${state.readMessages.includes(msg.id) ? '' : 'unread'}" onclick="viewEmail('${msg.id}')">
            <div class="email-info">
                <div class="email-sender">${msg.from.name || msg.from.address}</div>
                <div class="email-subject">${msg.subject}</div>
            </div>
            <div class="email-time">${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `).join('');
}

async function viewEmail(id) {
    try {
        const res = await fetch(`${API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const msg = await res.json();

        document.getElementById('modal-subject').textContent = msg.subject;
        document.getElementById('modal-from').textContent = `${msg.from.name || ''} <${msg.from.address}>`;
        document.getElementById('modal-date').textContent = new Date(msg.createdAt).toLocaleString();

        const frame = document.getElementById('email-frame');
        const content = msg.html || `<div style="font-family: sans-serif;">${msg.intro || msg.text}</div>`;
        frame.srcdoc = Array.isArray(content) ? content.join('') : content;

        document.getElementById('email-modal').classList.add('active');

        if (!state.readMessages.includes(id)) {
            state.readMessages.push(id);
            localStorage.setItem('read_messages', JSON.stringify(state.readMessages));
            renderMessages();
        }

        // Set up download/print
        document.getElementById('download-mail-btn').onclick = () => {
            const blob = new Blob([msg.text || msg.intro], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `email-${id}.txt`;
            a.click();
        };

        document.getElementById('print-mail-btn').onclick = () => {
            frame.contentWindow.print();
        };

    } catch (err) {
        console.error("Error viewing email:", err);
        showToast(translations[state.lang].toast_error, 'danger');
    }
}

// --- Polling Logic ---
function startPolling() {
    let seconds = 7;
    const bar = document.getElementById('refresh-progress');
    const text = document.getElementById('refresh-text');

    setInterval(async () => {
        seconds--;
        if (seconds < 0) {
            seconds = 7;
            await fetchMessages();
        }

        const progress = ((7 - seconds) / 7) * 100;
        bar.style.width = `${progress}%`;
        text.textContent = translations[state.lang]["refresh-text"].replace('7s', `${seconds}s`);
    }, 1000);
}

// --- Navigation ---
const setupNavigation = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-section');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === `${target}-section`) s.classList.add('active');
            });

            if (window.innerWidth <= 768) {
                document.getElementById('nav-menu').classList.remove('active');
            }
        });
    });

    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('active');
    });
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initial UI State
    document.body.className = `${state.theme}-theme`;
    applyLanguage(state.lang);
    setupNavigation();
    registerServiceWorker();

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('lang-toggle').addEventListener('click', () => {
        const nextLang = state.lang === 'en' ? 'hi' : 'en';
        applyLanguage(nextLang);
    });

    if (!state.account) {
        await createAccount();
    } else {
        updateUI();
        fetchMessages();
    }

    startPolling();

    // Event Listeners
    document.getElementById('refresh-now-btn').addEventListener('click', () => {
        fetchMessages();
        showToast('Refreshing...', 'info');
    });

    document.getElementById('inbox-search').addEventListener('input', renderMessages);

    document.getElementById('copy-btn').addEventListener('click', () => {
        if (state.account) {
            navigator.clipboard.writeText(state.account.address);
            showToast(translations[state.lang].toast_copy, 'success');
        }
    });

    document.getElementById('qr-btn').addEventListener('click', () => {
        if (state.account) {
            const qrContainer = document.getElementById('qr-container');
            const qrEmailText = document.getElementById('qr-email-text');
            const size = 200;
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(state.account.address)}`;

            qrContainer.innerHTML = `<img src="${url}" alt="QR Code">`;
            qrEmailText.textContent = state.account.address;
            document.getElementById('qr-modal').classList.add('active');
        }
    });

    document.getElementById('share-btn').addEventListener('click', async () => {
        if (state.account && navigator.share) {
            try {
                await navigator.share({
                    title: 'Temporary Email Address',
                    text: state.account.address
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            showToast("Web Share not supported", 'warning');
        }
    });

    document.getElementById('new-email-btn').addEventListener('click', () => createAccount());

    document.getElementById('mailbox-mgr-btn').addEventListener('click', () => {
        renderMailboxList();
        document.getElementById('mailbox-modal').classList.add('active');
    });

    document.getElementById('add-custom-mailbox').addEventListener('click', async () => {
        const name = prompt("Enter username (e.g., john):");
        if (name) {
            await createAccount(name);
        }
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        });
    });

    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    };
});
