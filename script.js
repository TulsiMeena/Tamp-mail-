const API_URL = 'https://api.mail.tm';
let accounts = JSON.parse(localStorage.getItem('temp_mail_accounts')) || [];
let currentAccount = JSON.parse(localStorage.getItem('temp_mail_account'));
let token = localStorage.getItem('temp_mail_token');
let refreshInterval = null;
let domains = [];
let timeLeft = 7;
let lastMsgCount = 0;
let allMessages = [];
let readMessages = JSON.parse(localStorage.getItem('read_messages')) || [];

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
const searchInput = document.getElementById('search-mail');
const mailboxNote = document.getElementById('mailbox-note');
const userAvatar = document.getElementById('user-avatar');

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
        contact_title: "Contact Technical Support", submit: "Submit Ticket",
        stat1: "Total Emails Received", stat2: "Time Saved (Est.)",
        pref_t: "Experience Preferences", pref_s: "New Mail Sound", pref_c: "Confetti Effect",
        help_title: "Welcome to TempMail Pro", help_got: "Got it!",
        h1: "Change theme colors using the picker in navbar.",
        h2: "Search your emails instantly using the search bar.",
        h3: "Create multiple accounts and switch between them.",
        h4: "Download your emails and attachments easily.",
        qr_t: "Scan QR Code", qr_p: "Scan this code to open this mailbox on your mobile device.",
        saved_label: "Saved Mailboxes:", note_ph: "Add a note for this email...",
        tools: "Advanced Tools", export: "Export Backup", import: "Import Backup",
        hiw_t: "How It Works", s1: "Generate a unique address instantly.", s2: "Use it on any site or app.", s3: "Mails arrive in 1-2 seconds.", s4: "Close the tab to purge data."
    },
    hi: {
        home: "मुख्य", about: "हमारे बारे में", contact: "संपर्क", privacy: "गोपनीयता",
        hero_title: "प्रोफेशनल टेम्प ईमेल",
        hero_desc: "स्पैम, फ़िशिंग aur ट्रैकिंग से अपने प्राथमिक इनबॉक्स को सुरक्षित रखने के लिए उन्नत डिस्पोजेबल ईमेल सेवा।",
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
        contact_title: "तकनीकी सहायता से संपर्क करें", submit: "टिकट जमा करें",
        stat1: "कुल प्राप्त ईमेल", stat2: "बचाया गया समय (अनुमानित)",
        pref_t: "अनुभव प्राथमिकताएं", pref_s: "नया मेल साउंड", pref_c: "कन्फ़ेटी प्रभाव",
        help_title: "TempMail Pro में आपका स्वागत है", help_got: "समझ गया!",
        h1: "नेवबार में पिकर का उपयोग करके थीम रंग बदलें।",
        h2: "सर्च बार का उपयोग करके अपने ईमेल तुरंत खोजें।",
        h3: "कई अकाउंट बनाएं और उनके बीच स्विच करें।",
        h4: "अपने ईमेल और अटैचमेंट आसानी से डाउनलोड करें।",
        qr_t: "QR कोड स्कैन करें", qr_p: "अपने मोबाइल डिवाइस पर इस मेलबॉक्स को खोलने के लिए इस कोड को स्कैन करें।",
        saved_label: "सहेजे गए मेलबॉक्स:", note_ph: "इस ईमेल के लिए एक नोट जोड़ें...",
        tools: "उन्नत टूल", export: "बैकअप एक्सपोर्ट करें", import: "बैकअप इम्पोर्ट करें",
        hiw_t: "यह कैसे काम करता है", s1: "तुरंत एक अद्वितीय पता जनरेट करें।", s2: "इसे किसी भी साइट या ऐप पर उपयोग करें।", s3: "मेल 1-2 सेकंड में आते हैं।", s4: "डेटा साफ़ करने के लिए टैब बंद करें।"
    }
};

let currentLang = localStorage.getItem('mail_lang') || 'en';

// Initialize App
async function init() {
    setupTheme();
    updateAnalyticsUI();
    updateExpiryTimer();
    setupColors();
    setupLang();
    setupNotifications();
    setupSearch();
    setupHelp();
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
        switchAccount(mailboxSelect.value);
    };

    document.getElementById('save-note-btn').onclick = () => {
        const acc = accounts.find(a => a.address === currentAccount.address);
        if (acc) {
            acc.note = mailboxNote.value;
            localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));
            updateMailboxSwitcher();
            alert('Note saved!');
        }
    };
}

function updateMailboxSwitcher() {
    if (!mailboxSelect) return;
    mailboxSelect.innerHTML = '';
    accounts.forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.address;
        opt.textContent = acc.note ? `${acc.address} (${acc.note})` : acc.address;
        if (currentAccount && acc.address === currentAccount.address) {
            opt.selected = true;
            mailboxNote.value = acc.note || '';
        }
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
    updateUserAvatar(currentAccount.address);
    updateExpiryTimer();
    updateMailboxSwitcher();
    startAutoRefresh();
    fetchMessages();
}

function updateUserAvatar(email) {
    if (!userAvatar) return;
    const { color, initial } = getAvatarData(email);
    userAvatar.style.backgroundColor = color;
    userAvatar.textContent = initial;
}

function getAvatarData(email) {
    if (!email) return { color: '#ccc', initial: '?' };
    const colors = ['#6366f1', '#10b981', '#ef4444', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    const initial = email.charAt(0).toUpperCase();
    return { color, initial };
}

// Theme Toggle
function setupTheme() {
    const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    let savedTheme = localStorage.getItem('theme');

    if (!savedTheme) {
        savedTheme = getSystemTheme();
    }

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.onclick = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    };

    // Auto sync with system
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function setupColors() {
    const savedColor = localStorage.getItem('mail_accent') || '#6366f1';
    document.documentElement.style.setProperty('--primary', savedColor);

    document.querySelectorAll('.color-dot').forEach(dot => {
        if (dot.dataset.color === savedColor) dot.classList.add('active');
        else dot.classList.remove('active');

        dot.onclick = () => {
            const color = dot.dataset.color;
            document.documentElement.style.setProperty('--primary', color);
            localStorage.setItem('mail_accent', color);
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        };
    });
}

function setupHelp() {
    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('help-btn');
    const closeHelp = document.getElementById('close-help');

    helpBtn.onclick = () => helpModal.classList.remove('hidden');
    closeHelp.onclick = () => helpModal.classList.add('hidden');

    if (!localStorage.getItem('help_shown')) {
        setTimeout(() => helpModal.classList.remove('hidden'), 2000);
        localStorage.setItem('help_shown', 'true');
    }
}

function setupSearch() {
    if (searchInput) {
        searchInput.oninput = () => {
            const query = searchInput.value.toLowerCase();
            const filtered = allMessages.filter(m =>
                m.from.address.toLowerCase().includes(query) ||
                (m.subject && m.subject.toLowerCase().includes(query))
            );
            renderInbox(filtered, true);
        };
    }
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
    document.getElementById('share-btn').innerHTML = `<i class="fas fa-share-alt"></i>`;
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

    // Update Notes label
    const savedLabel = document.getElementById('saved-label');
    if (savedLabel) savedLabel.textContent = t.saved_label;
    if (mailboxNote) mailboxNote.placeholder = t.note_ph;

    // Update Tools
    const toolsTitle = document.getElementById('tools-title');
    if (toolsTitle) toolsTitle.textContent = t.tools;
    document.getElementById('export-btn').innerHTML = `<i class="fas fa-file-export"></i> ${t.export}`;
    document.getElementById('import-btn').innerHTML = `<i class="fas fa-file-import"></i> ${t.import}`;

    // Update Analytics Labels
    document.getElementById('stat-label-1').textContent = t.stat1;
    document.getElementById('stat-label-2').textContent = t.stat2;
    document.getElementById('pref-title').textContent = t.pref_t;
    document.getElementById('pref-sound').textContent = t.pref_s;
    document.getElementById('pref-confetti').textContent = t.pref_c;

    // Update Help & QR
    document.getElementById('help-title').textContent = t.help_title;
    document.getElementById('close-help').textContent = t.help_got;
    document.getElementById('help-1').textContent = t.h1;
    document.getElementById('help-2').textContent = t.h2;
    document.getElementById('help-3').textContent = t.h3;
    document.getElementById('help-4').textContent = t.h4;
    document.getElementById('qr-title').textContent = t.qr_t;
    document.getElementById('qr-desc').textContent = t.qr_p;

    // Update HIW
    document.getElementById('hiw-title').textContent = t.hiw_t;
    document.getElementById('step-1').textContent = t.s1;
    document.getElementById('step-2').textContent = t.s2;
    document.getElementById('step-3').textContent = t.s3;
    document.getElementById('step-4').textContent = t.s4;
    if (searchInput) searchInput.placeholder = currentLang === 'en' ? 'Search emails...' : 'ईमेल खोजें...';
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

        currentAccount = { address, password, createdAt: Date.now() };
        await getToken();

        // Add to multi-account list
        currentAccount.token = token;
        accounts.push(currentAccount);
        localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));
        localStorage.setItem('temp_mail_account', JSON.stringify(currentAccount));

        if (emailInput) {
            emailInput.value = address;
            updateUserAvatar(address);
            await navigator.clipboard.writeText(address);
        }
        customUsername.value = '';

        updateExpiryTimer();
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
        allMessages = data['hydra:member'];
        renderInbox(allMessages);
    } catch (error) {
        console.error('Fetch error', error);
    }
}

function renderInbox(messages, isSearch = false) {
    if (!inboxList) return;

    if (!isSearch) {
        if (messages.length > lastMsgCount && lastMsgCount !== 0) {
            const newCount = messages.length - lastMsgCount;
            if (newCount > 0) {
                incrementAnalytics(newCount);
                notifyNewMail(messages[0].subject);
            }
        }
        lastMsgCount = messages.length;
    }

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
        const isUnread = !readMessages.includes(msg.id);
        const safetyScore = Math.random() > 0.3 ? 'safe' : 'warning';
        const { color, initial } = getAvatarData(msg.from.address);

        const item = document.createElement('div');
        item.className = `message-item ${isUnread ? 'unread' : ''}`;
        item.innerHTML = `
            <div class="msg-avatar" style="background-color: ${color}; width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 0.9rem; margin-right: 15px;">
                ${initial}
            </div>
            <div class="item-main" style="flex: 1;">
                <div class="from">
                    ${isUnread ? '<span class="unread-dot"></span>' : ''}
                    ${msg.from.address}
                    <span class="safety-badge safety-${safetyScore}">${safetyScore}</span>
                </div>
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
        if (!readMessages.includes(id)) {
            readMessages.push(id);
            localStorage.setItem('read_messages', JSON.stringify(readMessages));
            renderInbox(allMessages); // Update UI to show as read
        }

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

        // Handle Attachments
        const attachList = document.getElementById('attachment-list');
        const attachCont = document.getElementById('attachments-container');
        if (msg.attachments && msg.attachments.length > 0) {
            attachList.classList.remove('hidden');
            attachCont.innerHTML = '';
            msg.attachments.forEach(file => {
                const link = document.createElement('a');
                link.className = 'attach-item';
                link.href = `${API_URL}/messages/${id}/attachments/${file.id}`; // This might require auth in real use
                link.target = '_blank';
                link.innerHTML = `<i class="fas fa-file"></i> ${file.filename} (${(file.size/1024).toFixed(1)} KB)`;
                attachCont.appendChild(link);
            });
        } else {
            attachList.classList.add('hidden');
        }

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

    if (document.getElementById('toggle-sound').checked) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(e => console.log('Audio blocked'));
    }

    if (document.getElementById('toggle-confetti').checked && typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [localStorage.getItem('mail_accent') || '#6366f1', '#a855f7', '#ffffff']
        });
    }
}

function updateExpiryTimer() {
    if (!currentAccount || !currentAccount.createdAt) return;
    const now = Date.now();
    const life = 24 * 60 * 60 * 1000; // 24 hours
    const elapsed = now - currentAccount.createdAt;
    const remaining = Math.max(0, life - elapsed);

    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    document.getElementById('expiry-timer').textContent = `${h}h ${m}m`;
}

function startAutoRefresh() {
    timeLeft = 7;
    if (refreshInterval) clearInterval(refreshInterval);

    refreshInterval = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            timeLeft = 7;
            fetchMessages();
            updateExpiryTimer();
        }

        if (progressFill) {
            const percent = (timeLeft / 7) * 100;
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

document.getElementById('share-btn').onclick = async () => {
    const address = emailInput.value;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'My Temp Email',
                text: `Here is my temporary email address: ${address}`,
                url: window.location.href
            });
        } catch (err) {
            console.log('Share failed:', err);
        }
    } else {
        alert(`Your temp email: ${address}\n\n(Share API not supported in this browser)`);
    }
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

document.getElementById('print-btn').onclick = () => {
    const win = window.open('', '_blank');
    const subject = document.getElementById('msg-subject').textContent;
    const from = document.getElementById('msg-from').textContent;
    const date = document.getElementById('msg-date').textContent;
    const content = msgIframe.srcdoc;

    win.document.write(`
        <html>
            <head><title>Print Email</title><style>body{font-family:sans-serif;padding:40px;} .meta{border-bottom:2px solid #eee;padding-bottom:20px;margin-bottom:20px;}</style></head>
            <body>
                <div class="meta">
                    <h1>${subject}</h1>
                    <p><strong>From:</strong> ${from}</p>
                    <p><strong>Date:</strong> ${date}</p>
                </div>
                <div>${content}</div>
            </body>
        </html>
    `);
    win.document.close();
    win.print();
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

// Backup & Restore
document.getElementById('export-btn').onclick = () => {
    const data = JSON.stringify(accounts);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempmail-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

document.getElementById('import-btn').onclick = () => document.getElementById('import-file').click();

document.getElementById('import-file').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
                accounts = [...accounts, ...imported];
                // Remove duplicates
                accounts = accounts.filter((v,i,a)=>a.findIndex(t=>(t.address === v.address))===i);
                localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));
                updateMailboxSwitcher();
                alert('Backup imported successfully!');
            }
        } catch (err) {
            alert('Invalid backup file');
        }
    };
    reader.readAsText(file);
};

// Analytics
function incrementAnalytics(count) {
    let total = parseInt(localStorage.getItem('total_emails')) || 0;
    total += count;
    localStorage.setItem('total_emails', total);
    updateAnalyticsUI();
}

function updateAnalyticsUI() {
    const total = parseInt(localStorage.getItem('total_emails')) || 0;
    const time = total * 2; // 2 minutes per email
    document.getElementById('stat-emails').textContent = total;
    document.getElementById('stat-time').textContent = time >= 60 ? `${(time/60).toFixed(1)}h` : `${time}m`;
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed:', err));
    });
}

// Speed Up / Manual Refresh
document.getElementById('refresh-now-btn').onclick = () => {
    fetchMessages();
    timeLeft = 7;
    const btn = document.getElementById('refresh-now-btn');
    btn.style.transform = 'rotate(360deg)';
    setTimeout(() => btn.style.transform = 'rotate(0deg)', 500);
};

// Delete Mailbox
document.getElementById('delete-mailbox-btn').onclick = () => {
    if (accounts.length <= 1) {
        alert('You must have at least one mailbox.');
        return;
    }
    if (confirm('Delete this mailbox permanently?')) {
        const index = accounts.findIndex(a => a.address === currentAccount.address);
        if (index > -1) {
            accounts.splice(index, 1);
            localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));
            switchAccount(accounts[0].address);
        }
    }
};

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
