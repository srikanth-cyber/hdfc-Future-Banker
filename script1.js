// --- Application State ---
const state = {
    profile: {
        name: "", age: "", maritalStatus: "", children: "", parents: "",
        occupation: "", income: "", existingInsurance: "",
        concerns: "", goals: ""
    },
    currentQuestionIndex: 0
};

// Base questions
const questions = [
    { key: "name", text: "Hello. I am MAB AI. To begin your future life simulation, please tell me your name." },
    { key: "age", text: "Nice to meet you, {name}. How old are you?" },
    { key: "maritalStatus", text: "What is your current marital status? (Single, Married, Divorced, etc.)" },
    { key: "children", text: "How many children do you have?" },
    { key: "occupation", text: "What is your primary occupation?" },
    { key: "income", text: "What is your approximate monthly income?" },
    { key: "existingInsurance", text: "Do you currently have any life or health insurance? (Yes/No)" },
    { key: "concerns", text: "What is your biggest financial fear regarding your future?" },
    { key: "goals", text: "Finally, what is your primary financial goal for the next 10 years?" }
];

// --- DOM Elements ---
const screens = {
    welcome: document.getElementById('welcome-screen'),
    chat: document.getElementById('chat-screen'),
    scan: document.getElementById('scan-screen'),
    video: document.getElementById('video-screen'),
    recommendation: document.getElementById('recommendation-screen')
};

const startBtn = document.getElementById('start-btn');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const storyVideo = document.getElementById('story-video');

// =========================================
// AI VOICE WELCOME SYSTEM
// =========================================

function speakWelcomeMessage() {

    const message = new SpeechSynthesisUtterance(
        "Welcome to MAB AI. I am happy to see you here, as you decided to protect yourself from financial crises."
    );

    message.rate = 0.92;
    message.pitch = 1;
    message.volume = 1;

    const voices = speechSynthesis.getVoices();

    const preferredVoice =
        voices.find(v => v.name.includes('Google UK English Female')) ||
        voices.find(v => v.name.includes('Samantha')) ||
        voices.find(v => v.name.includes('Female')) ||
        voices[0];

    if (preferredVoice) {
        message.voice = preferredVoice;
    }

    activateAISpeakingEffect();

    speechSynthesis.speak(message);

    message.onend = () => {
        document.querySelector('.logo-container')
            .classList.remove('speaking');
    };
}

function activateAISpeakingEffect() {

    const logo = document.querySelector('.logo-container');

    logo.classList.add('speaking');
}

// --- Screen Navigation ---
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

// =========================================
// START BUTTON
// =========================================

startBtn.addEventListener('click', () => {

    speakWelcomeMessage();

    showScreen('chat');

    setTimeout(() => {
        askNextQuestion();
    }, 3500);

});

sendBtn.addEventListener('click', handleUserInput);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});

// =========================================
// CHAT LOGIC
// =========================================

function askNextQuestion() {

    if (state.currentQuestionIndex >= questions.length) {
        startFaceScan();
        return;
    }

    const q = questions[state.currentQuestionIndex];

    let aiText = q.text.replace("{name}", state.profile.name);

    showTypingIndicator();

    setTimeout(() => {

        removeTypingIndicator();

        appendMessage(aiText, 'ai-msg');

    }, 1500);
}

function handleUserInput() {

    const text = chatInput.value.trim();

    if (!text) return;

    appendMessage(text, 'user-msg');

    chatInput.value = '';

    const currentQ = questions[state.currentQuestionIndex];

    state.profile[currentQ.key] = text;

    // Dynamic branching
    if (currentQ.key === 'maritalStatus') {

        if (text.toLowerCase().includes('single')) {

            questions[state.currentQuestionIndex + 1] = {
                key: "parents",
                text: "Do you financially support your parents? (Yes/No)"
            };

        } else {

            questions[state.currentQuestionIndex + 1] = {
                key: "children",
                text: "How many children do you have?"
            };
        }
    }

    state.currentQuestionIndex++;

    chatInput.disabled = true;

    setTimeout(() => {

        chatInput.disabled = false;

        chatInput.focus();

        askNextQuestion();

    }, 500);
}

function appendMessage(text, className) {

    const msgDiv = document.createElement('div');

    msgDiv.className = `message ${className}`;

    msgDiv.innerText = text;

    chatBox.appendChild(msgDiv);

    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {

    const div = document.createElement('div');

    div.className = 'message ai-msg typing-indicator';

    div.id = 'typing';

    div.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {

    const typing = document.getElementById('typing');

    if (typing) typing.remove();
}

// =========================================
// FACE SCAN LOGIC
// =========================================

const scanPhrases = [
    "Analyzing future financial risks...",
    "Predicting life scenarios based on occupation...",
    "Evaluating family dependency metrics...",
    "Generating future income loss simulation...",
    "Calculating family protection index..."
];

async function startFaceScan() {

    showScreen('scan');

    const videoElem = document.getElementById('camera-feed');

    let stream = null;

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        videoElem.srcObject = stream;

    } catch (err) {

        console.warn("Camera access denied.");
    }

    const scanDuration = 10000;

    const updateInterval = 100;

    let elapsed = 0;

    let phraseIndex = 0;

    const progressEl = document.getElementById('scan-progress');

    const percentageEl = document.getElementById('scan-percentage');

    const textEl = document.getElementById('scan-text');

    const phraseInterval = setInterval(() => {

        phraseIndex = (phraseIndex + 1) % scanPhrases.length;

        textEl.innerText = scanPhrases[phraseIndex];

    }, 2500);

    const timer = setInterval(() => {

        elapsed += updateInterval;

        let percent = Math.min((elapsed / scanDuration) * 100, 100);

        progressEl.style.width = `${percent}%`;

        percentageEl.innerText = `${Math.floor(percent)}%`;

        if (elapsed >= scanDuration) {

            clearInterval(timer);

            clearInterval(phraseInterval);

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            startVideoPlayback();
        }

    }, updateInterval);
}

// =========================================
// VIDEO PLAYBACK
// =========================================

function startVideoPlayback() {

    showScreen('video');

    storyVideo.src = 'videoplayback.mp4';

    let playPromise = storyVideo.play();

    if (playPromise !== undefined) {

        playPromise.catch(error => {

            console.warn("Autoplay prevented.", error);

        });
    }

    storyVideo.onended = () => {

        showRecommendations();

    };
}

// =========================================
// RECOMMENDATIONS
// =========================================

function showRecommendations() {

    showScreen('recommendation');

    const summaryEl = document.getElementById('dynamic-summary');

    const p = state.profile;

    let customFocusText = "protecting your wealth and legacy";

    if (p.children && parseInt(p.children) > 0) {

        customFocusText = `securing the future of your ${p.children} children`;

    } else if (p.parents && p.parents.toLowerCase().includes('yes')) {

        customFocusText = `ensuring your parents remain financially protected`;
    }

    summaryEl.innerHTML = `
        <p><strong>${p.name}</strong>, our simulation reveals that your primary concern regarding <em>"${p.concerns}"</em> is valid.</p>

        <p>As a ${p.maritalStatus} individual earning roughly ${p.income}, an unexpected event could severely derail your goal of <em>"${p.goals}"</em>.</p>

        <p>To ensure total peace of mind and focus on <strong>${customFocusText}</strong>, we have formulated a specialized protection matrix for you.</p>
    `;
}