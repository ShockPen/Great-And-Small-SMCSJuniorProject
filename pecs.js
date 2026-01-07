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

const grid = document.getElementById("imageGrid");
const categorySelect = document.getElementById("Categories");
const sentenceStrip = document.getElementById("sentenceStrip");
const clearBtn = document.getElementById("clearBtn");
const playBtn = document.getElementById("playBtn");
const customTextInput = document.getElementById("customText");
const addTextBtn = document.getElementById("addTextBtn");

let sentenceWords = [];

categorySelect.addEventListener("change", () => {
    renderImages(categorySelect.value);
});

clearBtn.addEventListener("click", () => {
    sentenceStrip.innerHTML = "";
    sentenceWords = [];
    speechSynthesis.cancel();
});

playBtn.addEventListener("click", () => {
    if (sentenceWords.length === 0) return;

    const utterance = new SpeechSynthesisUtterance(
        sentenceWords.join(" ")
    );

    utterance.rate = 0.9;
    utterance.pitch = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
});

addTextBtn.addEventListener("click", () => {
    addCustomText(customTextInput.value);
    customTextInput.value = "";
});


renderImages(categorySelect.value);

//-------------------------------------------------
function renderImages(category) {
    grid.innerHTML = "";

    const filtered = pecsData.filter(item => item.category === category);

    filtered.forEach(item => {
        const button = document.createElement("button");
        button.className = "button";

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.className =
            "justify-center bg-[rgb(53,53,240)] text-black rounded-[30px] w-[200px] h-[150px]";

        button.appendChild(img);
        button.onclick = () => addToSentence(item);

        grid.appendChild(button);
    });
}

function addToSentence(item) {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.className =
        "bg-[rgb(53,53,240)] rounded-[20px] w-[80px] h-[60px]";

    sentenceStrip.appendChild(img);
    sentenceWords.push(item.name);
}

function addCustomText(text) {
    if (!text.trim()) return;

    const span = document.createElement("span");
    span.textContent = text;
    span.className =
        "bg-[rgb(53,53,240)] text-white px-3 py-2 rounded-[20px] text-sm flex items-center";

    sentenceStrip.appendChild(span);
    sentenceWords.push(text);
}
