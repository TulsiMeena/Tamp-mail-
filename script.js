const API_URL = 'https://api.mail.tm';
let accounts = JSON.parse(localStorage.getItem('temp_mail_accounts')) || [];
let currentAccount = JSON.parse(localStorage.getItem('temp_mail_account'));
let token = localStorage.getItem('temp_mail_token');
let refreshInterval = null;
let domains = [];
let timeLeft = 10;
let lastMsgCount = 0;

// DOM Elements
const emailInput = document.getElementById('email-address');
const domainSelect = document.getElementById('domain-select');
const inboxList = document.getElementById('inbox-list');
const messageView = document.getElementById('message-view');
const msgIframe = document.getElementById('message-iframe');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');
const progressFill = document.getElementById('progress-fill');
const timerText = document.getElementById('refresh-timer');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const mailboxSelect = document.getElementById('mailbox-select');
const customUsername = document.getElementById('custom-username');

// Language Dictionary
const translations = {
    en: {
        home: "Home", about: "About & Creators", contact: "Contact", privacy: "Privacy",
        hero_title: "Professional Temporary Email",
        hero_desc: "Advanced disposable email service to keep your primary inbox clean and protected from spam, phishing, and tracking.",
        badge: "Your Temp Address", copy: "Copy", qr: "QR Code", new: "New",
        inbox_title: "Incoming Messages", syncing: "Syncing...", active: "Active",
        waiting: "Waiting for incoming emails...", back: "Back to Inbox",
        what_is: "What is Temp Mail?",
        what_is_p: "Temporary email is a service that provides a short-lived email address used to avoid spam.",
        how_it: "How It Works",
        how_it_p: "We automatically generate a unique mailbox for you. Emails appear instantly.",
        benefits: "Key Benefits",
        benefit1: "100% Anonymous", benefit2: "Zero Spam", benefit3: "Instant", benefit4: "No Registration",
        team_title: "Meet the Team", student: "Student", developer: "Developer",
        exp: "Experience", followers: "Followers", posts: "Posts",
        contact_title: "Contact Technical Support", submit: "Submit Ticket"
    },
    hi: {
        home: "मुख्य", about: "हमारे बारे में", contact: "संपर्क", privacy: "गोपनीयता",
        hero_title: "प्रोफेशनल टेम्प ईमेल",
        hero_desc: "स्पैम, फ़िशिंग और ट्रैकिंग से अपने प्राथमिक इनबॉक्स को सुरक्षित रखने के लिए उन्नत डिस्पोजेबल ईमेल सेवा।",
        badge: "आपका टेम्प एड्रेस", copy: "कॉपी", qr: "QR कोड", new: "नया",
        inbox_title: "आने वाले संदेश", syncing: "सिंक हो रहा है...", active: "सक्रिय",
        waiting: "आने वाले ईमेल की प्रतीक्षा कर रहे हैं...", back: "इनबॉक्स पर वापस",
        what_is: "टेम्प मेल क्या है?",
        what_is_p: "अस्थायी ईमेल एक सेवा है जो स्पैम से बचने के लिए उपयोग किए जाने वाले अल्पकालिक ईमेल पते प्रदान करती है।",
        how_it: "यह कैसे काम करता है",
        how_it_p: "हम स्वचालित रूप से आपके लिए एक अद्वितीय मेलबॉक्स बनाते हैं। ईमेल तुरंत दिखाई देते हैं।",
        benefits: "प्रमुख लाभ",
        benefit1: "100% अनाम", benefit2: "शून्य स्पैम", benefit3: "तत्काल सक्रिय", benefit4: "कोई पंजीकरण नहीं",
        team_title: "टीम से मिलें", student: "छात्र", developer: "डेवलपर",
        exp: "अनुभव", followers: "फॉलोअर्स", posts: "पोस्ट",
        contact_title: "तकनीकी सहायता से संपर्क करें", submit: "टिकट जमा करें"
    }
};

let currentLang = localStorage.getItem('mail_lang') || 'en';

// Initialize App
async function init() {
    setupTheme();
    setupLang();
    setupNotifications();
    await fetchDomains();
    updateMailboxSwitcher();

    if (currentAccount && token) {
        if (emailInput) emailInput.value = currentAccount.address;
        startAutoRefresh();
        fetchMessages();
    } else if (accounts.length > 0) {
        switchAccount(accounts[0].address);
    } else {
        await createAccount();
    }

    setupRouting();
    setupMailboxEvents();
}

function setupMailboxEvents() {
    mailboxSelect.onchange = () => {
        if (mailboxSelect.value === 'current') return;
        switchAccount(mailboxSelect.value);
    };
}

function updateMailboxSwitcher() {
    if (!mailboxSelect) return;
    mailboxSelect.innerHTML = '';
    accounts.forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.address;
        opt.textContent = acc.address;
        if (currentAccount && acc.address === currentAccount.address) opt.selected = true;
        mailboxSelect.appendChild(opt);
    });
}

function switchAccount(address) {
    const acc = accounts.find(a => a.address === address);
    if (!acc) return;
    currentAccount = acc;
    token = acc.token;
    localStorage.setItem('temp_mail_account', JSON.stringify(currentAccount));
    localStorage.setItem('temp_mail_token', token);
    if (emailInput) emailInput.value = currentAccount.address;
    updateMailboxSwitcher();
    startAutoRefresh();
    fetchMessages();
}

// Theme Toggle
function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.onclick = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    };
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function setupLang() {
    updateUIText();
    langToggle.onclick = () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        localStorage.setItem('mail_lang', currentLang);
        updateUIText();
    };
}

function updateUIText() {
    const t = translations[currentLang];
    document.getElementById('lang-text').textContent = currentLang === 'en' ? 'HI' : 'EN';

    // Update Nav
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks[0].textContent = t.home;
    navLinks[1].textContent = t.about;
    navLinks[2].textContent = t.contact;
    navLinks[3].textContent = t.privacy;

    // Update Hero
    const heroH1 = document.querySelector('header h1');
    if (heroH1) heroH1.textContent = t.hero_title;
    const heroP = document.querySelector('header p');
    if (heroP) heroP.textContent = t.hero_desc;

    // Update Generator
    const badge = document.querySelector('.badge');
    if (badge) badge.textContent = t.badge;
    document.getElementById('copy-btn').innerHTML = `<i class="fas fa-copy"></i>`;
    document.getElementById('qr-btn').innerHTML = `<i class="fas fa-qrcode"></i> ${t.qr}`;
    document.getElementById('new-btn').innerHTML = `<i class="fas fa-plus"></i> ${t.new}`;

    // Update Inbox
    document.querySelector('.inbox-header h2').innerHTML = `<i class="fas fa-inbox"></i> ${t.inbox_title}`;
    const emptyP = document.querySelector('.empty-state p');
    if (emptyP) emptyP.textContent = t.waiting;
    document.getElementById('back-btn').innerHTML = `<i class="fas fa-arrow-left"></i> ${t.back}`;

    // Update Info Sections
    const infoCards = document.querySelectorAll('.info-card-3d');
    if (infoCards.length >= 3) {
        infoCards[0].querySelector('h3').textContent = t.what_is;
        infoCards[0].querySelector('p').textContent = t.what_is_p;
        infoCards[1].querySelector('h3').textContent = t.how_it;
        infoCards[1].querySelector('p').textContent = t.how_it_p;
        infoCards[2].querySelector('h3').textContent = t.benefits;
        const benefits = infoCards[2].querySelectorAll('.benefit-list li');
        benefits[0].innerHTML = `<i class="fas fa-check"></i> ${t.benefit1}`;
        benefits[1].innerHTML = `<i class="fas fa-check"></i> ${t.benefit2}`;
        benefits[2].innerHTML = `<i class="fas fa-check"></i> ${t.benefit3}`;
        benefits[3].innerHTML = `<i class="fas fa-check"></i> ${t.benefit4}`;
    }

    // Update About
    const aboutTitle = document.querySelector('.section-title');
    if (aboutTitle) aboutTitle.textContent = t.team_title;
    const badges = document.querySelectorAll('.status-badge');
    if (badges[0]) badges[0].textContent = t.student;
    if (badges[1]) badges[1].textContent = t.developer;
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 3) {
        statLabels[0].textContent = t.followers;
        statLabels[1].textContent = t.posts;
        statLabels[2].textContent = t.exp;
    }

    // Update Contact
    const contactH2 = document.querySelector('#contact-section h2');
    if (contactH2) contactH2.textContent = t.contact_title;
}

// Routing logic
function setupRouting() {
    document.querySelectorAll('.nav-link, .nav-logo').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const section = link.dataset.section;

            // Hide all sections
            document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));

            // Show target section
            const target = document.getElementById(`${section}-section`);
            if (target) {
                target.classList.remove('hidden');
                window.scrollTo(0, 0);
            }

            // Update active nav
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            if (link.classList.contains('nav-link')) link.classList.add('active');

            // Special handling for message view
            if (section === 'home') messageView.classList.add('hidden');
        };
    });
}

// Domain Management
async function fetchDomains() {
    try {
        const response = await fetch(`${API_URL}/domains`);
        const data = await response.json();
        domains = data['hydra:member'].map(d => d.domain);

        if (domainSelect) {
            domainSelect.innerHTML = '';
            domains.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = `@${d}`;
                domainSelect.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Error fetching domains', error);
    }
}

// Account Creation
async function createAccount() {
    try {
        updateStatus('Creating...', 'orange');
        const domain = domainSelect.value || domains[0];
        const user = customUsername.value.trim() || Math.random().toString(36).substring(2, 10);
        const address = `${user}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        const response = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!response.ok) {
            const err = await response.json();
            alert('Error: ' + (err.message || 'Account creation failed. Try another username.'));
            updateStatus('Failed', 'var(--danger)');
            return;
        }

        currentAccount = { address, password };
        await getToken();

        // Add to multi-account list
        currentAccount.token = token;
        accounts.push(currentAccount);
        localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));
        localStorage.setItem('temp_mail_account', JSON.stringify(currentAccount));

        if (emailInput) emailInput.value = address;
        customUsername.value = '';

        updateMailboxSwitcher();
        startAutoRefresh();
        updateStatus('Active', 'var(--success)');
    } catch (error) {
        updateStatus('Error', 'var(--danger)');
        console.error(error);
    }
}

async function getToken() {
    const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: currentAccount.address, password: currentAccount.password })
    });
    const data = await response.json();
    token = data.token;
    localStorage.setItem('temp_mail_token', token);
}

// Mail Logic
async function fetchMessages() {
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            await getToken();
            return fetchMessages();
        }

        const data = await response.json();
        renderInbox(data['hydra:member']);
    } catch (error) {
        console.error('Fetch error', error);
    }
}

function renderInbox(messages) {
    if (!inboxList) return;

    if (messages.length > lastMsgCount && lastMsgCount !== 0) {
        notifyNewMail(messages[0].subject);
    }
    lastMsgCount = messages.length;

    if (messages.length === 0) {
        inboxList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope-open"></i>
                <p>Waiting for incoming emails...</p>
            </div>`;
        return;
    }

    inboxList.innerHTML = '';
    messages.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'message-item';
        item.innerHTML = `
            <div class="item-main">
                <div class="from">${msg.from.address}</div>
                <div class="subject">${msg.subject || '(No Subject)'}</div>
            </div>
            <div class="item-meta">
                <div class="time">${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        item.onclick = () => viewMessage(msg.id);
        inboxList.appendChild(item);
    });
}

async function viewMessage(id) {
    try {
        updateStatus('Loading...', 'orange');
        const response = await fetch(`${API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const msg = await response.json();

        document.getElementById('msg-subject').textContent = msg.subject || '(No Subject)';
        document.getElementById('msg-from').textContent = msg.from.address;
        document.getElementById('msg-date').textContent = new Date(msg.createdAt).toLocaleString();

        const content = msg.html ? msg.html[0] : (msg.text || 'No content');
        msgIframe.srcdoc = `<html><head><style>body{font-family:sans-serif;line-height:1.6;color:#333;padding:20px;background:#fff;}</style></head><body>${content}</body></html>`;

        messageView.classList.remove('hidden');
        updateStatus('Viewing', 'var(--primary)');
        window.scrollTo(0, 0);
    } catch (error) {
        console.error(error);
    }
}

// UI Helpers
function updateStatus(text, color) {
    if (statusText) statusText.textContent = text;
    if (statusDot) statusDot.style.backgroundColor = color;
}

function setupNotifications() {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }
}

function notifyNewMail(subject) {
    if (Notification.permission === "granted") {
        new Notification("New Email Received", {
            body: subject || "You have a new message!",
            icon: "https://cdn-icons-png.flaticon.com/512/281/281769.png"
        });
    }
}

function startAutoRefresh() {
    timeLeft = 10;
    if (refreshInterval) clearInterval(refreshInterval);

    refreshInterval = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            timeLeft = 10;
            fetchMessages();
        }

        if (progressFill) {
            const percent = (timeLeft / 10) * 100;
            progressFill.style.width = `${percent}%`;
        }
        if (timerText) {
            timerText.textContent = `${Math.ceil(timeLeft)}s`;
        }
    }, 100);
}

// Event Handlers
document.getElementById('copy-btn').onclick = async () => {
    await navigator.clipboard.writeText(emailInput.value);
    const btn = document.getElementById('copy-btn');
    const old = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => btn.innerHTML = old, 2000);
};

document.getElementById('new-btn').onclick = () => {
    createAccount();
};

document.getElementById('back-btn').onclick = () => {
    messageView.classList.add('hidden');
    updateStatus('Active', 'var(--success)');
};

document.getElementById('download-btn').onclick = () => {
    const subject = document.getElementById('msg-subject').textContent;
    const from = document.getElementById('msg-from').textContent;
    const date = document.getElementById('msg-date').textContent;
    const content = msgIframe.srcdoc;

    const text = `Subject: ${subject}\nFrom: ${from}\nDate: ${date}\n\n${content}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};

// QR Code
const qrModal = document.getElementById('qr-modal');
const qrBtn = document.getElementById('qr-btn');
const closeQr = document.querySelector('.close-modal');

if (qrBtn) {
    qrBtn.onclick = () => {
        const address = emailInput.value;
        const qrContainer = document.getElementById('qr-container');
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}" alt="QR Code">`;
        qrModal.classList.remove('hidden');
    };
}

if (closeQr) closeQr.onclick = () => qrModal.classList.add('hidden');
window.onclick = (e) => { if (e.target === qrModal) qrModal.classList.add('hidden'); };

// Contact Form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.onsubmit = (e) => {
        e.preventDefault();
        alert('Ticket submitted successfully! Amit Meena will review it soon.');
        contactForm.reset();
    };
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed:', err));
    });
}

// Start
init();

// --- Interactive 3D Tilt Effect ---
function applyTilt() {
    const cards = document.querySelectorAll('.generator-card, .info-card-3d, .profile-card, .inbox-container');

    cards.forEach(card => {
        // Skip tilt for Home section elements
        if (card.closest('#home-section')) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            card.style.boxShadow = `${(centerX - x) / 10}px ${(centerY - y) / 10}px 30px rgba(0,0,0,0.2), var(--glow)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
            card.style.boxShadow = `var(--shadow), var(--glow)`;
        });
    });
}

// Small delay to ensure elements are rendered
setTimeout(applyTilt, 200);
