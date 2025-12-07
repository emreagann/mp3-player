const container = document.querySelector(".container");
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
const shuffleBtn = document.querySelector("#shuffle");
const repeatBtn = document.querySelector("#repeat");
const searchInput = document.querySelector("#search-input");


const API_KEY = config.API_KEY;

let player;
let currentVideoId = "";
let isShuffle = false;
let repeatMode = 0;
let musicList = [];
let currentIndex = 0;
let updateTimer;

window.onYouTubeIframeAPIReady = function () {
    console.log("YouTube API Ready callback fired.");
    player = new YT.Player('player', {
        height: '1',
        width: '1',
        videoId: '',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerError(event) {
    let errorMsg = "Bir hata oluştu.";

    if (event.data === 101 || event.data === 150) {
        if (confirm("This video is not embeddable. Open it on YouTube?")) {
            const videoUrl = `https://www.youtube.com/watch?v=${player.getVideoData().video_id}`;
            window.open(videoUrl, '_blank');
        }
        console.warn("Video embed restricted. Skipping to next...");
        nextMusic(true);
        return;
    }

    switch (event.data) {
        case 2: errorMsg = "Invalid Video Parameter."; break;
        case 5: errorMsg = "HTML5 Player Error."; break;
        case 100: errorMsg = "Video Not Found or Private/Deleted."; break;
    }
    console.error("YouTube Error:", event.data);
    console.warn("Error: " + errorMsg + " Skipping to next...");
    nextMusic(true);
}

function onPlayerReady(event) {
    console.log("Player Ready");
    updateVolumeUI(player.getVolume());

    if (currentVideoId) {
        player.loadVideoById(currentVideoId);
        playMusic();
        currentVideoId = "";
    }
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        container.classList.add("playing");
        play.querySelector("i").className = "fa-solid fa-pause";
        startTimer();
    } else {
        container.classList.remove("playing");
        play.querySelector("i").className = "fa-solid fa-play";
        clearInterval(updateTimer);
    }

    if (event.data == YT.PlayerState.ENDED) {
        if (repeatMode === 2) {
            player.playVideo();
        } else {
            nextMusic(true);
        }
    }
}

function playMusic() {
    if (player && typeof player.playVideo === 'function') player.playVideo();
}

function pauseMusic() {
    if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
}

play.addEventListener("click", () => {
    if (!player || typeof player.getPlayerState !== 'function') {
        console.warn("Play clicked but player not ready.", player);
        alert("Player is not ready. Please wait a few seconds and try again.\n(Check your internet connection)");
        return;
    }

    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
        pauseMusic();
    } else {
        playMusic();
    }
});

prev.addEventListener("click", () => {
    prevMusic();
});

next.addEventListener("click", () => {
    nextMusic();
});

function prevMusic() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = musicList.length - 1;
    }
    loadVideoByIndex(currentIndex);
}

function nextMusic(auto = false) {
    if (repeatMode === 2 && !auto) {
    } else if (repeatMode === 0 && auto && currentIndex === musicList.length - 1) {
        return;
    }

    if (isShuffle) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * musicList.length);
        } while (randomIndex === currentIndex && musicList.length > 1);
        currentIndex = randomIndex;
    } else {
        if (currentIndex < musicList.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
    }
    loadVideoByIndex(currentIndex);
}

function loadVideoByIndex(index) {
    if (musicList.length === 0) return;
    currentIndex = index;
    const video = musicList[index];

    title.innerText = video.title;
    artist.innerText = video.channelTitle;

    const items = ul.querySelectorAll("li");
    items.forEach(li => li.classList.remove("playing", "li-playing"));
    if (items[index]) {
        items[index].classList.add("playing", "li-playing");
    }

    if (player && typeof player.loadVideoById === "function") {
        player.loadVideoById(video.id);
        playMusic();
    } else {
        console.warn("YouTube Player is not ready. Waiting...");
        currentVideoId = video.id;
    }
}

let searchTimer;
searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    const query = e.target.value;
    if (query.length > 2) {
        searchTimer = setTimeout(() => {
            searchYouTube(query);
        }, 800);
    }
});

async function searchYouTube(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&key=${API_KEY}`;
    console.log("Searching URL:", url);

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            console.error("API Error:", data.error);
            alert("YouTube API Error: " + data.error.message);
            return;
        }

        musicList = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            img: item.snippet.thumbnails.default.url
        }));

        displayMusicList();

    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Fetch Error: " + err.message + "\n\n(If 'Failed to fetch' is shown, it may be due to 'CORS' being blocked when you double-click and open the file.)");
    }
}

function displayMusicList() {
    ul.innerHTML = "";
    musicList.forEach((video, i) => {
        let li = `
            <li li-index="${i}" onclick="selectMusic(this)" class="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
                <div class="d-flex align-items-center">
                    <img src="${video.img}" style="width:40px; margin-right:10px;">
                    <div style="overflow:hidden;">
                        <span style="font-size:0.9rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${video.title}</span>
                        <small class="text-muted">${video.channelTitle}</small>
                    </div>
                </div>
            </li>
        `;
        ul.insertAdjacentHTML("beforeend", li);
    });
}

function selectMusic(elem) {
    const index = parseInt(elem.getAttribute("li-index"));
    loadVideoByIndex(index);
}

function startTimer() {
    clearInterval(updateTimer);
    updateTimer = setInterval(() => {
        if (player && player.getCurrentTime) {
            const current = player.getCurrentTime();
            const dur = player.getDuration();

            progressBar.value = (current / dur) * 100 || 0;
            currentTime.innerText = formatTime(current);
            duration.innerText = formatTime(dur);
        }
    }, 1000);
}

progressBar.addEventListener("input", (e) => {
    const val = e.target.value;
    const dur = player.getDuration();
    const newTime = (val / 100) * dur;
    player.seekTo(newTime, true);
});

function formatTime(s) {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

volumeBar.addEventListener("input", (e) => {
    const val = e.target.value;
    if (player) player.setVolume(val);
    updateVolumeUI(val);
});

function updateVolumeUI(val) {
    if (val == 0) {
        volume.className = "fa-solid fa-volume-xmark";
    } else {
        volume.className = "fa-solid fa-volume-high";
    }
}

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active-btn");
});

repeatBtn.addEventListener("click", () => {
    repeatMode++;
    if (repeatMode > 2) repeatMode = 0;

    repeatBtn.classList.remove("active-btn");
    const icon = repeatBtn.querySelector("i");
    icon.className = "fa-solid fa-arrow-rotate-right";

    if (repeatMode === 1) {
        repeatBtn.classList.add("active-btn");
        repeatBtn.title = "All";
    } else if (repeatMode === 2) {
        repeatBtn.classList.add("active-btn");
        icon.className = "fa-solid fa-1";
        repeatBtn.title = "One";
    } else {
        repeatBtn.title = "Off";
    }
});

if (!searchInput) {
    console.error("Search input not found!");
}

if (window.YT && window.YT.Player && window.YT.loaded) {
    console.log("YouTube API already loaded. Manually initializing...");
    window.onYouTubeIframeAPIReady();
}
