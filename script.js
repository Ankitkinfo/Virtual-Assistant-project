const talkBtn = document.getElementById('talk-btn');
const userInput = document.getElementById('user-input');
const assistantMessage = document.getElementById('assistant-message');
const container = document.querySelector('.container');
const toggleVoiceBtn = document.getElementById('toggle-voice');
const clearChatBtn = document.getElementById('clear-chat');

let voiceEnabled = true;
let isListening = false;

function speak(text) {
    if (voiceEnabled) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    }
}

function wishMe() {
    const hour = new Date().getHours();
    let greeting;

    if (hour >= 0 && hour < 12) {
        greeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    assistantMessage.textContent = `${greeting}! I'm NOVA, your virtual assistant. How may I help you?`;
    speak(`${greeting}! I'm Nova, your virtual assistant. How may I help you?`);
}

window.addEventListener('load', () => {
    speak("Initializing NOVA...");
    setTimeout(wishMe, 1000);
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.onstart = () => {
    isListening = true;
    userInput.textContent = "Listening...";
    talkBtn.classList.add('pulse');
    container.classList.add('listening');
};

recognition.onresult = (event) => {
    const resultIndex = event.resultIndex;
    const transcript = event.results[resultIndex][0].transcript;
    userInput.textContent = transcript;
    handleCommand(transcript.toLowerCase());
};

recognition.onend = () => {
    isListening = false;
    talkBtn.classList.remove('pulse');
    container.classList.remove('listening');
    userInput.textContent = "Click the microphone or press Ctrl+Space to speak";
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    userInput.textContent = "Error occurred in recognition. Please try again.";
    isListening = false;
    talkBtn.classList.remove('pulse');
    container.classList.remove('listening');
};

function toggleListening() {
    if (!isListening) {
        recognition.start();
    } else {
        recognition.stop();
    }
}

talkBtn.addEventListener('click', toggleListening);

async function getWeather(city) {
    const apiKey = '6a49887bc93c036620dab9c2e6dc26fa';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return `The current temperature in ${city} is ${data.main.temp}°C with ${data.weather[0].description}.`;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return "I'm sorry, I couldn't fetch the weather information at the moment.";
    }
}

async function handleCommand(command) {
    let response = "";

    if (command.includes('hello') || command.includes('hi')) {
        response = "Hello! How can I help you today?";
    } else if (command.includes('how are you')) {
        response = "I'm functioning well, thank you for asking. How about you?";
    } else if (command.includes('open google')) {
        window.open("https://www.google.com", "_blank");
        response = "Opening Google for you.";
    } else if (command.includes('open youtube')) {
        window.open("https://www.youtube.com", "_blank");
        response = "Opening YouTube for you.";
    } else if (command.includes('open facebook')) {
        window.open("https://www.facebook.com", "_blank");
        response = "Opening Facebook for you.";
    } else if (command.includes('what is') || command.includes('who is') || command.includes('what are') || command.includes('how') || /^\w+$/.test(command)) {
        const searchQuery = command.replace(/^(what is|who is|what are|how) /, '').trim();
        window.open(`https://www.google.com/search?q=${searchQuery.replace(/\s+/g, "+")}`, "_blank");
        response = `I've searched for information about "${searchQuery}" on Google for you.`;
    } else if (command.includes('time')) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        response = `The current time is ${time}.`;
    } else if (command.includes('date')) {
        const date = new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        response = `Today's date is ${date}.`;
    } else if (command.includes('joke')) {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a fake noodle? An impasta!",
            "Why did the math book look so sad? Because it had too many problems!"
        ];
        response = jokes[Math.floor(Math.random() * jokes.length)];
    } else if (command.includes('weather')) {
        const city = command.replace('weather', '').trim() || 'London';
        response = await getWeather(city);
    } else if (command.includes('thank you') || command.includes('thanks')) {
        response = "You're welcome! Is there anything else I can help you with?";
    } else if (command.includes('bye') || command.includes('goodbye')) {
        response = "Goodbye! Have a great day!";
    } else {
        response = "I'm not sure how to help with that. Is there anything else I can assist you with?";
    }

    assistantMessage.textContent = response;
    speak(response);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && event.ctrlKey) {
        event.preventDefault();
        toggleListening();
    }
});

toggleVoiceBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    toggleVoiceBtn.innerHTML = voiceEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    speak(voiceEnabled ? "Voice output enabled" : "Voice output disabled");
});

clearChatBtn.addEventListener('click', () => {
    assistantMessage.textContent = "How may I help you today?";
    userInput.textContent = "Click the microphone or press Ctrl+Space to speak";
    speak("Chat cleared. How may I help you?");
});