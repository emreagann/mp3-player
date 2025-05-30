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
   title.innerText = music.getMusicName();
   artist.innerText = music.artist;
   audio.src = "mp3/" + music.file;
}

play.addEventListener("click", () => {
    const isMusicPlay = container.classList.contains("playing");
    isMusicPlay ? pauseMusic() : playMusic();
});

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
};

const nextMusic = () => {
    player.next();
    let music = player.getMusic();
    displayMusic(music);
    playMusic();
    isPlayingNow();
};

const playMusic = () => {
    container.classList.add("playing");
    play.querySelector("i").classList = "fa-solid fa-pause";
    audio.play();
};

const pauseMusic = () => {
    container.classList.remove("playing");
    play.querySelector("i").classList = "fa-solid fa-play";
    audio.pause();
};

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = calculateTime(audio.duration);
    progressBar.max = Math.floor(audio.duration);
});

const calculateTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const second = Math.floor(seconds % 60);
    const updatedSeconds = second < 10 ? `0${second}`: `${second}`;
    return `${minutes}:${updatedSeconds}`;
};

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
    if (muteState === "unmuted") {
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
    if (value == 0) {
        audio.muted = true;
        muteState = "muted";
        volume.classList = "fa-solid fa-volume-xmark";
    } else {
        audio.muted = false;
        muteState = "unmuted";
        volume.classList = "fa-solid fa-volume-high";
    }
});

const displayMusicList = (musicList) => {
    ul.innerHTML = "";
    musicList.forEach((music, i) => {
        let li = `
          <li data-id='${i}' li-index="${i}" onclick="selectedMusic(this)" draggable="true"
              class="list-group-item d-flex justify-content-between align-items-center">
              <span>${music.getName()}</span>
              <span id="music-${i}" class="badge bg-primary rounded-pill">3:17</span>
              <audio class="music-${i}" src="mp3/${music.file}"></audio>
          </li>`;
        ul.insertAdjacentHTML("beforeend", li);

        const liAudioDuration = ul.querySelector(`#music-${i}`);
        const liAudio = ul.querySelector(`.music-${i}`);
        liAudio.addEventListener("loadedmetadata", () => {
            liAudioDuration.innerText = calculateTime(liAudio.duration);
        });
    });
    addDragEvents();
};

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = e.currentTarget;
    draggedItem.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const target = e.currentTarget;
    const bounding = target.getBoundingClientRect();
    const offset = e.clientY - bounding.top;
    const midpoint = bounding.height / 2;

    if (offset > midpoint) {
        target.style['border-bottom'] = '2px solid #aaa';
        target.style['border-top'] = '';
    } else {
        target.style['border-top'] = '2px solid #aaa';
        target.style['border-bottom'] = '';
    }
}

function handleDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.style['border-top'] = '';
    target.style['border-bottom'] = '';

    if (draggedItem && draggedItem !== target) {
        const bounding = target.getBoundingClientRect();
        const offset = e.clientY - bounding.top;
        const midpoint = bounding.height / 2;

        if (offset > midpoint) {
            target.after(draggedItem); 
        } else {
            target.before(draggedItem); 
        }
    }

    draggedItem.classList.remove('dragging');
    updateMusicListFromDOM(player);
    updateLiIndexes(); 
    addDragEvents();  
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    ul.querySelectorAll("li").forEach(item => {
        item.style['border-top'] = '';
        item.style['border-bottom'] = '';
    });
}

function addDragEvents() {
    const items = ul.querySelectorAll("li");
    items.forEach(item => {
        item.removeEventListener("dragstart", handleDragStart);
        item.removeEventListener("dragover", handleDragOver);
        item.removeEventListener("drop", handleDrop);
        item.removeEventListener("dragend", handleDragEnd);

        item.addEventListener("dragstart", handleDragStart);
        item.addEventListener("dragover", handleDragOver);
        item.addEventListener("drop", handleDrop);
        item.addEventListener("dragend", handleDragEnd);
    });
}

function updateLiIndexes() {
    const liElements = ul.querySelectorAll("li");
    liElements.forEach((li, i) => {
        li.setAttribute("li-index", i);
        li.setAttribute("data-id", i); // opsiyonel güncelleme
        const durationSpan = li.querySelector("span.badge");
        if (durationSpan) durationSpan.id = `music-${i}`;
        const audio = li.querySelector("audio");
        if (audio) audio.className = `music-${i}`;
    });
}

function updateMusicListFromDOM(player) {
    const liElements = ul.querySelectorAll("li");
    const newList = [];

    liElements.forEach(li => {
        const id = parseInt(li.getAttribute("data-id"));
        newList.push(player.musicList[id]);
    });

    player.musicList = newList;
}

const selectedMusic = (li) => {
    const index = li.getAttribute("li-index");
    player.currentIndex = index;
    displayMusic(player.getMusic());
    playMusic();
    isPlayingNow();
};

const isPlayingNow = () => {
    for (let li of ul.querySelectorAll("li")) {
        li.classList.remove("playing");
        if (li.getAttribute("li-index") == player.currentIndex) {
            li.classList.add("playing");
        }
    }
};

audio.addEventListener("ended", () => {
    nextMusic();
});
