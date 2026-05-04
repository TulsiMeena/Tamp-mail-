const state = {
    email: '',
    token: '',
    messages: [],
    domains: [],
    accountId: '',
    refreshInterval: 7000,
    lastRefresh: Date.now(),
    language: localStorage.getItem('mail_lang') || 'EN',
    theme: localStorage.getItem('mail_theme') || 'light-theme',
    accent: localStorage.getItem('mail_accent') || 'blue',
    accounts: JSON.parse(localStorage.getItem('temp_mail_accounts')) || []
};

const i18n = {
    EN: {
        nav_home: 'Home', nav_about: 'About Us', nav_contact: 'Contact Us', nav_privacy: 'Privacy Policy',
        hero_title: 'Disposable Temporary Email', hero_subtitle: 'Protect your privacy and keep your inbox clean from spam.',
        btn_copy: 'Copy', btn_new: 'New Email', btn_custom: 'Custom', btn_qr: 'QR Code',
        inbox_title: 'Your Inbox', status_checking: 'Checking for messages...', empty_inbox: 'Your inbox is empty',
        about_title: 'About Us', contact_title: 'Contact Us', privacy_title: 'Privacy Policy',
        label_name: 'Name', label_email: 'Email', label_message: 'Message', btn_send: 'Send Message',
        f1_title: 'Privacy Protected', f1_desc: 'No personal data required. Stay anonymous online.',
        f2_title: 'Instant Setup', f2_desc: 'Get a temporary email address in seconds.',
        f3_title: 'Auto Delete', f3_desc: 'Emails are automatically deleted after some time.',
        faq_title: 'Frequently Asked Questions',
        q1: 'What is a temporary email?', a1: 'Temporary email is a service that provides you with a disposable email address that expires after a certain period of time.',
        q2: 'Why should I use it?', a2: 'To avoid spam, protect your primary email, and maintain your privacy on websites you don\'t trust.',
        about_p1: 'TempMail Pro was created to provide a simple, secure, and fast way to manage temporary emails.',
        glos_title: 'Privacy Glossary', glos_desc: 'Understanding terms like XSS, CSRF, and Encryption.',
        privacy_p1: 'We do not store your personal information or the content of your emails beyond the necessary time required for the service.'
    },
    HI: {
        nav_home: 'होम', nav_about: 'हमारे बारे में', nav_contact: 'संपर्क करें', nav_privacy: 'गोपनीयता नीति',
        hero_title: 'डिस्पोजेबल अस्थायी ईमेल', hero_subtitle: 'अपनी गोपनीयता सुरक्षित रखें और अपने इनबॉक्स को स्पैम से मुक्त रखें।',
        btn_copy: 'कॉपी', btn_new: 'नया ईमेल', btn_custom: 'कस्टम', btn_qr: 'QR कोड',
        inbox_title: 'आपका इनबॉक्स', status_checking: 'संदेशों की जांच हो रही है...', empty_inbox: 'आपका इनबॉक्स खाली है',
        about_title: 'हमारे बारे में', contact_title: 'संपर्क करें', privacy_title: 'गोपनीयता नीति',
        label_name: 'नाम', label_email: 'ईमेल', label_message: 'संदेश', btn_send: 'संदेश भेजें',
        f1_title: 'गोपनीयता सुरक्षित', f1_desc: 'किसी व्यक्तिगत डेटा की आवश्यकता नहीं है। ऑनलाइन गुमनाम रहें।',
        f2_title: 'त्वरित सेटअप', f2_desc: 'सेकंड में एक अस्थायी ईमेल पता प्राप्त करें।',
        f3_title: 'ऑटो डिलीट', f3_desc: 'ईमेल कुछ समय बाद अपने आप डिलीट हो जाते हैं।',
        faq_title: 'अक्सर पूछे जाने वाले प्रश्न',
        q1: 'अस्थायी ईमेल क्या है?', a1: 'अस्थायी ईमेल एक ऐसी सेवा है जो आपको एक डिस्पोजेबल ईमेल पता प्रदान करती है जो एक निश्चित अवधि के बाद समाप्त हो जाती है।',
        q2: 'मुझे इसका उपयोग क्यों करना चाहिए?', a2: 'स्पैम से बचने के लिए, अपने प्राथमिक ईमेल की रक्षा करें, और उन वेबसाइटों पर अपनी गोपनीयता बनाए रखें जिन पर आप भरोसा नहीं करते हैं।',
        about_p1: 'TempMail Pro को अस्थायी ईमेल प्रबंधित करने के लिए एक सरल, सुरक्षित और तेज़ तरीका प्रदान करने के लिए बनाया गया था।',
        glos_title: 'गोपनीयता शब्दावली', glos_desc: 'XSS, CSRF और एन्क्रिप्शन जैसे शब्दों को समझना।',
        privacy_p1: 'हम आपकी व्यक्तिगत जानकारी या आपके ईमेल की सामग्री को सेवा के लिए आवश्यक समय से अधिक संग्रहीत नहीं करते हैं।'
    }
};

const API_BASE = 'https://api.mail.tm';

// UI Helpers
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateTranslations() {
    const lang = state.language;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            if (el.querySelector('.btn-text')) {
                el.querySelector('.btn-text').textContent = i18n[lang][key];
            } else {
                el.textContent = i18n[lang][key];
            }
        }
    });
    document.getElementById('lang-toggle').textContent = lang;
}

// Mail.tm Integration
async function fetchDomains() {
    console.log('Fetching domains...');
    try {
        const res = await fetch(`${API_BASE}/domains`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        state.domains = data['hydra:member'];
        console.log('Domains fetched:', state.domains);
        return state.domains;
    } catch (err) {
        console.error('Error fetching domains:', err);
        return [];
    }
}

async function createAccount() {
    console.log('Creating account...');
    if (state.domains.length === 0) {
        await fetchDomains();
    }
    if (state.domains.length === 0) {
        console.error('No domains available');
        showToast('No domains available', 'error');
        return;
    }
    const domain = state.domains[0].domain;
    const username = Math.random().toString(36).substring(2, 12);
    const password = Math.random().toString(36).substring(2, 12);
    const email = `${username}@${domain}`;

    try {
        const res = await fetch(`${API_BASE}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
        });
        const data = await res.json();
        state.accountId = data.id;
        state.email = email;

        // Get Token
        const tokenRes = await fetch(`${API_BASE}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
        });
        const tokenData = await tokenRes.json();
        state.token = tokenData.token;

        console.log('Account created and token obtained:', email);
        document.getElementById('temp-email-input').value = email;
        localStorage.setItem('temp_mail_account', JSON.stringify({ email, password, id: data.id }));
        localStorage.setItem('temp_mail_token', state.token);

        showToast('New email generated!');
        fetchMessages();
    } catch (err) {
        console.error('Error creating account:', err);
        showToast('Failed to create email account', 'error');
    }
}

async function fetchMessages() {
    if (!state.token) return;
    document.getElementById('inbox-status-text').textContent = i18n[state.language].status_checking;
    try {
        const res = await fetch(`${API_BASE}/messages`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        state.messages = data['hydra:member'];
        renderMessages();
        document.getElementById('inbox-status-text').textContent = '';
    } catch (err) {
        console.error('Error fetching messages:', err);
        document.getElementById('inbox-status-text').textContent = 'Offline';
    }
}

async function viewMessage(id) {
    try {
        const res = await fetch(`${API_BASE}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const msg = await res.json();

        const htmlContent = Array.isArray(msg.html) ? msg.html[0] : (msg.html || msg.text || '');
        const subject = msg.subject || '(No Subject)';
        const from = msg.from.address;

        // Use a sandboxed iframe to prevent XSS
        const detailWindow = window.open('', '_blank', 'width=800,height=600');
        if (!detailWindow) {
            showToast('Popup blocked! Please allow popups to view messages.', 'error');
            return;
        }

        const sanitizedSubject = subject.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
        const sanitizedFrom = from.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

        detailWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${sanitizedSubject}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .header { border-bottom: 1px solid #eee; margin-bottom: 20px; padding-bottom: 10px; }
                    .subject { font-size: 1.5rem; font-weight: bold; margin: 0 0 10px 0; }
                    .from { color: #666; font-size: 0.9rem; }
                    iframe { width: 100%; border: 1px solid #ddd; border-radius: 4px; min-height: 400px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="subject">${sanitizedSubject}</h1>
                    <div class="from"><strong>From:</strong> ${sanitizedFrom}</div>
                </div>
                <iframe sandbox="" srcdoc="${htmlContent.replace(/"/g, '&quot;')}"></iframe>
            </body>
            </html>
        `);
        detailWindow.document.close();
    } catch (err) {
        console.error('Error viewing message:', err);
        showToast('Error loading message', 'error');
    }
}

function renderMessages() {
    const list = document.getElementById('email-list');
    if (state.messages.length === 0) {
        list.innerHTML = `<div class="empty-inbox"><i class="fas fa-inbox"></i><p data-i18n="empty_inbox">${i18n[state.language].empty_inbox}</p></div>`;
        return;
    }

    list.innerHTML = state.messages.map(msg => `
        <div class="email-item glass" onclick="viewMessage('${msg.id}')">
            <div class="email-item-info">
                <strong>${msg.from.address}</strong>
                <p>${msg.subject || '(No Subject)'}</p>
            </div>
            <div class="email-item-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
        </div>
    `).join('');
}

// App Logic
function initApp() {
    // Theme & Accent
    document.body.className = state.theme;
    document.body.setAttribute('data-accent', state.accent);

    // Language
    updateTranslations();

    // Event Listeners
    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'light-theme' ? 'dark-theme' : 'light-theme';
        document.body.className = state.theme;
        localStorage.setItem('mail_theme', state.theme);
        const icon = document.querySelector('#theme-toggle i');
        icon.className = state.theme === 'light-theme' ? 'fas fa-moon' : 'fas fa-sun';
    });

    document.getElementById('lang-toggle').addEventListener('click', () => {
        state.language = state.language === 'EN' ? 'HI' : 'EN';
        localStorage.setItem('mail_lang', state.language);
        updateTranslations();
    });

    document.querySelectorAll('.accent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.accent = btn.getAttribute('data-accent');
            document.body.setAttribute('data-accent', state.accent);
            localStorage.setItem('mail_accent', state.accent);
        });
    });

    document.getElementById('copy-email-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(state.email);
        showToast('Email copied to clipboard!');
    });

    document.getElementById('new-email-btn').addEventListener('click', () => {
        createAccount();
    });

    document.getElementById('refresh-now-btn').addEventListener('click', () => {
        fetchMessages();
        state.lastRefresh = Date.now();
    });

    document.getElementById('qr-code-btn').addEventListener('click', () => {
        if (!state.email) return;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(state.email)}`;
        document.getElementById('qr-code-display').innerHTML = `<img src="${qrUrl}" alt="QR Code">`;
        document.getElementById('qr-email-text').textContent = state.email;
        document.getElementById('qr-modal').classList.remove('hidden');
    });

    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('qr-modal').classList.add('hidden');
    });

    // Navigation
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-nav');
            document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
            document.getElementById(`${target}-section`).classList.remove('hidden');
            document.querySelectorAll('[data-nav]').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Auto-refresh logic
    setInterval(() => {
        const now = Date.now();
        const elapsed = now - state.lastRefresh;
        const progress = (elapsed / state.refreshInterval) * 100;

        if (progress >= 100) {
            fetchMessages();
            state.lastRefresh = now;
            document.getElementById('refresh-progress-bar').style.width = '0%';
        } else {
            document.getElementById('refresh-progress-bar').style.width = `${progress}%`;
        }
    }, 100);

    // Initial account creation or load
    const savedAccount = localStorage.getItem('temp_mail_account');
    if (savedAccount) {
        const account = JSON.parse(savedAccount);
        state.email = account.email;
        state.token = localStorage.getItem('temp_mail_token');
        document.getElementById('temp-email-input').value = state.email;
        fetchMessages();
    } else {
        createAccount();
    }
}

document.addEventListener('DOMContentLoaded', initApp);
window.App = { init: initApp };
