const state = {
    lang: localStorage.getItem('mail_lang') || 'en',
    mailboxes: JSON.parse(localStorage.getItem('mailboxes')) || [],
    currentMailbox: null,
    messages: [],
    domains: [],
    countdown: 10
};

const translations = {
    en: {
        'nav-home': 'Home',
        'nav-inbox': 'Inbox',
        'nav-about': 'About Us',
        'nav-help': 'Help',
        'hero-title': 'Disposable Temporary Email Service',
        'hero-subtitle': 'Protect your privacy and keep your inbox clean with our fast, secure, and free temp mail service.',
        'btn-get-started': 'Get Started',
        'f1-title': 'Stay Anonymous',
        'f1-desc': 'No registration required. Use a random email address to hide your identity.',
        'f2-title': 'Avoid Spam',
        'f2-desc': 'Use temp mail for signups and keep your real inbox free from junk and ads.',
        'f3-title': 'Fast & Easy',
        'f3-desc': 'Generate multiple addresses instantly and receive emails in real-time.',
        'faq-title': 'Frequently Asked Questions',
        'inbox-title': 'Your Inboxes',
        'btn-add-text': 'Add Mailbox',
        'messages-title': 'Messages',
        'no-emails': 'Select a mailbox or wait for new messages...',
        'about-title': 'About Tamp Mail',
        'help-title': 'Help & Support',
        'lang-text': 'Hindi',
        'refresh-status': 'Refreshing in',
        'copy-success': 'Address copied to clipboard!',
        'mail-created': 'New mailbox created!',
        'mail-deleted': 'Mailbox removed.',
        'error-api': 'API Error. Please try again later.'
    },
    hi: {
        'nav-home': 'होम',
        'nav-inbox': 'इनबॉक्स',
        'nav-about': 'हमारे बारे में',
        'nav-help': 'सहायता',
        'hero-title': 'डिस्पोजेबल अस्थायी ईमेल सेवा',
        'hero-subtitle': 'तेज, सुरक्षित और मुफ्त टेम्प मेल सेवा के साथ अपनी गोपनीयता की रक्षा करें और अपने इनबॉक्स को साफ रखें।',
        'btn-get-started': 'शुरू करें',
        'f1-title': 'अनाम रहें',
        'f1-desc': 'किसी पंजीकरण की आवश्यकता नहीं है। अपनी पहचान छिपाने के लिए एक रैंडम ईमेल पते का उपयोग करें।',
        'f2-title': 'स्पैम से बचें',
        'f2-desc': 'साइनअप के लिए टेम्प मेल का उपयोग करें और अपने वास्तविक इनबॉक्स को कबाड़ और विज्ञापनों से मुक्त रखें।',
        'f3-title': 'तेज और आसान',
        'f3-desc': 'तुरंत कई पते जेनरेट करें और रीयल-टाइम में ईमेल प्राप्त करें।',
        'faq-title': 'अक्सर पूछे जाने वाले प्रश्न',
        'inbox-title': 'आपके इनबॉक्स',
        'btn-add-text': 'इनबॉक्स जोड़ें',
        'messages-title': 'संदेश',
        'no-emails': 'इनबॉक्स चुनें या नए संदेशों की प्रतीक्षा करें...',
        'about-title': 'Tamp Mail के बारे में',
        'help-title': 'सहायता और समर्थन',
        'lang-text': 'English',
        'refresh-status': 'रिफ्रेश हो रहा है',
        'copy-success': 'पता क्लिपबोर्ड पर कॉपी किया गया!',
        'mail-created': 'नया इनबॉक्स बनाया गया!',
        'mail-deleted': 'इनबॉक्स हटा दिया गया।',
        'error-api': 'API त्रुटि। कृपया बाद में पुनः प्रयास करें।'
    }
};

const API_BASE = 'https://api.mail.tm';

// DOM Elements
const elements = {
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.spa-section'),
    langToggle: document.getElementById('lang-toggle'),
    menuToggle: document.getElementById('menu-toggle'),
    navContainer: document.getElementById('nav-links'),
    btnGetStarted: document.getElementById('btn-get-started'),
    btnAddMail: document.getElementById('btn-add-mail'),
    mailboxList: document.getElementById('mailbox-list'),
    emailList: document.getElementById('email-list'),
    refreshProgress: document.getElementById('refresh-progress'),
    countdown: document.getElementById('countdown'),
    refreshBtn: document.getElementById('refresh-now-btn'),
    emailModal: document.getElementById('email-modal'),
    qrModal: document.getElementById('qr-modal'),
    closeModals: document.querySelectorAll('.close-modal')
};

// --- Core Logic ---

function init() {
    applyLanguage();
    setupEventListeners();
    fetchDomains();
    renderMailboxes();
    startPolling();

    // Global App Object for visibility
    window.App = {
        state,
        switchSection,
        showToast
    };
}

function setupEventListeners() {
    // SPA Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            switchSection(sectionId);
            if (window.innerWidth <= 768) {
                elements.navContainer.classList.remove('active');
            }
        });
    });

    elements.menuToggle.addEventListener('click', () => {
        elements.navContainer.classList.toggle('active');
    });

    elements.btnGetStarted.addEventListener('click', () => switchSection('inbox'));

    elements.langToggle.addEventListener('click', toggleLanguage);

    elements.btnAddMail.addEventListener('click', createMailbox);

    elements.refreshBtn.addEventListener('click', () => {
        state.countdown = 0;
        syncAll();
    });

    // Modals
    elements.closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.emailModal.classList.add('hidden');
            elements.qrModal.classList.add('hidden');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

    document.getElementById('btn-print').addEventListener('click', () => {
        window.frames['email-iframe'].contentWindow.print();
    });
}

function switchSection(id) {
    elements.sections.forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');

    elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === id);
    });
}

function toggleLanguage() {
    state.lang = state.lang === 'en' ? 'hi' : 'en';
    localStorage.setItem('mail_lang', state.lang);
    applyLanguage();
}

function applyLanguage() {
    const dict = translations[state.lang];
    Object.keys(dict).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            // Check if it's a button with an icon
            const span = el.querySelector('span');
            if (span) span.textContent = dict[key];
            else el.textContent = dict[key];
        }
    });

    document.documentElement.lang = state.lang;
    renderHelp();
}

// --- API & Mailbox Management ---

async function request(path, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'API Error');
        }
        return res.json();
    } catch (e) {
        showToast(e.message, 'danger');
        throw e;
    }
}

async function fetchDomains() {
    try {
        const data = await request('/domains');
        state.domains = data['hydra:member'].map(d => d.domain);
    } catch (e) {
        state.domains = ['tempmail.com']; // Fallback
    }
}

async function createMailbox() {
    if (state.domains.length === 0) await fetchDomains();

    const domain = state.domains[0];
    const username = Math.random().toString(36).substring(2, 10);
    const password = Math.random().toString(36).substring(2, 12);
    const address = `${username}@${domain}`;

    try {
        const account = await request('/accounts', {
            method: 'POST',
            body: JSON.stringify({ address, password })
        });

        const tokenData = await request('/token', {
            method: 'POST',
            body: JSON.stringify({ address, password })
        });

        const newMailbox = {
            id: account.id,
            address,
            password,
            token: tokenData.token,
            createdAt: new Date().toISOString()
        };

        state.mailboxes.unshift(newMailbox);
        saveMailboxes();
        renderMailboxes();
        selectMailbox(newMailbox.id);
        showToast(translations[state.lang]['mail-created'], 'success');
    } catch (e) {
        console.error(e);
    }
}

function saveMailboxes() {
    localStorage.setItem('mailboxes', JSON.stringify(state.mailboxes));
}

function renderMailboxes() {
    elements.mailboxList.innerHTML = state.mailboxes.length === 0
        ? '<p style="grid-column: 1/-1; text-align: center; color: var(--text-dim);">No mailboxes yet.</p>'
        : '';

    state.mailboxes.forEach(mail => {
        const card = document.createElement('div');
        card.className = `mailbox-card ${state.currentMailbox?.id === mail.id ? 'active' : ''}`;
        card.innerHTML = `
            <h4>${mail.address}</h4>
            <div class="mailbox-actions">
                <button class="btn-icon copy-btn" title="Copy"><i class="fas fa-copy"></i></button>
                <button class="btn-icon qr-btn" title="QR Code"><i class="fas fa-qrcode"></i></button>
                <button class="btn-icon del-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-icon')) selectMailbox(mail.id);
        });

        card.querySelector('.copy-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(mail.address);
            showToast(translations[state.lang]['copy-success'], 'success');
        });

        card.querySelector('.qr-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showQR(mail.address);
        });

        card.querySelector('.del-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteMailbox(mail.id);
        });

        elements.mailboxList.appendChild(card);
    });
}

function deleteMailbox(id) {
    state.mailboxes = state.mailboxes.filter(m => m.id !== id);
    if (state.currentMailbox?.id === id) {
        state.currentMailbox = null;
        state.messages = [];
        renderMessages();
    }
    saveMailboxes();
    renderMailboxes();
    showToast(translations[state.lang]['mail-deleted'], 'info');
}

async function selectMailbox(id) {
    state.currentMailbox = state.mailboxes.find(m => m.id === id);
    renderMailboxes();
    fetchMessages();
}

async function fetchMessages() {
    if (!state.currentMailbox) return;

    try {
        const data = await request('/messages', {
            headers: { 'Authorization': `Bearer ${state.currentMailbox.token}` }
        });
        state.messages = data['hydra:member'];
        renderMessages();
    } catch (e) {
        console.error(e);
    }
}

function renderMessages() {
    if (!state.currentMailbox) {
        elements.emailList.innerHTML = `<p class="empty-state">${translations[state.lang]['no-emails']}</p>`;
        return;
    }

    if (state.messages.length === 0) {
        elements.emailList.innerHTML = `<p class="empty-state">No messages in this inbox.</p>`;
        return;
    }

    elements.emailList.innerHTML = '';
    state.messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'email-item';
        div.innerHTML = `
            <div class="email-info">
                <div class="email-sender">${msg.from.address}</div>
                <div class="email-subject">${msg.subject || '(No Subject)'}</div>
            </div>
            <div class="email-date" style="font-size: 0.75rem; color: var(--text-dim);">
                ${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
        `;
        div.addEventListener('click', () => showEmailDetail(msg.id));
        elements.emailList.appendChild(div);
    });
}

async function showEmailDetail(msgId) {
    try {
        const msg = await request(`/messages/${msgId}`, {
            headers: { 'Authorization': `Bearer ${state.currentMailbox.token}` }
        });

        document.getElementById('modal-subject').textContent = msg.subject || '(No Subject)';
        document.getElementById('modal-from').textContent = `${msg.from.name || ''} <${msg.from.address}>`;
        document.getElementById('modal-date').textContent = new Date(msg.createdAt).toLocaleString();

        const iframe = document.getElementById('email-iframe');
        let content = '';
        if (msg.html) {
             content = Array.isArray(msg.html) ? msg.html.join('') : msg.html;
        } else {
             content = `<pre style="white-space: pre-wrap;">${msg.text || ''}</pre>`;
        }
        iframe.srcdoc = content;

        // Attachments
        const attContainer = document.getElementById('attachments-container');
        attContainer.innerHTML = '';
        if (msg.attachments && msg.attachments.length > 0) {
            msg.attachments.forEach(att => {
                const btn = document.createElement('button');
                btn.className = 'btn-secondary';
                btn.innerHTML = `<i class="fas fa-paperclip"></i> ${att.filename}`;
                btn.style.margin = '5px';
                btn.onclick = () => downloadAttachment(msgId, att);
                attContainer.appendChild(btn);
            });
        }

        elements.emailModal.classList.remove('hidden');
    } catch (e) {
        console.error(e);
    }
}

async function downloadAttachment(msgId, att) {
    try {
        const res = await fetch(`${API_BASE}/messages/${msgId}/attachments/${att.id}`, {
            headers: { 'Authorization': `Bearer ${state.currentMailbox.token}` }
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = att.filename;
        a.click();
    } catch (e) {
        showToast('Failed to download attachment', 'danger');
    }
}

// --- Polling & UI Utils ---

function startPolling() {
    setInterval(() => {
        state.countdown--;
        if (state.countdown <= 0) {
            state.countdown = 10;
            syncAll();
        }
        updateProgress();
    }, 1000);
}

function updateProgress() {
    const percent = ((10 - state.countdown) / 10) * 100;
    document.documentElement.style.setProperty('--progress-width', `${percent}%`);
    elements.countdown.textContent = state.countdown;
}

async function syncAll() {
    if (state.currentMailbox) {
        await fetchMessages();
    }
}

function showQR(address) {
    const qrImg = document.getElementById('qr-image');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
    document.getElementById('qr-address').textContent = address;
    elements.qrModal.classList.remove('hidden');
}

function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = `var(--${type})`;
    toast.textContent = msg;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function renderHelp() {
    const helpContent = document.getElementById('help-content');
    const items = state.lang === 'en' ? [
        { t: 'How to use?', d: 'Click "Add Mailbox" to generate a new temporary email address instantly.' },
        { t: 'Auto-Refresh', d: 'Your inbox automatically checks for new messages every 10 seconds.' },
        { t: 'Multiple Inboxes', d: 'You can manage multiple email addresses at the same time.' },
        { t: 'Privacy', d: 'We do not store any personal information. All data is cleared when you delete a mailbox.' }
    ] : [
        { t: 'कैसे उपयोग करें?', d: 'तुरंत एक नया अस्थायी ईमेल पता जेनरेट करने के लिए "इनबॉक्स जोड़ें" पर क्लिक करें।' },
        { t: 'ऑटो-रिफ्रेश', d: 'आपका इनबॉक्स हर 10 सेकंड में नए संदेशों की स्वचालित रूप से जांच करता है।' },
        { t: 'एकाधिक इनबॉक्स', d: 'आप एक ही समय में कई ईमेल पते प्रबंधित कर सकते हैं।' },
        { t: 'गोपनीयता', d: 'हम कोई व्यक्तिगत जानकारी संग्रहीत नहीं करते हैं। इनबॉक्स हटाने पर सारा डेटा साफ़ हो जाता है।' }
    ];

    helpContent.innerHTML = items.map(i => `
        <div class="help-card">
            <h3>${i.t}</h3>
            <p>${i.d}</p>
        </div>
    `).join('');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed:', err));
    });
}
