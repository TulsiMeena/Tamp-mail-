const API_URL = 'https://api.mail.tm';

let account = null;
let messages = [];

const emailDisplay = document.getElementById('email-address');
const messageList = document.getElementById('message-list');
const messageModal = document.getElementById('message-modal');
const messageDetail = document.getElementById('message-detail');
const closeModal = document.querySelector('.close-btn');

async function init() {
    const savedAccount = localStorage.getItem('temp_mail_account');
    if (savedAccount) {
        account = JSON.parse(savedAccount);
        emailDisplay.textContent = account.address;
        fetchMessages();
    } else {
        createAccount();
    }
    // Auto refresh every 10 seconds
    setInterval(fetchMessages, 10000);
}

async function createAccount() {
    try {
        emailDisplay.textContent = 'Generating...';
        const domainResponse = await fetch(`${API_URL}/domains`);
        const domainData = await domainResponse.json();
        const domains = domainData['hydra:member'];

        if (!domains || domains.length === 0) {
            throw new Error('No domains available');
        }

        const domain = domains[0].domain;
        const username = Math.random().toString(36).substring(2, 12);
        const password = Math.random().toString(36).substring(2, 12);
        const address = `${username}@${domain}`;

        const createResponse = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!createResponse.ok) throw new Error('Failed to create account');

        const tokenResponse = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        const tokenData = await tokenResponse.json();
        account = { address, password, token: tokenData.token };
        localStorage.setItem('temp_mail_account', JSON.stringify(account));

        emailDisplay.textContent = account.address;
        fetchMessages();
    } catch (error) {
        console.error(error);
        emailDisplay.textContent = 'Error creating account. Retrying...';
        setTimeout(createAccount, 5000);
    }
}

async function fetchMessages() {
    if (!account) return;
    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${account.token}` }
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.error('Unauthorized. Token might be expired.');
                return;
            }
            throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        messages = data['hydra:member'];
        renderMessages();
    } catch (error) {
        console.error('Error fetching messages:', error);
        if (messageList.innerHTML === '' || messageList.querySelector('.empty-msg')) {
             messageList.innerHTML = `<li class="empty-msg" style="color: red;">Error fetching messages. Retrying...</li>`;
        }
    }
}

function renderMessages() {
    messageList.innerHTML = '';
    if (messages.length === 0) {
        messageList.innerHTML = '<li class="empty-msg">Your inbox is empty.</li>';
        return;
    }

    messages.forEach(msg => {
        const li = document.createElement('li');

        const fromSpan = document.createElement('strong');
        fromSpan.textContent = 'From: ';
        const fromAddr = document.createTextNode(msg.from.address);

        const br = document.createElement('br');

        const subSpan = document.createElement('strong');
        subSpan.textContent = 'Subject: ';
        const subject = document.createTextNode(msg.subject || '(No Subject)');

        li.appendChild(fromSpan);
        li.appendChild(fromAddr);
        li.appendChild(br);
        li.appendChild(subSpan);
        li.appendChild(subject);

        li.onclick = () => showMessage(msg.id);
        messageList.appendChild(li);
    });
}

async function showMessage(id) {
    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${account.token}` }
        });
        const msg = await response.json();

        messageDetail.innerHTML = '';

        const h3 = document.createElement('h3');
        h3.textContent = msg.subject || '(No Subject)';

        const p = document.createElement('p');
        const fromStrong = document.createElement('strong');
        fromStrong.textContent = 'From: ';
        p.appendChild(fromStrong);
        p.appendChild(document.createTextNode(`${msg.from.name || ''} <${msg.from.address}>`));

        const hr = document.createElement('hr');

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '300px';
        iframe.style.border = 'none';
        iframe.sandbox = '';
        iframe.srcdoc = msg.html ? msg.html[0] || msg.html : msg.text;

        messageDetail.appendChild(h3);
        messageDetail.appendChild(p);
        messageDetail.appendChild(hr);
        messageDetail.appendChild(iframe);

        messageModal.style.display = 'flex';
    } catch (error) {
        console.error('Error showing message:', error);
    }
}

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(account.address).then(() => {
        const originalText = document.getElementById('copy-btn').textContent;
        document.getElementById('copy-btn').textContent = 'Copied!';
        setTimeout(() => {
            document.getElementById('copy-btn').textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy email');
    });
};

document.getElementById('refresh-btn').onclick = fetchMessages;

document.getElementById('new-mail-btn').onclick = () => {
    localStorage.removeItem('temp_mail_account');
    createAccount();
};

closeModal.onclick = () => {
    messageModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == messageModal) {
        messageModal.style.display = 'none';
    }
};

init();
