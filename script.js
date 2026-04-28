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

// Error Reporting System
function reportError(msg, type = 'error') {
    console.error(`[App Error]: ${msg}`);
    showToast(msg, type);
}

// Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) {
        const c = document.createElement('div');
        c.id = 'toast-container';
        c.className = 'toast-container';
        document.body.appendChild(c);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'error' ? 'exclamation-circle' : (type === 'success' ? 'check-circle' : 'info-circle');
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;

    document.getElementById('toast-container').appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Global Error Handler
window.onerror = function(message, source, lineno, colno, error) {
    reportError("A runtime error occurred. Please refresh the page.", 'error');
    return true;
};

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
        team_title: "Meet the Team", student: "Pro", developer: "Developer",
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
        hiw_t: "How It Works", s1: "Generate a unique address instantly.", s2: "Use it on any site or app.", s3: "Mails arrive in 1-2 seconds.", s4: "Close the tab to purge data.",
        uc_t: "Where to Use TempMail?",
        uc1t: "Gaming & Beta Tests", uc1d: "Register for game trials and beta tests without risking your main account to marketing spam.",
        uc2t: "Online Shopping", uc2d: "Get one-time discount codes from stores without being added to their permanent mailing lists.",
        uc3t: "Public Wi-Fi", uc3d: "Safely sign up for airport or cafe Wi-Fi that requires email verification.",
        uc4t: "Free Downloads", uc4d: "Access eBooks, templates, or software that 'require email' before downloading.",
        sec_t: "Ultimate Privacy & Security Guide", sec_i: "In today's digital world, your email is your digital identity. Exposing it to every website you visit is dangerous. Here is why online privacy matters:",
        sec1t: "Phishing Protection", sec1d: "TempMail shields you from phishing links. If an attacker gets your temp address, your real mailbox remains hidden and safe.",
        sec2t: "Spam Defense", sec2d: "90% of internet traffic is spam. By using disposable emails, you keep your primary inbox 100% clean and organized.",
        sec3t: "Data Privacy", sec3d: "Websites sell your email to advertisers. With TempMail, they only get data that will eventually disappear.",
        faq_t: "Frequently Asked Questions",
        q1: "Is Temp Mail legal?", a1: "Yes, temporary email services are 100% legal for legitimate use like avoiding spam.",
        q2: "How long do emails stay?", a2: "Emails are kept on the server for a few hours before being automatically purged.",
        q3: "Can I send emails?", a3: "Most temp mail services, including this one, are for receiving emails only to maintain security.",
        q4: "Is my real IP safe?", a4: "Yes, we don't store your personal IP or connect it to your temporary address.",
        q5: "Can I recover a mailbox?", a5: "If you have your token or backup file, you can restore access to your mailbox.",
        q6: "Do you sell my data?", a6: "Absolutely not. We generate revenue through premium features/ads (in future) but never by selling user identities.",
        q7: "Why is it free?", a7: "We believe privacy is a fundamental human right. Our infrastructure is optimized for high efficiency and low cost.",
        q8: "Can I use it for social media?", a8: "Yes, for registration and verification, though some sites may block known disposable domains.",
        q9: "Is there a limit?", a9: "You can create unlimited accounts. Each lasts for 24 hours unless you export your backup.",
        q10: "Who made this?", a10: "This professional tool was conceptualized by Aman Meena and developed by Amit Meena.",
        del_confirm: "Delete this mailbox permanently?",
        del_limit: "You must have at least one mailbox.",
        note_saved: "Note saved!",
        creating: "Creating...",
        failed: "Failed",
        error: "Error",
        loading: "Loading...",
        viewing: "Viewing",
        offline: "Offline",
        import_success: "Backup imported successfully!",
        import_err: "Invalid backup file",
        ticket_success: "Ticket submitted successfully! Amit Meena will review it soon.",
        exp_title: "Professional Work & Expertise",
        w1t: "Amit's Portfolio", w1d: "Full-stack developer specializing in React, Node.js, and Modern CSS. Built over 50+ high-performance web applications with a focus on UX and 3D interactivity.",
        w2t: "Aman's Influence", w2d: "Digital content creator and influencer. Expert in social media strategy, brand building, and community engagement with a reach of 15K+ active followers.",
        w3t: "Joint Ventures", w3d: "Collaborative projects focusing on Privacy Tools, Open Source security modules, and Next-Gen communication platforms.",
        v_t: "Our Vision", v_d: "TempMail was conceptualized by Aman Meena and brought to life by Amit Meena. We believe in a web where privacy is a right, not a luxury. Our goal is to provide tools that empower users to control their digital footprint.",
        amit_bio: "The creative mind behind the architecture and development of this advanced platform.",
        skill1: "Web Developer", skill2: "UI/UX Designer", skill3: "Software Engineer",
        tips_t: "Pro Tips for Power Users",
        t1t: "Custom Usernames", t1d: "Enter a custom name in the username field before clicking \"Create\" to have a professional-looking email like yourname@domain.com.",
        t2t: "Session Backup", t2d: "Use the \"Export Backup\" tool in the Privacy section to save your mailboxes. You can restore them later using the \"Import\" tool.",
        t3t: "Desktop Alerts", t3d: "Enable browser notifications to get alerted about new emails even when you are on another tab.",
        comp_t: "Why TempMail Pro?", f_feat: "Feature", f_std: "Standard Service", f_pro: "TempMail Pro",
        td1: "Custom Username", td2: "Multi-Mailbox", td3: "Backups", td4: "3D Interface", td5: "Bilingual Support",
        glos_t: "Privacy Glossary",
        g1t: "Phishing", g1d: "A cyber attack that uses disguised email as a weapon to steal sensitive data.",
        g2t: "TLS/SSL", g2d: "Encryption protocols that ensure data sent between a browser and a server is private.",
        g3t: "Data Purge", g3d: "The permanent removal of data from a storage system so it cannot be recovered.",
        g4t: "Digital Footprint", g4d: "The trail of data you leave behind while using the internet.",
        review_title: "User Reviews"
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
        team_title: "टीम से मिलें", student: "Pro", developer: "डेवलपर",
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
        hiw_t: "यह कैसे काम करता है", s1: "तुरंत एक अद्वितीय पता जनरेट करें।", s2: "इसे किसी भी साइट या ऐप पर उपयोग करें।", s3: "मेल 1-2 सेकंड में आते हैं।", s4: "डेटा साफ़ करने के लिए टैब बंद करें।",
        uc_t: "TempMail का उपयोग कहाँ करें?",
        uc1t: "गेमिंग और बीटा टेस्ट", uc1d: "मार्केटिंग स्पैम के जोखिम के बिना गेम ट्रायल और बीटा टेस्ट के लिए पंजीकरण करें।",
        uc2t: "ऑनलाइन शॉपिंग", uc2d: "स्थायी मेलिंग सूची में शामिल हुए बिना स्टोर से वन-टाइम डिस्काउंट कोड प्राप्त करें।",
        uc3t: "पब्लिक वाई-फाई", uc3d: "हवाई अड्डे या कैफे वाई-फाई के लिए सुरक्षित रूप से साइन अप करें जिसके लिए ईमेल सत्यापन की आवश्यकता होती है।",
        uc4t: "मुफ्त डाउनलोड", uc4d: "उन ई-बुक्स, टेम्प्लेट या सॉफ़्टवेयर तक पहुँचें जिन्हें डाउनलोड करने से पहले 'ईमेल की आवश्यकता' होती है।",
        sec_t: "परम गोपनीयता और सुरक्षा मार्गदर्शिका", sec_i: "आज की डिजिटल दुनिया में, आपका ईमेल आपकी डिजिटल पहचान है। इसे आपके द्वारा देखी जाने वाली प्रत्येक वेबसाइट पर उजागर करना खतरनाक है। यहाँ बताया गया है कि ऑनलाइन गोपनीयता क्यों महत्वपूर्ण है:",
        sec1t: "फ़िशिंग सुरक्षा", sec1d: "TempMail आपको फ़िशिंग लिंक से बचाता है। यदि किसी हमलावर को आपका टेम्प एड्रेस मिल जाता है, तो आपका वास्तविक मेलबॉक्स सुरक्षित रहता है।",
        sec2t: "स्पैम रक्षा", sec2d: "90% इंटरनेट ट्रैफ़िक स्पैम है। डिस्पोजेबल ईमेल का उपयोग करके, आप अपने प्राथमिक इनबॉक्स को 100% साफ़ रखते हैं।",
        sec3t: "डेटा गोपनीयता", sec3d: "Websites sell your email to advertisers. With TempMail, they only get data that will eventually disappear.",
        faq_t: "अक्सर पूछे जाने वाले प्रश्न",
        q1: "क्या टेम्प मेल कानूनी है?", a1: "हाँ, स्पैम से बचने जैसे वैध उपयोग के लिए अस्थायी ईमेल सेवाएँ 100% कानूनी हैं।",
        q2: "ईमेल कितने समय तक रहते हैं?", a2: "ईमेल स्वचालित रूप से हटाए जाने से पहले कुछ घंटों के लिए सर्वर पर रखे जाते हैं।",
        q3: "क्या मैं ईमेल भेज सकता हूँ?", a3: "सुरक्षा बनाए रखने के लिए, इस सहित अधिकांश टेम्प मेल सेवाएँ केवल ईमेल प्राप्त करने के लिए हैं।",
        q4: "क्या मेरा वास्तविक IP सुरक्षित है?", a4: "हाँ, हम आपका व्यक्तिगत IP संग्रहीत नहीं करते हैं या इसे आपके अस्थायी पते से नहीं जोड़ते हैं।",
        q5: "क्या मैं मेलबॉक्स रिकवर कर सकता हूँ?", a5: "यदि आपके पास अपना टोकन या बैकअप फ़ाइल है, तो आप अपने मेलबॉक्स तक पहुँच बहाल कर सकते हैं।",
        q6: "क्या आप मेरा डेटा बेचते हैं?", a6: "बिल्कुल नहीं। हम गोपनीयता को सर्वोपरि मानते हैं और कभी भी उपयोगकर्ता की पहचान नहीं बेचते हैं।",
        q7: "यह मुफ्त क्यों है?", a7: "हमारा मानना है कि गोपनीयता एक मौलिक अधिकार है। हमारी प्रणाली कम लागत पर उच्च दक्षता के लिए अनुकूलित है।",
        q8: "क्या मैं सोशल मीडिया के लिए इसका उपयोग कर सकता हूँ?", a8: "हाँ, पंजीकरण और सत्यापन के लिए, हालाँकि कुछ साइटें डिस्पोजेबल डोमेन को ब्लॉक कर सकती हैं।",
        q9: "क्या कोई सीमा है?", a9: "आप असीमित खाते बना सकते हैं। प्रत्येक खाता 24 घंटे तक रहता है जब तक कि आप अपना बैकअप एक्सपोर्ट नहीं करते।",
        q10: "इसे किसने बनाया?", a10: "यह पेशेवर टूल अमन मीणा द्वारा संकल्पित और अमित मीणा द्वारा विकसित किया गया था।",
        del_confirm: "क्या इस मेलबॉक्स को स्थायी रूप से हटाना चाहते हैं?",
        del_limit: "आपके पास कम से कम एक मेलबॉक्स होना चाहिए।",
        note_saved: "नोट सहेजा गया!",
        creating: "बनाया जा रहा है...",
        failed: "विफल",
        error: "त्रुटि",
        loading: "लोड हो रहा है...",
        viewing: "देख रहे हैं",
        offline: "ऑफलाइन",
        import_success: "बैकअप सफलतापूर्वक इम्पोर्ट किया गया!",
        import_err: "अमान्य बैकअप फ़ाइल",
        ticket_success: "टिकट सफलतापूर्वक जमा किया गया! अमित मीणा जल्द ही इसकी समीक्षा करेंगे।",
        exp_title: "पेशेवर कार्य और विशेषज्ञता",
        w1t: "अमित का पोर्टफोलियो", w1d: "रिएक्ट, नोड.जेएस और मॉडर्न सीएसएस में विशेषज्ञता रखने वाले फुल-स्टैक डेवलपर। यूएक्स और 3डी इंटरएक्टिविटी पर ध्यान देने के साथ 50+ से अधिक उच्च-प्रदर्शन वेब एप्लिकेशन बनाए।",
        w2t: "अमन का प्रभाव", w2d: "डिजिटल कंटेंट क्रिएटर और इन्फ्लुएंसर। 15K+ सक्रिय फॉलोअर्स की पहुंच के साथ सोशल मीडिया रणनीति, ब्रांड बिल्डिंग और सामुदायिक जुड़ाव में विशेषज्ञ।",
        w3t: "संयुक्त उद्यम", w3d: "गोपनीयता टूल, ओपन सोर्स सुरक्षा मॉड्यूल और अगली पीढ़ी के संचार प्लेटफार्मों पर केंद्रित सहयोगी परियोजनाएं।",
        v_t: "हमारा विजन", v_d: "TempMail अमन मीणा द्वारा संकल्पित किया गया था और अमित मीणा द्वारा जीवन में लाया गया था। हम एक ऐसे वेब में विश्वास करते हैं जहाँ गोपनीयता एक अधिकार है, विलासिता नहीं। हमारा लक्ष्य ऐसे उपकरण प्रदान करना है जो उपयोगकर्ताओं को उनके डिजिटल पदचिह्न को नियंत्रित करने के लिए सशक्त बनाते हैं।",
        amit_bio: "इस उन्नत मंच की वास्तुकला और विकास के पीछे रचनात्मक दिमाग।",
        skill1: "वेब डेवलपर", skill2: "UI/UX डिज़ाइनर", skill3: "सॉफ्टवेयर इंजीनियर",
        tips_t: "पावर उपयोगकर्ताओं के लिए प्रो टिप्स",
        t1t: "कस्टम यूजरनेम", t1d: "पेशेवर दिखने वाले ईमेल (जैसे yourname@domain.com) के लिए \"Create\" पर क्लिक करने से पहले यूजरनेम फ़ील्ड में एक कस्टम नाम दर्ज करें।",
        t2t: "सत्र बैकअप", t2d: "अपने मेलबॉक्स को सुरक्षित करने के लिए गोपनीयता अनुभाग में \"बैकअप एक्सपोर्ट करें\" टूल का उपयोग करें। आप उन्हें बाद में \"इम्पोर्ट\" टूल का उपयोग करके पुनर्स्थापित कर सकते हैं।",
        t3t: "डेस्कटॉप अलर्ट", t3d: "जब आप किसी अन्य टैब पर हों तब भी नए ईमेल के बारे में सतर्क रहने के लिए ब्राउज़र सूचनाएं सक्षम करें।",
        comp_t: "TempMail Pro ही क्यों?", f_feat: "सुविधा", f_std: "मानक सेवा", f_pro: "TempMail Pro",
        td1: "कस्टम यूजरनेम", td2: "मल्टी-मेलबॉक्स", td3: "बैकअप", td4: "3D इंटरफेस", td5: "द्विभाषी सहायता",
        glos_t: "गोपनीयता शब्दावली",
        g1t: "फ़िशिंग", g1d: "एक साइबर हमला जो संवेदनशील डेटा चुराने के लिए हथियार के रूप में भेस बदले हुए ईमेल का उपयोग करता है।",
        g2t: "TLS/SSL", g2d: "एन्क्रिप्शन प्रोटोकॉल जो सुनिश्चित करते हैं कि ब्राउज़र और सर्वर के बीच भेजा गया डेटा निजी है।",
        g3t: "डेटा पर्ज", g3d: "स्टोरेज सिस्टम से डेटा को स्थायी रूप से हटाना ताकि इसे रिकवर न किया जा सके।",
        g4t: "डिजिटल फुटप्रिंट", g4d: "इंटरनेट का उपयोग करते समय आपके द्वारा छोड़े गए डेटा का निशान।",
        review_title: "उपयोगकर्ता समीक्षा"
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
    if (mailboxSelect) {
        mailboxSelect.onchange = () => {
            switchAccount(mailboxSelect.value);
        };
    }

    const saveNoteBtn = document.getElementById('save-note-btn');
    if (saveNoteBtn) {
        saveNoteBtn.onclick = () => {
            const acc = accounts.find(a => a.address === currentAccount.address);
            const t = translations[currentLang];
            if (acc) {
                acc.note = mailboxNote.value;
                localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));
                updateMailboxSwitcher();
                showToast(t.note_saved, 'success');
            }
        };
    }
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
            if (mailboxNote) mailboxNote.value = acc.note || '';
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
    showToast(`Switched to ${address}`, 'info');
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

    if (themeToggle) {
        themeToggle.onclick = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        };
    }

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
    if (!themeToggle) return;
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

    if (helpBtn) helpBtn.onclick = () => helpModal.classList.remove('hidden');
    if (closeHelp) closeHelp.onclick = () => helpModal.classList.add('hidden');

    if (!localStorage.getItem('help_shown')) {
        setTimeout(() => {
            if (helpModal) helpModal.classList.remove('hidden');
        }, 2000);
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
    if (langToggle) {
        langToggle.onclick = () => {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            localStorage.setItem('mail_lang', currentLang);
            updateUIText();
        };
    }
}

function updateUIText() {
    const t = translations[currentLang];
    const langTextEl = document.getElementById('lang-text');
    if (langTextEl) langTextEl.textContent = currentLang === 'en' ? 'HI' : 'EN';

    // Update Nav
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks.length >= 4) {
        navLinks[0].textContent = t.home;
        navLinks[1].textContent = t.about;
        navLinks[2].textContent = t.contact;
        navLinks[3].textContent = t.privacy;
    }

    // Update Hero
    const heroH1 = document.querySelector('header h1');
    if (heroH1) heroH1.textContent = t.hero_title;
    const heroP = document.querySelector('header p');
    if (heroP) heroP.textContent = t.hero_desc;

    // Update Generator
    const badge = document.querySelector('.badge');
    if (badge) badge.textContent = t.badge;
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) copyBtn.innerHTML = `<i class="fas fa-copy"></i>`;
    const qrBtn = document.getElementById('qr-btn');
    if (qrBtn) qrBtn.innerHTML = `<i class="fas fa-qrcode"></i> ${t.qr}`;
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.innerHTML = `<i class="fas fa-share-alt"></i>`;
    const newBtn = document.getElementById('new-btn');
    if (newBtn) newBtn.innerHTML = `<i class="fas fa-plus"></i> ${t.new}`;

    // Update Inbox
    const inboxH2 = document.querySelector('.inbox-header h2');
    if (inboxH2) inboxH2.innerHTML = `<i class="fas fa-inbox"></i> ${t.inbox_title}`;
    const emptyP = document.querySelector('.empty-state p');
    if (emptyP) emptyP.textContent = t.waiting;
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> ${t.back}`;

    // Update Info Sections
    const infoCards = document.querySelectorAll('.info-card-3d');
    if (infoCards.length >= 3) {
        infoCards[0].querySelector('h3').textContent = t.what_is;
        infoCards[0].querySelector('p').textContent = t.what_is_p;
        infoCards[1].querySelector('h3').textContent = t.how_it;
        infoCards[1].querySelector('p').textContent = t.how_it_p;
        infoCards[2].querySelector('h3').textContent = t.benefits;
        const benefits = infoCards[2].querySelectorAll('.benefit-list li');
        if (benefits.length >= 4) {
            benefits[0].innerHTML = `<i class="fas fa-check"></i> ${t.benefit1}`;
            benefits[1].innerHTML = `<i class="fas fa-check"></i> ${t.benefit2}`;
            benefits[2].innerHTML = `<i class="fas fa-check"></i> ${t.benefit3}`;
            benefits[3].innerHTML = `<i class="fas fa-check"></i> ${t.benefit4}`;
        }
    }

    // Update About
    const aboutTitle = document.getElementById('team-title');
    if (aboutTitle) aboutTitle.textContent = t.team_title;
    const statusBadges = document.querySelectorAll('.status-badge');
    if (statusBadges[0]) statusBadges[0].textContent = t.student;
    if (statusBadges[1]) statusBadges[1].textContent = t.developer;
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 3) {
        statLabels[0].textContent = t.followers;
        statLabels[1].textContent = t.posts;
        statLabels[2].textContent = t.exp;
    }

    const expTitle = document.getElementById('expertise-title');
    if (expTitle) {
        expTitle.textContent = t.exp_title;
        document.getElementById('work-1-t').innerHTML = `<i class="fas fa-code"></i> ${t.w1t}`;
        document.getElementById('work-1-d').textContent = t.w1d;
        document.getElementById('work-2-t').innerHTML = `<i class="fas fa-bullhorn"></i> ${t.w2t}`;
        document.getElementById('work-2-d').textContent = t.w2d;
        document.getElementById('work-3-t').innerHTML = `<i class="fas fa-project-diagram"></i> ${t.w3t}`;
        document.getElementById('work-3-d').textContent = t.w3d;
        document.getElementById('vision-title').textContent = t.v_t;
        document.getElementById('vision-desc').textContent = t.v_d;
    }

    const amitBio = document.querySelector('.profile-card .bio');
    if (amitBio) amitBio.textContent = t.amit_bio;
    const skills = document.querySelectorAll('.skill-tags span');
    if (skills.length >= 3) {
        skills[0].textContent = t.skill1;
        skills[1].textContent = t.skill2;
        skills[2].textContent = t.skill3;
    }

    // Update Pro Tips
    const ptTitle = document.getElementById('protips-title');
    if (ptTitle) {
        ptTitle.textContent = t.tips_t;
        document.getElementById('tip-1-t').textContent = t.t1t;
        document.getElementById('tip-1-d').textContent = t.t1d;
        document.getElementById('tip-2-t').textContent = t.t2t;
        document.getElementById('tip-2-d').textContent = t.t2d;
        document.getElementById('tip-3-t').textContent = t.t3t;
        document.getElementById('tip-3-d').textContent = t.t3d;
    }

    // Update Comp Table
    const compTitle = document.getElementById('comp-title');
    if (compTitle) {
        compTitle.textContent = t.comp_t;
        document.getElementById('th-feature').textContent = t.f_feat;
        document.getElementById('th-standard').textContent = t.f_std;
        document.getElementById('th-pro').textContent = t.f_pro;
        document.getElementById('td-1-f').textContent = t.td1;
        document.getElementById('td-2-f').textContent = t.td2;
        document.getElementById('td-3-f').textContent = t.td3;
        document.getElementById('td-4-f').textContent = t.td4;
        document.getElementById('td-5-f').textContent = t.td5;
    }

    // Update Glossary
    const glosTitle = document.getElementById('glos-title');
    if (glosTitle) {
        glosTitle.textContent = t.glos_t;
        document.getElementById('glos-1-t').textContent = t.g1t;
        document.getElementById('glos-1-d').textContent = t.g1d;
        document.getElementById('glos-2-t').textContent = t.g2t;
        document.getElementById('glos-2-d').textContent = t.g2d;
        document.getElementById('glos-3-t').textContent = t.g3t;
        document.getElementById('glos-3-d').textContent = t.g3d;
        document.getElementById('glos-4-t').textContent = t.g4t;
        document.getElementById('glos-4-d').textContent = t.g4d;
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
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.innerHTML = `<i class="fas fa-file-export"></i> ${t.export}`;
    const importBtn = document.getElementById('import-btn');
    if (importBtn) importBtn.innerHTML = `<i class="fas fa-file-import"></i> ${t.import}`;

    // Update Analytics Labels
    const statLbl1 = document.getElementById('stat-label-1');
    if (statLbl1) statLbl1.textContent = t.stat1;
    const statLbl2 = document.getElementById('stat-label-2');
    if (statLbl2) statLbl2.textContent = t.stat2;
    const prefT = document.getElementById('pref-title');
    if (prefT) prefT.textContent = t.pref_t;
    const prefS = document.getElementById('pref-sound');
    if (prefS) prefS.textContent = t.pref_s;
    const prefC = document.getElementById('pref-confetti');
    if (prefC) prefC.textContent = t.pref_c;

    // Update Help & QR
    const helpT = document.getElementById('help-title');
    if (helpT) helpT.textContent = t.help_title;
    const closeHelp = document.getElementById('close-help');
    if (closeHelp) closeHelp.textContent = t.help_got;
    const h1 = document.getElementById('help-1');
    if (h1) h1.textContent = t.h1;
    const h2 = document.getElementById('help-2');
    if (h2) h2.textContent = t.h2;
    const h3 = document.getElementById('help-3');
    if (h3) h3.textContent = t.h3;
    const h4 = document.getElementById('help-4');
    if (h4) h4.textContent = t.h4;
    const qrT = document.getElementById('qr-title');
    if (qrT) qrT.textContent = t.qr_t;
    const qrD = document.getElementById('qr-desc');
    if (qrD) qrD.textContent = t.qr_p;

    // Update HIW
    const hiwT = document.getElementById('hiw-title');
    if (hiwT) hiwT.textContent = t.hiw_t;
    const s1 = document.getElementById('step-1');
    if (s1) s1.textContent = t.s1;
    const s2 = document.getElementById('step-2');
    if (s2) s2.textContent = t.s2;
    const s3 = document.getElementById('step-3');
    if (s3) s3.textContent = t.s3;
    const s4 = document.getElementById('step-4');
    if (s4) s4.textContent = t.s4;

    // Update Use Cases
    const ucTitle = document.getElementById('usecases-title');
    if (ucTitle) {
        ucTitle.textContent = t.uc_t;
        document.getElementById('uc-1-t').textContent = t.uc1t;
        document.getElementById('uc-1-d').textContent = t.uc1d;
        document.getElementById('uc-2-t').textContent = t.uc2t;
        document.getElementById('uc-2-d').textContent = t.uc2d;
        document.getElementById('uc-3-t').textContent = t.uc3t;
        document.getElementById('uc-3-d').textContent = t.uc3d;
        document.getElementById('uc-4-t').textContent = t.uc4t;
        document.getElementById('uc-4-d').textContent = t.uc4d;
    }

    // Update Security Guide
    const secTitle = document.getElementById('sec-title');
    if (secTitle) {
        secTitle.textContent = t.sec_t;
        document.getElementById('sec-intro').textContent = t.sec_i;
        document.getElementById('sec-1-t').textContent = t.sec1t;
        document.getElementById('sec-1-d').textContent = t.sec1d;
        document.getElementById('sec-2-t').textContent = t.sec2t;
        document.getElementById('sec-2-d').textContent = t.sec2d;
        document.getElementById('sec-3-t').textContent = t.sec3t;
        document.getElementById('sec-3-d').textContent = t.sec3d;
    }

    // Update FAQ
    const faqTitle = document.getElementById('faq-main-title');
    if (faqTitle) {
        faqTitle.textContent = t.faq_t;
        renderFAQ();
    }

    if (searchInput) searchInput.placeholder = currentLang === 'en' ? 'Search emails...' : 'ईमेल खोजें...';
}

function renderFAQ() {
    const cont = document.getElementById('faq-container');
    if (!cont) return;
    const t = translations[currentLang];
    const faqs = [
        { q: t.q1, a: t.a1 },
        { q: t.q2, a: t.a2 },
        { q: t.q3, a: t.a3 },
        { q: t.q4, a: t.a4 },
        { q: t.q5, a: t.a5 },
        { q: t.q6, a: t.a6 },
        { q: t.q7, a: t.a7 },
        { q: t.q8, a: t.a8 },
        { q: t.q9, a: t.a9 },
        { q: t.q10, a: t.a10 }
    ];

    cont.innerHTML = faqs.map((f, i) => `
        <div class="faq-item" data-index="${i}">
            <button class="faq-quest">${f.q} <i class="fas fa-chevron-down"></i></button>
            <div class="faq-ans">${f.a}</div>
        </div>
    `).join('');

    setupFAQEvents();
}

function setupFAQEvents() {
    document.querySelectorAll('.faq-quest').forEach(btn => {
        btn.onclick = () => {
            const item = btn.parentElement;
            item.classList.toggle('active');
        };
    });
}

// Routing logic
function setupRouting() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.onclick = () => {
            navMenu.classList.toggle('active');
            menuToggle.querySelector('i').className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        };
    }

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
            if (section === 'home' && messageView) messageView.classList.add('hidden');

            // Close mobile menu on click
            if (navMenu) {
                navMenu.classList.remove('active');
                if (menuToggle) menuToggle.querySelector('i').className = 'fas fa-bars';
            }
        };
    });
}

// Domain Management
async function fetchDomains() {
    try {
        const response = await fetch(`${API_URL}/domains`);
        if (!response.ok) throw new Error("Could not fetch domains.");
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
        reportError('Domain fetch failed. Using fallback.', 'info');
        domains = ['mail.tm'];
    }
}

// Account Creation
async function createAccount() {
    try {
        updateStatus('Creating...', 'orange');
        const domain = (domainSelect && domainSelect.value) || domains[0];
        const user = (customUsername && customUsername.value.trim()) || Math.random().toString(36).substring(2, 10);
        const address = `${user}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        const response = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, password })
        });

        if (!response.ok) {
            const err = await response.json();
            reportError(err.message || 'Account creation failed. Try another username.');
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
            try { await navigator.clipboard.writeText(address); } catch(e) {}
        }
        if (customUsername) customUsername.value = '';

        updateExpiryTimer();
        updateMailboxSwitcher();
        startAutoRefresh();
        updateStatus('Active', 'var(--success)');
        showToast('New mailbox created and copied!', 'success');
    } catch (error) {
        updateStatus('Error', 'var(--danger)');
        reportError('Failed to create account. Check connection.');
    }
}

async function getToken() {
    try {
        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: currentAccount.address, password: currentAccount.password })
        });
        if (!response.ok) throw new Error("Auth failed");
        const data = await response.json();
        token = data.token;
        localStorage.setItem('temp_mail_token', token);
    } catch (e) {
        reportError("Session expired. Creating new account.");
        createAccount();
    }
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

        if (!response.ok) throw new Error("Message sync failed");
        const data = await response.json();
        allMessages = data['hydra:member'];
        renderInbox(allMessages);
    } catch (error) {
        updateStatus('Offline', 'var(--danger)');
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
                <p>${translations[currentLang].waiting}</p>
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
        if (!response.ok) throw new Error("Could not load message");
        const msg = await response.json();

        document.getElementById('msg-subject').textContent = msg.subject || '(No Subject)';
        document.getElementById('msg-from').textContent = msg.from.address;
        document.getElementById('msg-date').textContent = new Date(msg.createdAt).toLocaleString();

        const content = msg.html ? msg.html[0] : (msg.text || 'No content');
        msgIframe.srcdoc = `<html><head><style>body{font-family:sans-serif;line-height:1.6;color:#333;padding:20px;background:#fff;word-break:break-word;}</style></head><body>${content}</body></html>`;

        // Store text version for download
        messageView.dataset.text = msg.text || content.replace(/<[^>]*>?/gm, '');

        // Handle Attachments
        const attachList = document.getElementById('attachment-list');
        const attachCont = document.getElementById('attachments-container');
        if (msg.attachments && msg.attachments.length > 0) {
            attachList.classList.remove('hidden');
            attachCont.innerHTML = '';
            msg.attachments.forEach(file => {
                const link = document.createElement('a');
                link.className = 'attach-item';
                link.href = '#';
                link.innerHTML = `<i class="fas fa-file"></i> ${file.filename} (${(file.size/1024).toFixed(1)} KB)`;
                link.onclick = (e) => {
                    e.preventDefault();
                    downloadAttachment(id, file.id, file.filename);
                };
                attachCont.appendChild(link);
            });
        } else {
            attachList.classList.add('hidden');
        }

        messageView.classList.remove('hidden');
        updateStatus('Viewing', 'var(--primary)');
        window.scrollTo(0, 0);
    } catch (error) {
        reportError('Failed to load message content.');
    }
}

// UI Helpers
function updateStatus(text, color) {
    if (statusText) statusText.textContent = translations[currentLang][text.toLowerCase()] || text;
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

    const soundToggle = document.getElementById('toggle-sound');
    if (soundToggle && soundToggle.checked) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(e => {});
    }

    const confettiToggle = document.getElementById('toggle-confetti');
    if (confettiToggle && confettiToggle.checked && typeof confetti === 'function') {
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
    const el = document.getElementById('expiry-timer');
    if (el) el.textContent = `${h}h ${m}m`;
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
const copyBtn = document.getElementById('copy-btn');
if (copyBtn) {
    copyBtn.onclick = async () => {
        await navigator.clipboard.writeText(emailInput.value);
        const old = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        showToast('Address copied!', 'success');
        setTimeout(() => copyBtn.innerHTML = old, 2000);
    };
}

const newBtn = document.getElementById('new-btn');
if (newBtn) {
    newBtn.onclick = () => createAccount();
}

const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
    shareBtn.onclick = async () => {
        const address = emailInput.value;
        if (navigator.share) {
            try {
                await navigator.share({
                title: 'Temp Email',
                text: address
                });
            } catch (err) {}
        } else {
        showToast(`Email: ${address}`, 'info');
        }
    };
}

const backBtn = document.getElementById('back-btn');
if (backBtn) {
    backBtn.onclick = () => {
        messageView.classList.add('hidden');
        updateStatus('Active', 'var(--success)');
    };
}

async function downloadAttachment(msgId, fileId, filename) {
    try {
        showToast('Starting download...', 'info');
        const fileRes = await fetch(`${API_URL}/messages/${msgId}/attachments/${fileId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!fileRes.ok) throw new Error("Download failed");
        const fileBlob = await fileRes.blob();
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        reportError('Attachment download failed.');
    }
}

const downloadBtn = document.getElementById('download-btn');
if (downloadBtn) {
    downloadBtn.onclick = () => {
        const subject = document.getElementById('msg-subject').textContent;
        const from = document.getElementById('msg-from').textContent;
        const date = document.getElementById('msg-date').textContent;
        const textContent = messageView.dataset.text;

        const text = `Subject: ${subject}\nFrom: ${from}\nDate: ${date}\n\n${textContent}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };
}

const printBtn = document.getElementById('print-btn');
if (printBtn) {
    printBtn.onclick = () => {
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
}

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
        const t = translations[currentLang];
        showToast(t.ticket_success, 'success');
        contactForm.reset();
    };
}

// Backup & Restore
const exportBtn = document.getElementById('export-btn');
if (exportBtn) {
    exportBtn.onclick = () => {
        const data = JSON.stringify(accounts);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tempmail-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup file generated.', 'success');
    };
}

const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
if (importBtn && importFile) {
    importBtn.onclick = () => importFile.click();

    importFile.onchange = (e) => {
        const file = e.target.files[0];
        const t = translations[currentLang];
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
                    showToast(t.import_success, 'success');
                }
            } catch (err) {
                reportError(t.import_err);
            }
        };
        reader.readAsText(file);
    };
}

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
    const elEmails = document.getElementById('stat-emails');
    const elTime = document.getElementById('stat-time');
    if (elEmails) elEmails.textContent = total;
    if (elTime) elTime.textContent = time >= 60 ? `${(time/60).toFixed(1)}h` : `${time}m`;
}

// Speed Up / Manual Refresh
const refreshNowBtn = document.getElementById('refresh-now-btn');
if (refreshNowBtn) {
    refreshNowBtn.onclick = () => {
        fetchMessages();
        timeLeft = 7;
        refreshNowBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => refreshNowBtn.style.transform = 'rotate(0deg)', 500);
        showToast('Synchronizing...', 'info');
    };
}

// Delete Mailbox
const delMailboxBtn = document.getElementById('delete-mailbox-btn');
if (delMailboxBtn) {
    delMailboxBtn.onclick = () => {
        const t = translations[currentLang];
        if (accounts.length <= 1) {
            showToast(t.del_limit, 'error');
            return;
        }
        if (confirm(t.del_confirm)) {
            const index = accounts.findIndex(a => a.address === currentAccount.address);
            if (index > -1) {
                accounts.splice(index, 1);
                localStorage.setItem('temp_mail_accounts', JSON.stringify(accounts));
                switchAccount(accounts[0].address);
                showToast('Mailbox deleted.', 'info');
            }
        }
    };
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(e => {});
    });
}

// Start
init();

// --- Interactive 3D Tilt Effect ---
function applyTilt() {
    const cards = document.querySelectorAll('.generator-card, .info-card-3d, .profile-card, .inbox-container, .tip-item, .stat-card');

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

setTimeout(applyTilt, 200);
