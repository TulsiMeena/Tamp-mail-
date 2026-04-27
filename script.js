const API_URL = 'https://api.mail.tm';
let currentAccount = JSON.parse(localStorage.getItem('temp_mail_account'));
let token = localStorage.getItem('temp_mail_token');
let refreshInterval = null;

// DOM Elements
const emailInput = document.getElementById('email-address');
const inboxList = document.getElementById('inbox-list');
const messageView = document.getElementById('message-view');
const msgIframe = document.getElementById('message-iframe');
const statusText = document.getElementById('status');
const navLinks = document.querySelectorAll('.nav-link, .nav-logo');
const sections = document.querySelectorAll('.content-section');

// SPA Routing
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Reset message view if going to home
    if (sectionId === 'home') {
        messageView.classList.add('hidden');
        document.querySelector('.inbox-section').classList.remove('hidden');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        showSection(sectionId);
    });
});

// Helper to update status
function updateStatus(text) {
    if (statusText) statusText.textContent = text;
}

// 1. Fetch available domains
async function getDomains() {
    const response = await fetch(`${API_URL}/domains`);
    const data = await response.json();
    return data['hydra:member'].map(d => d.domain);
}

// 2. Create a random account
async function createAccount() {
    try {
        updateStatus('Generating email...');
        const domains = await getDomains();
        const domain = domains[0];
        const randomString = Math.random().toString(36).substring(2, 10);
        const address = `${randomString}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        const response = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!response.ok) throw new Error('Failed to create account');

        currentAccount = { address, password };
        localStorage.setItem('temp_mail_account', JSON.stringify(currentAccount));
        emailInput.value = address;

        await getToken();
        startAutoRefresh();
        updateStatus('Ready');
    } catch (error) {
        console.error(error);
        updateStatus('Error creating account');
    }
}

// 3. Get JWT Token
async function getToken() {
    try {
        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentAccount)
        });
        const data = await response.json();
        token = data.token;
        localStorage.setItem('temp_mail_token', token);
        return token;
    } catch (error) {
        console.error('Failed to get token', error);
        return null;
    }
}

// 4. Fetch messages
async function fetchMessages() {
    if (!token) return;

    try {
        updateStatus('Checking for new mail...');
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            await getToken();
            return fetchMessages();
        }

        const data = await response.json();
        const messages = data['hydra:member'];

        renderInbox(messages);
        updateStatus('Updated');
        setTimeout(() => updateStatus('Ready'), 2000);
    } catch (error) {
        console.error(error);
        updateStatus('Error fetching messages');
    }
}

// 5. Render Inbox
function renderInbox(messages) {
    if (!inboxList) return;
    if (messages.length === 0) {
        inboxList.innerHTML = '<div class="empty-inbox">Your inbox is empty</div>';
        return;
    }

    inboxList.innerHTML = '';
    messages.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'message-item';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'date';
        dateSpan.textContent = new Date(msg.createdAt).toLocaleTimeString();

        const fromDiv = document.createElement('div');
        fromDiv.className = 'from';
        fromDiv.textContent = msg.from.address;

        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject';
        subjectDiv.textContent = msg.subject || '(No Subject)';

        item.appendChild(dateSpan);
        item.appendChild(fromDiv);
        item.appendChild(subjectDiv);

        item.onclick = () => viewMessage(msg.id);
        inboxList.appendChild(item);
    });
}

// 6. View a specific message
async function viewMessage(id) {
    try {
        updateStatus('Loading message...');
        const response = await fetch(`${API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const msg = await response.json();

        document.getElementById('msg-subject').textContent = msg.subject || '(No Subject)';
        document.getElementById('msg-from').textContent = msg.from.address;
        document.getElementById('msg-date').textContent = new Date(msg.createdAt).toLocaleString();

        const content = msg.html ? msg.html[0] : (msg.text || 'No content');

        msgIframe.srcdoc = `
            <html>
                <head>
                    <style>body { font-family: sans-serif; line-height: 1.6; color: #333; padding: 20px; }</style>
                </head>
                <body>${content}</body>
            </html>
        `;

        messageView.classList.remove('hidden');
        document.querySelector('.inbox-section').classList.add('hidden');
        updateStatus('Message loaded');
    } catch (error) {
        console.error(error);
        updateStatus('Error loading message');
    }
}

// UI Controls
document.getElementById('back-btn').onclick = () => {
    messageView.classList.add('hidden');
    document.querySelector('.inbox-section').classList.remove('hidden');
    updateStatus('Ready');
};

document.getElementById('refresh-btn').onclick = fetchMessages;

document.getElementById('new-btn').onclick = () => {
    if (confirm('Create a new email address? The current one will be lost.')) {
        localStorage.clear();
        clearInterval(refreshInterval);
        createAccount();
    }
};

document.getElementById('copy-btn').onclick = async () => {
    try {
        await navigator.clipboard.writeText(emailInput.value);
        const originalBtn = document.getElementById('copy-btn');
        const originalHTML = originalBtn.innerHTML;
        originalBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            originalBtn.innerHTML = originalHTML;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
};

// Contact Form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.onsubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your message! This is a demo form.');
        contactForm.reset();
    };
}

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(fetchMessages, 10000);
}

// Initial Load
if (currentAccount && token) {
    if (emailInput) emailInput.value = currentAccount.address;
    fetchMessages();
    startAutoRefresh();
} else {
    createAccount();
}
