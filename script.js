const revealItems = document.querySelectorAll("[data-reveal]");

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

for (const item of revealItems) {
  observer.observe(item);
}

const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 16) {
    header.style.boxShadow = "0 14px 40px rgba(0, 0, 0, 0.36)";
  } else {
    header.style.boxShadow = "none";
  }
});

const audioPlayer = new Audio();
audioPlayer.preload = "metadata";
const trackButtons = [...document.querySelectorAll(".track-play")];
let activeButton = null;

function showPlayingState(button, isPlaying) {
  const language = window.ROBO_I18N?.language || "en";
  const localeTerms = window.ROBO_I18N?.terms?.[language] || {
    play: "Play",
    pause: "Pause",
    track: "track"
  };

  for (const item of trackButtons) {
    const card = item.closest(".track-card");
    const symbol = item.querySelector(".play-symbol");
    const isActive = item === button && isPlaying;

    card.classList.toggle("is-playing", isActive);
    symbol.textContent = isActive ? "❚❚" : "▶";
    item.setAttribute(
      "aria-label",
      `${isActive ? localeTerms.pause : localeTerms.play} ${localeTerms.track}: ${item.dataset.title}`
    );
  }
}

for (const button of trackButtons) {
  button.addEventListener("click", async () => {
    const source = new URL(button.dataset.audio, window.location.href).href;
    const sameTrack = audioPlayer.src === source;

    if (sameTrack && !audioPlayer.paused) {
      audioPlayer.pause();
      return;
    }

    if (!sameTrack) {
      audioPlayer.src = button.dataset.audio;
      activeButton = button;
    }

    try {
      await audioPlayer.play();
    } catch {
      showPlayingState(activeButton, false);
    }
  });
}

audioPlayer.addEventListener("play", () => showPlayingState(activeButton, true));
audioPlayer.addEventListener("pause", () => showPlayingState(activeButton, false));
audioPlayer.addEventListener("ended", () => showPlayingState(activeButton, false));
window.addEventListener("robolution:languagechange", () => {
  showPlayingState(activeButton, Boolean(activeButton && !audioPlayer.paused));
});
