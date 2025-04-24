const container = document.querySelector(".container");
const image = document.querySelector("#music-image");
const title = document.querySelector("#music-details .title");
const artist = document.querySelector("#music-details .artist");
const prev = document.querySelector("#controls #prev");
const next = document.querySelector("#controls #next");
const play = document.querySelector("#controls #play");
const duration = document.querySelector("#duration");
const currentTime = document.querySelector("#current-time");
const progressBar = document.querySelector("#progress-bar");
const volume = document.querySelector("#volume");
const volumeBar = document.querySelector("#volume-bar");
const ul = document.querySelector("ul");
const player = new MusicPlayer(musicList);
window.addEventListener("load", () => {
   let music = player.getMusic();
   displayMusic(music);
   displayMusicList(player.musicList);
   isPlayingNow();
});
function displayMusic(music) {
   image.src = "img/" + music.img;
   title.innerText = music.getName();
   artist.innerText = music.artist;
   audio.src = "mp3/" + music.file;
}
play.addEventListener("click", () => {
    const isMusicPlay = container.classList.contains("playing");
    isMusicPlay ? pauseMusic() : playMusic();
})
prev.addEventListener("click", () => {
    prevMusic();
});
next.addEventListener("click", () => {
    nextMusic();
});
const prevMusic = () => {
    player.prev();
    let music = player.getMusic();
    displayMusic(music);
    playMusic();
    isPlayingNow();
}
const nextMusic = () => {
    player.next();
    let music = player.getMusic();
    displayMusic(music);
    playMusic();
    isPlayingNow();
}
const playMusic = () => {
    container.classList.add("playing");
    play.querySelector("i").classList = "fa-solid fa-pause";
    audio.play();
}
const pauseMusic = () => {
    container.classList.remove("playing");
    play.querySelector("i").classList = "fa-solid fa-play";
    audio.pause();
}
audio.addEventListener("loadedmetadata", () => {
    duration.textContent = calculateTime(audio.duration);
    progressBar.max = Math.floor(audio.duration);
});
const calculateTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const second = Math.floor(seconds % 60);
    const updatedSeconds = second < 10 ? `0${second}`: `${second}`;
    return `${minutes}:${updatedSeconds}`;
}
audio.addEventListener("timeupdate", () => {
 progressBar.value = Math.floor(audio.currentTime);
    currentTime.textContent = calculateTime(progressBar.value);
    if (audio.currentTime === audio.duration) {
        nextMusic();
    }
});
progressBar.addEventListener("input", () => {
    audio.currentTime = progressBar.value;
    currentTime.textContent = calculateTime(progressBar.value);
});
let muteState = "unmuted";
volume.addEventListener("click", () => {
    if(muteState === "unmuted") {
        audio.muted = true;
        muteState = "muted";
        volume.classList = "fa-solid fa-volume-xmark";
        volumeBar.value = 0;
    } else {
        audio.muted = false;
        muteState = "unmuted";
        volume.classList = "fa-solid fa-volume-high";
        volumeBar.value = 100;
    }
});
volumeBar.addEventListener("input", (e) => {
    const value = e.target.value;
    audio.volume = value / 100;
    if(value == 0) {
        audio.muted = true;
        muteState = "muted";
        volume.classList = "fa-solid fa-volume-xmark";
    }
    else {
        audio.muted = false;
        muteState = "unmuted";
        volume.classList = "fa-solid fa-volume-high";
    }
});
progressBar.addEventListener("input", () => {
    audio.currentTime = progressBar.value;
    currentTime.textContent = calculateTime(progressBar.value);
});
const displayMusicList = (musicList) => {
  for(let i = 0; i < musicList.length; i++){
    let li = `   <li li-index='${i}' onclick="selectedMusic(this)" class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${musicList[i].getName()}</span>
                    <span id="music-${i}" class="badge bg-primary rounded-pill">3:17</span>
                    <audio class="music-${i}" src="mp3/${musicList[i].file}"></audio>
                </li>`;
                ul.insertAdjacentHTML("beforeend", li);
                let liAudioDuration = ul.querySelector(`#music-${i}`);
                let liAudio = ul.querySelector(`.music-${i}`);
                liAudio.addEventListener("loadedmetadata", () => {
                    liAudioDuration.innerText = calculateTime(liAudio.duration);
                });

  }
}
const selectedMusic = (li) => {
   const index = li.getAttribute("li-index");
   player.currentIndex = index;
    displayMusic(player.getMusic());
    playMusic();
    isPlayingNow();
}
const isPlayingNow = () => {
for(let li of ul.querySelectorAll("li")){
    if(li.classList.contains("playing")) {
        li.classList.remove("playing");
    }
    if(li.getAttribute("li-index") == player.currentIndex) {
    li.classList.add("playing");
    }
}
}
audio.addEventListener("ended", () => {
    nextMusic();
});