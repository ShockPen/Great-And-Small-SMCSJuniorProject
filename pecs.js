const pecsData = [
    { name: "Blocks", category: "Objects", image: "./images/blocks.jpg" },
    { name: "Bubbles", category: "Objects", image: "./images/bubbles.jpg" },
    { name: "Body Brush", category: "Objects", image: "./images/bodybrush.jpg" },
    { name: "Curry Comb", category: "Objects", image: "./images/currycomb.jpg" },
    { name: "Hay Bale", category: "Objects", image: "./images/haybale.gif" },
    { name: "Hoof Pick", category: "Objects", image: "./images/hoofpickwithbrush.jpg" },

    { name: "Cat", category: "Animals", image: "./images/cat.jpg" },
    { name: "Cow", category: "Animals", image: "./images/cow.jpg" },
    { name: "Dog", category: "Animals", image: "./images/dog.jpg" },
    { name: "Goat", category: "Animals", image: "./images/goat.gif" },
    { name: "Horse", category: "Animals", image: "./images/horse.jpg" },
    { name: "Kid", category: "Animals", image: "./images/kid.png" },
    { name: "Pig", category: "Animals", image: "./images/pig.jpg" },

    { name: "Angry", category: "Emotions", image: "./images/angry.jpg" },
    { name: "Crying", category: "Emotions", image: "./images/crying.jpg" },
    { name: "Excited", category: "Emotions", image: "./images/Excited.jpg" },
    { name: "Happy", category: "Emotions", image: "./images/happy.jpg" },
    { name: "Mad", category: "Emotions", image: "./images/mad.jpg" },
    { name: "Proud", category: "Emotions", image: "./images/proud.jpg" },
    { name: "Sad", category: "Emotions", image: "./images/sad.jpg" },
    { name: "Surprised", category: "Emotions", image: "./images/surprised.gif" },

    { name: "Calmdown", category: "Actions", image: "./images/calmdown.jpg" },
    { name: "Crying", category: "Actions", image: "./images/crying.jpg" },
    { name: "Drinking", category: "Actions", image: "./images/drinking.jpg" },
    { name: "Eat", category: "Actions", image: "./images/eat.jpg" },
    { name: "Fistbump", category: "Actions", image: "./images/fistbump.jpg" },
    { name: "Goodjob", category: "Actions", image: "./images/goodjob.jpg" },
    { name: "Highfive", category: "Actions", image: "./images/highfive.jpg" },
    { name: "Listen", category: "Actions", image: "./images/listen.jpg" },
    { name: "Put on helmet", category: "Actions", image: "./images/putonhelmet.jpg" },
    { name: "Quiet", category: "Actions", image: "./images/quiet.jpg" },
    { name: "Sit", category: "Actions", image: "./images/sit.jpg" },
    { name: "Wait", category: "Actions", image: "./images/wait.jpg" },

    { name: "Yes", category: "General Communication", image: "./images/yes.png" },
    { name: "No", category: "General Communication", image: "./images/no.png" },
    { name: "Goodjob", category: "General Communication", image: "./images/goodjob.jpg" },
    { name: "Hello", category: "General Communication", image: "./images/hello.jpg" },
    { name: "I don't know", category: "General Communication", image: "./images/idon'tknow.jpg" },
    { name: "I need help", category: "General Communication", image: "./images/ineedhelp.jpg" },
    { name: "I want", category: "General Communication", image: "./images/iwant.jpg" },
    { name: "This one", category: "General Communication", image: "./images/thisone.jpg" },
    { name: "Wait", category: "General Communication", image: "./images/wait.jpg" },
];

// Color mapping for neurodivergent focus (Fitzgerald Key inspired)
const colors = {
    "Objects": "border-orange-400 bg-orange-50",
    "Emotions": "border-blue-400 bg-blue-50",
    "Actions": "border-green-400 bg-green-50",
    "General Communication": "border-yellow-400 bg-yellow-50",
    "Animals": "border-purple-400 bg-purple-50"
};

const grid = document.getElementById("imageGrid");
const categorySelect = document.getElementById("Categories");
const sentenceStrip = document.getElementById("sentenceStrip");
const clearBtn = document.getElementById("clearBtn");
const playBtn = document.getElementById("playBtn");
const customTextInput = document.getElementById("customText");
const addTextBtn = document.getElementById("addTextBtn");

let sentenceWords = [];

// RENDER IMAGES
function renderImages(category) {
    grid.innerHTML = "";
    const filtered = pecsData.filter(item => item.category === category);

    filtered.forEach(item => {
        const colorClass = colors[item.category] || "border-slate-300 bg-white";
        
        const card = document.createElement("button");
        card.className = `flex flex-col items-center p-2 border-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 ${colorClass}`;
        
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-full h-24 object-contain rounded-lg">
            <span class="mt-2 font-bold text-slate-800 uppercase text-xs tracking-wide">${item.name}</span>
        `;
        
        card.onclick = () => addToSentence(item);
        grid.appendChild(card);
    });
}

// ADD TO STRIP
function addToSentence(item) {
    const wordId = Date.now(); // Unique ID for specific removal
    sentenceWords.push({ id: wordId, name: item.name });

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0 animate-in fade-in zoom-in duration-200";
    
    wrapper.innerHTML = `
        <div class="w-20 h-20 bg-white border-2 border-blue-500 rounded-lg p-1 flex flex-col items-center justify-center cursor-pointer shadow-sm overflow-hidden">
            <img src="${item.image}" class="h-12 w-12 object-contain">
            <span class="text-[10px] font-bold uppercase text-center leading-none mt-1">${item.name}</span>
            <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">✕</div>
        </div>
    `;

    wrapper.onclick = () => removeFromSentence(wordId, wrapper);
    sentenceStrip.appendChild(wrapper);
}

// CUSTOM TEXT
function addCustomText(text) {
    if (!text.trim()) return;
    const wordId = Date.now();
    sentenceWords.push({ id: wordId, name: text });

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex-shrink-0";
    wrapper.innerHTML = `
        <div class="h-20 px-4 bg-blue-600 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-md font-bold">
            ${text}
            <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✕</div>
        </div>
    `;

    wrapper.onclick = () => removeFromSentence(wordId, wrapper);
    sentenceStrip.appendChild(wrapper);
}

function removeFromSentence(id, element) {
    element.remove();
    sentenceWords = sentenceWords.filter(w => w.id !== id);
}

// UTILITIES
categorySelect.addEventListener("change", () => renderImages(categorySelect.value));
clearBtn.addEventListener("click", () => {
    sentenceStrip.innerHTML = "";
    sentenceWords = [];
    speechSynthesis.cancel();
});

playBtn.addEventListener("click", () => {
    if (sentenceWords.length === 0) return;
    const utterance = new SpeechSynthesisUtterance(sentenceWords.map(w => w.name).join(" "));
    utterance.rate = 0.8; 
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
});

addTextBtn.addEventListener("click", () => {
    addCustomText(customTextInput.value);
    customTextInput.value = "";
});

// Init
renderImages("Objects");