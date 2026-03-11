const tracks = Array.from(document.querySelectorAll(".track"));
const audio = document.getElementById("audio");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerToggle = document.getElementById("player-toggle");
const playerTime = document.getElementById("player-time");
const playerRange = document.getElementById("player-range");
const playerVolume = document.getElementById("player-volume");

const shareHero = document.getElementById("share-hero");
const player = document.getElementById("player");
const socialSection = document.querySelector(".release-grid");

let activeTrack = null;
let loopAll = true;

const formatTime = (time) => {
  if (!Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const setActiveTrack = (track) => {
  tracks.forEach((item) => item.classList.remove("is-active"));
  if (track) {
    track.classList.add("is-active");
  }
};

const updateButtons = (isPlaying) => {
  playerToggle.textContent = isPlaying ? "❚❚" : "▶";
  tracks.forEach((item) => {
    const btn = item.querySelector(".track__play");
    btn.textContent = "▶";
  });
  if (activeTrack) {
    const btn = activeTrack.querySelector(".track__play");
    btn.textContent = isPlaying ? "❚❚" : "▶";
  }
};

const loadTrack = (track) => {
  const src = track.dataset.track;
  if (audio.src !== src) {
    audio.src = src;
  }
  playerTitle.textContent = track.dataset.title;
  playerArtist.textContent = track.dataset.artist;
  activeTrack = track;
  setActiveTrack(track);
  playerRange.value = 0;
  playerRange.style.background = "linear-gradient(90deg, var(--accent) 0%, #d8d8d8 0%)";
};

const setVolumeUI = (value) => {
  playerVolume.value = value;
  playerVolume.style.background = `linear-gradient(90deg, var(--accent) ${value}%, #d8d8d8 ${value}%)`;
};

audio.volume = Number(playerVolume.value) / 100;
setVolumeUI(playerVolume.value);

tracks.forEach((track) => {
  const button = track.querySelector(".track__play");
  button.addEventListener("click", () => {
    if (activeTrack === track && !audio.paused) {
      audio.pause();
      updateButtons(false);
      return;
    }

    loadTrack(track);
    audio.play();
    updateButtons(true);
  });
});

playerToggle.addEventListener("click", () => {
  if (!activeTrack) {
    if (tracks.length === 0) return;
    loadTrack(tracks[0]);
    audio.play();
    updateButtons(true);
    return;
  }
  if (audio.paused) {
    audio.play();
    updateButtons(true);
  } else {
    audio.pause();
    updateButtons(false);
  }
});

audio.addEventListener("ended", () => {
  if (!activeTrack) {
    updateButtons(false);
    return;
  }
  const currentIndex = tracks.indexOf(activeTrack);
  const nextTrack = tracks[currentIndex + 1];
  if (!nextTrack) {
    if (loopAll && tracks.length > 0) {
      loadTrack(tracks[0]);
      audio.play();
      updateButtons(true);
      return;
    }
    updateButtons(false);
    return;
  }
  loadTrack(nextTrack);
  audio.play();
  updateButtons(true);
});

audio.addEventListener("timeupdate", () => {
  playerTime.textContent = formatTime(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    const progress = (audio.currentTime / audio.duration) * 100;
    playerRange.value = progress;
    playerRange.style.background = `linear-gradient(90deg, var(--accent) ${progress}%, #d8d8d8 ${progress}%)`;
  }
});

playerRange.addEventListener("input", (event) => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const percent = Number(event.target.value);
  audio.currentTime = (percent / 100) * audio.duration;
});

playerVolume.addEventListener("input", (event) => {
  const value = Number(event.target.value);
  audio.volume = value / 100;
  setVolumeUI(value);
});


shareHero.addEventListener("click", async () => {
  await navigator.clipboard.writeText(window.location.href);
  shareHero.textContent = "Link copied";
  setTimeout(() => {
    shareHero.innerHTML =
      '<span class="hero-btn__icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" role="img" aria-hidden="true">' +
      '<circle cx="7" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" />' +
      '<circle cx="17" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="2" />' +
      '<circle cx="17" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="2" />' +
      '<path d="M9.8 10.7l4.3-2.4M9.8 13.3l4.3 2.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />' +
      "</svg></span> Share";
  }, 1500);
});

const adjustPlayerOffset = () => {
  if (!player || !socialSection) return;
  const playerRect = player.getBoundingClientRect();
  const socialRect = socialSection.getBoundingClientRect();
  const gap = playerRect.top - socialRect.bottom;
  const needed = gap < 16 ? Math.ceil(16 - gap) : 0;
  document.documentElement.style.setProperty("--player-offset", `${needed}px`);
};

let offsetScheduled = false;
const scheduleOffset = () => {
  if (offsetScheduled) return;
  offsetScheduled = true;
  requestAnimationFrame(() => {
    offsetScheduled = false;
    adjustPlayerOffset();
  });
};

window.addEventListener("load", scheduleOffset);
window.addEventListener("resize", scheduleOffset);

if ("ResizeObserver" in window) {
  const ro = new ResizeObserver(scheduleOffset);
  if (player) ro.observe(player);
  if (socialSection) ro.observe(socialSection);
}
