const API_URL = 'https://api.mail.tm';

const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    accent: localStorage.getItem('mail_accent') || '#3498db',
    accounts: JSON.parse(localStorage.getItem('mail_accounts')) || [],
    timer: 10,
    currentSection: 'home'
};

const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-faq': 'FAQ',
        'nav-about': 'About Us',
        'lang-text': 'Hindi',
        'hero-title': 'Your Secure Temporary Email Service',
        'hero-subtitle': 'Protect your privacy and keep your real inbox clean with Tamp Mail\'s instant disposable email addresses.',
        'btn-add-text': 'Create New Mailbox',
        'feat-fast-title': 'Instant Setup',
        'feat-fast-desc': 'Generate an email address in seconds with no registration required.',
        'feat-secure-title': 'Privacy First',
        'feat-secure-desc': 'Your personal data is never stored, and emails are sandboxed for security.',
        'feat-auto-title': 'Auto Refresh',
        'feat-auto-desc': 'Inbox updates automatically so you never miss a verification code.',
        'reviews-title': 'User Reviews & Feedback',
        'inbox-title': 'My Mailboxes',
        'btn-refresh-text': 'Refresh All',
        'refresh-label': 'Next update in:',
        'faq-title': 'Frequently Asked Questions',
        'faq-q1': 'What is a disposable email?',
        'faq-a1': 'A temporary, anonymous email address that expires after a set period, used to avoid spam.',
        'faq-q2': 'How long do emails stay?',
        'faq-a2': 'Emails are kept for 24 hours before being automatically deleted from our servers.',
        'glos-title': 'Privacy Glossary',
        'about-title': 'About Tamp Mail',
        'about-desc': 'Tamp Mail was built to give users control over their digital privacy. We provide free, fast, and secure temporary email addresses.',
        'btn-print-text': 'Print',
        'btn-share-text': 'Share',
        'qr-title': 'Scan QR Code',
        'help-modal-title': 'How to use Tamp Mail',
        'toast-created': 'Mailbox created successfully!',
        'toast-copied': 'Copied to clipboard!',
        'toast-deleted': 'Mailbox deleted.',
        'toast-error': 'An error occurred. Please try again.'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-faq': 'सवाल-जवाब',
        'nav-about': 'हमारे बारे में',
        'lang-text': 'English',
        'hero-title': 'आपकी सुरक्षित अस्थायी ईमेल सेवा',
        'hero-subtitle': 'Tamp Mail के इंस्टेंट डिस्पोजेबल ईमेल पते के साथ अपनी गोपनीयता की रक्षा करें और अपने असली इनबॉक्स को साफ रखें।',
        'btn-add-text': 'नया मेलबॉक्स बनाएं',
        'feat-fast-title': 'त्वरित सेटअप',
        'feat-fast-desc': 'बिना किसी पंजीकरण के कुछ ही सेकंड में ईमेल पता जनरेट करें।',
        'feat-secure-title': 'गोपनीयता पहले',
        'feat-secure-desc': 'आपका व्यक्तिगत डेटा कभी संग्रहीत नहीं किया जाता है, और सुरक्षा के लिए ईमेल सैंडबॉक्स किए जाते हैं।',
        'feat-auto-title': 'ऑटो रिफ्रेश',
        'feat-auto-desc': 'इनबॉक्स अपने आप अपडेट हो जाता है ताकि आप कभी भी वेरिफिकेशन कोड मिस न करें।',
        'reviews-title': 'उपयोगकर्ता समीक्षाएं और प्रतिक्रिया',
        'inbox-title': 'मेरे मेलबॉक्स',
        'btn-refresh-text': 'सभी रिफ्रेश करें',
        'refresh-label': 'अगला अपडेट:',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'faq-q1': 'डिस्पोजेबल ईमेल क्या है?',
        'faq-a1': 'एक अस्थायी, गुमनाम ईमेल पता जो एक निश्चित अवधि के बाद समाप्त हो जाता है, जिसका उपयोग स्पैम से बचने के लिए किया जाता है।',
        'faq-q2': 'ईमेल कितने समय तक रहते हैं?',
        'faq-a2': 'ईमेल हमारे सर्वर से स्वचालित रूप से हटाए जाने से पहले 24 घंटों के लिए रखे जाते हैं।',
        'glos-title': 'गोपनीयता शब्दावली',
        'about-title': 'Tamp Mail के बारे में',
        'about-desc': 'Tamp Mail उपयोगकर्ताओं को उनकी डिजिटल गोपनीयता पर नियंत्रण देने के लिए बनाया गया था। हम मुफ्त, तेज़ और सुरक्षित अस्थायी ईमेल पते प्रदान करते हैं।',
        'btn-print-text': 'प्रिंट',
        'btn-share-text': 'शेयर',
        'qr-title': 'QR कोड स्कैन करें',
        'help-modal-title': 'Tamp Mail का उपयोग कैसे करें',
        'toast-created': 'मेलबॉक्स सफलतापूर्वक बनाया गया!',
        'toast-copied': 'क्लिपबोर्ड पर कॉपी किया गया!',
        'toast-deleted': 'मेलबॉक्स हटा दिया गया।',
        'toast-error': 'एक त्रुटि हुई। कृपया पुन: प्रयास करें।'
    }
};

const glossaryData = [
    { en: 'Disposable Email', hi: 'डिस्पोजेबल ईमेल' },
    { en: 'Encryption', hi: 'एन्क्रिप्शन' },
    { en: 'Anonymity', hi: 'गुमनामी' },
    { en: 'Spam Protection', hi: 'स्पैम सुरक्षा' },
    { en: 'Sandbox', hi: 'सैंडबॉक्स' },
    { en: 'Data Privacy', hi: 'डेटा गोपनीयता' }
];

// API Utilities
async function request(endpoint, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Request failed');
    }
    return res.status === 204 ? null : res.json();
}

async function getDomain() {
    const domains = await request('/domains');
    return domains['hydra:member'][0]?.domain || 'wshu.net';
}

async function createAccount() {
    try {
        const domain = await getDomain();
        const username = Math.random().toString(36).substring(2, 12);
        const password = Math.random().toString(36).substring(2, 15);
        const address = `${username}@${domain}`;

        const account = await request('/accounts', {
            method: 'POST',
            body: JSON.stringify({ address, password })
        });

        const tokenData = await request('/token', {
            method: 'POST',
            body: JSON.stringify({ address, password })
        });

        const newAccount = {
            id: account.id,
            address,
            password,
            token: tokenData.token,
            createdAt: new Date().getTime(),
            messages: []
        };

        state.accounts.push(newAccount);
        saveState();
        showToast(translations[state.lang]['toast-created']);
        renderMailboxes();
        navigateTo('inbox');
    } catch (err) {
        console.error(err);
        showToast(translations[state.lang]['toast-error']);
    }
}

function saveState() {
    localStorage.setItem('mail_accounts', JSON.stringify(state.accounts));
    localStorage.setItem('mail_lang', state.lang);
    localStorage.setItem('mail_accent', state.accent);
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function navigateTo(sectionId) {
    state.currentSection = sectionId;
    document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.section === sectionId);
    });

    if (window.innerWidth <= 768) {
        document.getElementById('nav-links').classList.remove('active');
    }
}

function applyLanguage() {
    const dict = translations[state.lang];
    Object.keys(dict).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            // Check if it's a button with an icon
            const span = el.querySelector('span');
            if (span) {
                span.textContent = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });
    document.documentElement.lang = state.lang;
    renderGlossary();
    updateHelpContent();
}

function renderGlossary() {
    const grid = document.getElementById('glossary-grid');
    if (!grid) return;
    grid.innerHTML = glossaryData.map(item => `
        <div class="feature-card">
            <h4>${state.lang === 'hi' ? item.hi : item.en}</h4>
        </div>
    `).join('');
}

function updateHelpContent() {
    const content = document.getElementById('help-content');
    if (!content) return;
    const isHi = state.lang === 'hi';
    content.innerHTML = `
        <ol>
            <li>${isHi ? 'नया मेलबॉक्स बनाने के लिए "नया मेलबॉक्स बनाएं" पर क्लिक करें।' : 'Click "Create New Mailbox" to generate a new address.'}</li>
            <li>${isHi ? 'आपका इनबॉक्स हर 10 सेकंड में अपने आप अपडेट हो जाएगा।' : 'Your inbox will auto-refresh every 10 seconds.'}</li>
            <li>${isHi ? 'ईमेल को विस्तार से देखने के लिए उस पर क्लिक करें।' : 'Click on an email to view its full content.'}</li>
            <li>${isHi ? 'आप एक साथ कई मेलबॉक्स चला सकते हैं।' : 'You can manage multiple mailboxes simultaneously.'}</li>
        </ol>
    `;
}

function renderMailboxes() {
    const list = document.getElementById('mailbox-list');
    if (!list) return;

    if (state.accounts.length === 0) {
        list.innerHTML = `<div class="content-card"><p>${state.lang === 'hi' ? 'कोई मेलबॉक्स नहीं मिला।' : 'No mailboxes found.'}</p></div>`;
        return;
    }

    list.innerHTML = state.accounts.map((acc, index) => `
        <div class="mailbox-card" data-index="${index}">
            <div class="mailbox-top">
                <span class="email-address">${acc.address}</span>
                <div class="email-actions">
                    <button onclick="copyToClipboard('${acc.address}')" class="btn-icon" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="showQR('${acc.address}')" class="btn-icon" title="QR Code">
                        <i class="fas fa-qrcode"></i>
                    </button>
                    <button onclick="deleteAccount(${index})" class="btn-icon" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="messages-list" id="msg-list-${index}">
                ${renderMessages(acc.messages, index)}
            </div>
        </div>
    `).join('');
}

function renderMessages(messages, accIndex) {
    if (!messages || messages.length === 0) {
        return `<p style="padding: 1rem; color: var(--text-muted);">${state.lang === 'hi' ? 'इनबॉक्स खाली है' : 'Inbox is empty'}</p>`;
    }
    return messages.map(msg => `
        <div class="message-item" onclick="viewMessage('${accIndex}', '${msg.id}')">
            <div class="msg-info">
                <strong>${msg.from.name || msg.from.address}</strong>
                <div>${msg.subject}</div>
            </div>
            <div class="msg-date">${new Date(msg.createdAt).toLocaleTimeString()}</div>
        </div>
    `).join('');
}

async function fetchMessages() {
    for (let i = 0; i < state.accounts.length; i++) {
        try {
            const acc = state.accounts[i];
            const data = await request('/messages', {
                headers: { 'Authorization': `Bearer ${acc.token}` }
            });
            acc.messages = data['hydra:member'];
        } catch (err) {
            console.error('Failed to fetch messages for', state.accounts[i].address);
        }
    }
    saveState();
    renderMailboxes();
}

function deleteAccount(index) {
    state.accounts.splice(index, 1);
    saveState();
    renderMailboxes();
    showToast(translations[state.lang]['toast-deleted']);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(translations[state.lang]['toast-copied']);
    });
}

function showQR(address) {
    const modal = document.getElementById('qr-modal');
    const img = document.getElementById('qr-code-img');
    const addr = document.getElementById('qr-email-addr');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;
    addr.textContent = address;
    modal.classList.remove('hidden');
}

async function viewMessage(accIndex, msgId) {
    try {
        const acc = state.accounts[accIndex];
        const msg = await request(`/messages/${msgId}`, {
            headers: { 'Authorization': `Bearer ${acc.token}` }
        });

        const modal = document.getElementById('email-modal');
        document.getElementById('modal-subject').textContent = msg.subject;
        document.getElementById('modal-from').textContent = `${msg.from.name} <${msg.from.address}>`;
        document.getElementById('modal-date').textContent = new Date(msg.createdAt).toLocaleString();

        const frame = document.getElementById('email-body-frame');
        const content = Array.isArray(msg.html) ? msg.html.join('') : (msg.html || msg.text);
        frame.srcdoc = content;

        modal.classList.remove('hidden');
    } catch (err) {
        console.error(err);
        showToast(translations[state.lang]['toast-error']);
    }
}

// Event Listeners
document.addEventListener('click', (e) => {
    // Section navigation
    if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        navigateTo(e.target.dataset.section);
    }

    // Menu toggle
    if (e.target.closest('#menu-toggle')) {
        document.getElementById('nav-links').classList.toggle('active');
    }

    // Modal close
    if (e.target.classList.contains('close-btn') || e.target.classList.contains('modal')) {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }

    // Lang toggle
    if (e.target.closest('#lang-toggle')) {
        state.lang = state.lang === 'en' ? 'hi' : 'en';
        saveState();
        applyLanguage();
        renderMailboxes();
    }

    // Add mailbox
    if (e.target.closest('#btn-add-mail')) {
        createAccount();
    }

    // Accent picker
    if (e.target.classList.contains('color-dot')) {
        state.accent = e.target.dataset.color;
        document.documentElement.style.setProperty('--primary', state.accent);
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        e.target.classList.add('active');
        saveState();
    }

    // Refresh now
    if (e.target.closest('#refresh-now-btn')) {
        fetchMessages();
        state.timer = 10;
    }
});

// Init
window.onload = () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW failed', err));
    }

    document.documentElement.style.setProperty('--primary', state.accent);
    document.querySelectorAll('.color-dot').forEach(d => {
        if (d.dataset.color === state.accent) d.classList.add('active');
        else d.classList.remove('active');
    });

    applyLanguage();
    renderMailboxes();
    startTimer();

    // Show help on first visit
    if (!localStorage.getItem('mail_visited')) {
        document.getElementById('help-modal').classList.remove('hidden');
        localStorage.setItem('mail_visited', 'true');
    }
};

function startTimer() {
    setInterval(() => {
        state.timer--;
        if (state.timer <= 0) {
            state.timer = 10;
            fetchMessages();
        }
        updateProgressBar();
    }, 1000);
}

function updateProgressBar() {
    const timerEl = document.getElementById('timer');
    const progressEl = document.getElementById('refresh-progress');
    if (timerEl) timerEl.textContent = `${state.timer}s`;
    if (progressEl) {
        const percent = ((10 - state.timer) / 10) * 100;
        document.documentElement.style.setProperty('--progress-width', `${percent}%`);
    }
}
