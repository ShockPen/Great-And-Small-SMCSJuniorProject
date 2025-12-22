const buttons = document.getElementsByClassName("button");

for (let button of buttons) {
    button.addEventListener("click", handleSoundButton)
}

function handleSoundButton(e) {
    const imageUrl = e.target.src;
    console.log(e);
    if (!imageUrl) return;

    const filename = imageUrl.split('/').pop().replace(/\.[^.]+$/, '');
    const audioPath = `./audio/${filename}.mp3`;

    const audio = new Audio(audioPath);
    audio.play().catch(err => console.log('Audio playback failed:', err));
}
