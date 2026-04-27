const API_URL = 'https://api.mail.tm';
let currentAccount = JSON.parse(localStorage.getItem('temp_mail_account'));
let token = localStorage.getItem('temp_mail_token');
let refreshInterval = null;
let domains = [];
let timeLeft = 10;

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

// Initialize App
async function init() {
    setupTheme();
    await fetchDomains();

    if (currentAccount && token) {
        if (emailInput) emailInput.value = currentAccount.address;
        startAutoRefresh();
        fetchMessages();
    } else {
        await createAccount();
    }

    setupRouting();
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
async function createAccount(customDomain = null) {
    try {
        updateStatus('Creating...', 'orange');
        const domain = customDomain || domains[0];
        const randomString = Math.random().toString(36).substring(2, 10);
        const address = `${randomString}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        const response = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!response.ok) throw new Error('Account creation failed');

        currentAccount = { address, password };
        localStorage.setItem('temp_mail_account', JSON.stringify(currentAccount));
        if (emailInput) emailInput.value = address;

        await getToken();
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
        body: JSON.stringify(currentAccount)
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
    btn.innerHTML = '<i class="fas fa-check"></i> Copied';
    setTimeout(() => btn.innerHTML = old, 2000);
};

document.getElementById('new-btn').onclick = () => {
    if (confirm('Get a new email address? All current messages will be lost.')) {
        localStorage.clear();
        createAccount(domainSelect.value);
    }
};

document.getElementById('back-btn').onclick = () => {
    messageView.classList.add('hidden');
    updateStatus('Active', 'var(--success)');
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

// Start
init();

// --- Interactive 3D Tilt Effect ---
function applyTilt() {
    const cards = document.querySelectorAll('.generator-card, .info-card-3d, .profile-card, .inbox-container');

    cards.forEach(card => {
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
