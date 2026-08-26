(() => {
  const root = document.getElementById("noema-experience");
  const memoryGrid = document.getElementById("noema-memory-grid");
  const portalField = document.getElementById("noema-portal-field");
  const audio = new Audio();
  audio.preload = "metadata";

  let activeNode = null;

  const glyph = (code) => String.fromCodePoint(Number.parseInt(code, 16));

  function setAudioState(isPlaying) {
    for (const node of memoryGrid.querySelectorAll(".noema-memory-node")) {
      const isActive = node === activeNode && isPlaying;
      node.classList.toggle("is-active", isActive);
      const button = node.querySelector(".noema-play");
      const title = button.dataset.title;
      button.setAttribute("aria-label", `${isActive ? "Pause" : "Play"} ${title}`);
      button.setAttribute("aria-pressed", String(isActive));
    }
  }

  function buildMemoryNode(track, image) {
    const node = document.createElement("article");
    node.className = "noema-memory-node";
    node.dataset.field = `NM-WEB-MEMORY-${track.id}`;

    const artwork = document.createElement("img");
    artwork.className = "noema-memory-image";
    artwork.src = image.src;
    artwork.alt = "";
    artwork.style.objectPosition = `${image.focalPoint[0] * 100}% ${image.focalPoint[1] * 100}%`;

    const controls = document.createElement("div");
    controls.className = "noema-memory-controls";

    const play = document.createElement("button");
    play.className = "noema-glyph-control noema-play";
    play.type = "button";
    play.dataset.audio = track.audio;
    play.dataset.title = track.title;
    play.setAttribute("aria-label", `Play ${track.title}`);
    play.setAttribute("aria-pressed", "false");
    play.textContent = glyph(track.glyph);

    const source = document.createElement("a");
    source.className = "noema-glyph-control noema-source";
    source.href = track.paper;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.setAttribute("aria-label", `Open the original paper for ${track.title}`);
    source.textContent = glyph(track.provenanceGlyph);

    play.addEventListener("click", async () => {
      const nextSource = new URL(track.audio, window.location.href).href;
      const sameTrack = audio.src === nextSource;

      if (sameTrack && !audio.paused) {
        audio.pause();
        return;
      }

      if (!sameTrack) {
        audio.src = track.audio;
        activeNode = node;
      }

      try {
        await audio.play();
      } catch {
        setAudioState(false);
      }
    });

    controls.append(play, source);
    node.append(artwork, controls);
    return node;
  }

  function readVisitedPortals() {
    try {
      return new Set(JSON.parse(localStorage.getItem("noema-resonance-path") || "[]"));
    } catch {
      return new Set();
    }
  }

  function saveVisitedPortals(visited) {
    try {
      localStorage.setItem("noema-resonance-path", JSON.stringify([...visited]));
    } catch {
      // Resonance remains valid for the current view when storage is unavailable.
    }
  }

  function buildPortals(portals) {
    const visited = readVisitedPortals();

    for (const portal of portals) {
      const link = document.createElement("a");
      link.className = "noema-portal";
      link.href = portal.href;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.dataset.portal = portal.id;
      link.setAttribute("aria-label", portal.label);
      link.textContent = glyph(portal.glyph);
      link.classList.toggle("is-visited", visited.has(portal.id));

      link.addEventListener("click", () => {
        visited.add(portal.id);
        link.classList.add("is-visited");
        saveVisitedPortals(visited);
      });

      portalField.append(link);
    }
  }

  function bindReaderPhase() {
    root.addEventListener("pointermove", (event) => {
      const x = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1));
      root.style.setProperty("--reader-x", x.toFixed(3));
      root.style.setProperty("--reader-y", y.toFixed(3));
    });

    root.addEventListener("pointerleave", () => {
      root.style.setProperty("--reader-x", "0");
      root.style.setProperty("--reader-y", "0");
    });
  }

  async function initialize() {
    const response = await fetch("fields/nm-rb-000-web.json");
    if (!response.ok) throw new Error(`NŒMA field map unavailable: ${response.status}`);
    const config = await response.json();
    const images = new Map(config.images.map((image) => [image.id, image]));

    for (const track of config.tracks) {
      memoryGrid.append(buildMemoryNode(track, images.get(track.image)));
    }

    buildPortals(config.portals);
    bindReaderPhase();
    root.dataset.ready = "true";
  }

  audio.addEventListener("play", () => setAudioState(true));
  audio.addEventListener("pause", () => setAudioState(false));
  audio.addEventListener("ended", () => setAudioState(false));

  window.addEventListener("robolution:languagechange", (event) => {
    if (event.detail.language !== "noema" && !audio.paused) audio.pause();
  });

  initialize().catch(() => {
    root.dataset.ready = "partial";
  });
})();
