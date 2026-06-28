import { slides } from './courseware-config.js';
import {
  canRevealDialogueResponseVideo,
  isElementWithinActiveSlide,
  shouldDeferHomeAdvanceForFullscreen
} from './courseware-navigation.js';
import { PanoramaViewer } from './vr-panorama.js';

const stage = document.getElementById('courseware');
const viewers = new Map();
let preloadStarted = false;
let activeIndex = 0;
let dialogueResponseSequence = 0;

function iconPath(direction) {
  const points =
    direction === 'prev'
      ? '<path d="M15 5 8 12l7 7" />'
      : '<path d="m9 5 7 7-7 7" />';

  return `<svg viewBox="0 0 24 24" aria-hidden="true">${points}</svg>`;
}

function createNavButton(direction) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `nav-button nav-${direction}`;
  button.dataset.nav = direction;
  button.setAttribute('aria-label', direction === 'prev' ? '上一页' : '下一页');
  button.innerHTML = iconPath(direction);

  return button;
}

const bubbleSvgTemplates = {
  blue: `
    <svg class="bubble-svg" viewBox="0 0 520 250" preserveAspectRatio="none" aria-hidden="true">
      <path class="bubble-shape outer" d="M83 80 C88 48 132 40 165 55 C190 28 244 28 272 55 C306 36 356 45 377 74 C421 69 466 95 470 135 C506 149 499 203 455 207 C430 242 365 238 338 216 C302 234 246 235 214 216 C179 238 113 230 101 198 C54 201 34 155 61 127 C40 108 52 81 83 80 Z" />
      <path class="bubble-shape inner" d="M94 88 C100 61 136 55 164 67 C190 43 238 43 266 67 C300 51 342 58 362 83 C402 78 447 100 451 136 C481 149 474 190 439 195 C415 224 365 222 337 204 C302 221 250 222 220 204 C188 224 128 218 115 190 C74 192 59 157 82 132 C64 113 70 91 94 88 Z" />
    </svg>
    <svg class="decor decor-lines-blue" viewBox="0 0 90 70" aria-hidden="true">
      <path d="M55 12 C42 21 34 31 27 43" />
      <path d="M68 31 C50 36 37 42 23 52" />
      <path d="M37 9 C31 22 26 34 19 47" />
    </svg>
    <svg class="star star-blue" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 9 L62 36 L91 39 L69 58 L76 87 L50 72 L24 87 L31 58 L9 39 L38 36 Z" />
    </svg>`,
  orange: `
    <svg class="bubble-svg" viewBox="0 0 430 230" preserveAspectRatio="none" aria-hidden="true">
      <path class="bubble-shape outer" d="M78 73 C90 36 143 35 168 58 C196 35 247 37 269 62 C304 48 358 63 367 100 C407 112 406 171 365 180 C354 211 304 217 278 198 C245 222 190 215 169 193 C136 208 89 196 80 166 C39 161 31 107 63 93 C54 83 61 73 78 73 Z M363 174 C384 185 394 198 405 215 C382 210 363 207 349 190 Z" />
      <path class="bubble-shape inner" d="M90 80 C101 50 143 49 166 69 C194 50 239 51 262 72 C296 59 340 70 349 104 C383 116 382 160 348 168 C337 194 299 198 277 184 C245 205 196 200 174 181 C144 195 101 186 92 158 C58 154 52 114 78 101 C69 90 75 81 90 80 Z M349 166 C365 176 374 185 383 199 C365 194 352 192 340 180 Z" />
    </svg>
    <svg class="decor decor-rays-orange" viewBox="0 0 85 70" aria-hidden="true">
      <path d="M28 45 L8 58" />
      <path d="M38 32 L28 9" />
      <path d="M52 42 L74 30" />
    </svg>
    <svg class="star star-orange" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 9 L62 36 L91 39 L69 58 L76 87 L50 72 L24 87 L31 58 L9 39 L38 36 Z" />
    </svg>`,
  green: `
    <svg class="bubble-svg" viewBox="0 0 520 220" preserveAspectRatio="none" aria-hidden="true">
      <path class="bubble-shape outer" d="M70 77 C81 43 126 37 155 58 C183 36 232 38 255 61 C290 42 344 49 365 78 C411 68 463 95 464 137 C502 150 498 198 459 203 C428 229 374 222 349 204 C315 222 260 223 230 203 C196 225 140 219 117 194 C79 202 45 178 50 144 C25 130 36 91 70 77 Z M458 194 C479 203 493 212 508 225 C482 223 461 220 444 205 Z" />
      <path class="bubble-shape inner" d="M83 83 C94 56 130 52 156 69 C183 51 226 52 250 72 C282 56 329 61 351 86 C391 77 442 101 443 137 C474 149 471 185 440 190 C413 211 373 208 349 192 C316 208 265 209 236 192 C204 211 150 206 128 184 C96 191 69 174 72 145 C50 132 61 98 83 83 Z M439 188 C454 195 466 202 479 212 C458 210 443 207 431 196 Z" />
    </svg>
    <svg class="decor decor-lines-green" viewBox="0 0 90 75" aria-hidden="true">
      <path d="M48 52 C34 42 24 31 13 16" />
      <path d="M60 43 C52 27 45 16 41 4" />
      <path d="M32 60 C20 58 9 55 0 50" />
    </svg>
    <svg class="star star-green" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 9 L62 36 L91 39 L69 58 L76 87 L50 72 L24 87 L31 58 L9 39 L38 36 Z" />
    </svg>`
};

function createSlideVideo(slide) {
  const video = document.createElement('video');
  video.className = 'slide-media';
  video.src = slide.src;
  video.poster = slide.poster || '';
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('webkit-playsinline', '');

  return video;
}

function createDialogueBubble(bubble, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `bubble bubble-${bubble.variant} is-visible`;
  button.dataset.dialogueBubble = bubble.id;
  button.style.setProperty('--delay', `${index * 0.55}s`);
  button.setAttribute('aria-label', bubble.label);

  if (bubble.responseVideo) {
    button.dataset.dialogueResponse = bubble.responseVideo;
  }

  button.innerHTML = `
    ${bubbleSvgTemplates[bubble.variant] || bubbleSvgTemplates.blue}
    <span class="bubble-content">
      <span class="badge">${index + 1}</span>
      <span class="question">${bubble.label}</span>
    </span>
  `;

  return button;
}

function createDialogueLayer(slide) {
  const layer = document.createElement('div');
  layer.className = 'dialogue-layer';

  (slide.bubbles || []).forEach((bubble, index) => {
    layer.append(createDialogueBubble(bubble, index));
  });

  return layer;
}

function createDialogueResponseVideo(slide) {
  const responseVideo = document.createElement('video');
  const responseSource = slide.bubbles?.find((bubble) => bubble.responseVideo)
    ?.responseVideo;

  responseVideo.className = 'dialogue-response-video';
  responseVideo.dataset.dialogueVideo = '';
  responseVideo.hidden = true;
  responseVideo.preload = 'auto';
  responseVideo.playsInline = true;
  responseVideo.setAttribute('webkit-playsinline', '');

  if (responseSource) {
    responseVideo.src = responseSource;
  }

  responseVideo.addEventListener('ended', () => {
    responseVideo.hidden = true;
    responseVideo.currentTime = 0;
  });

  return responseVideo;
}

function renderSlide(slide, index) {
  const section = document.createElement('section');
  section.className = 'slide';
  section.dataset.slide = slide.id;
  section.dataset.index = String(index);

  if (slide.type === 'video') {
    section.append(createSlideVideo(slide));
  }

  if (slide.type === 'image') {
    const image = document.createElement('img');
    image.className = 'slide-media';
    image.src = slide.src;
    image.alt = '';
    image.draggable = false;
    section.append(image);
  }

  if (slide.type === 'vr') {
    const layer = document.createElement('div');
    layer.className = 'vr-layer';
    layer.dataset.vrLayer = '';
    const status = document.createElement('div');
    status.className = 'vr-status';
    status.dataset.vrStatus = '';
    status.textContent = '正在载入全景';
    status.hidden = true;
    layer.append(status);
    section.append(layer);
  }

  if (slide.type === 'dialogue') {
    section.append(
      createSlideVideo(slide),
      createDialogueLayer(slide),
      createDialogueResponseVideo(slide)
    );
  }

  if (slide.advanceOnClick) {
    const hotspot = document.createElement('button');
    hotspot.type = 'button';
    hotspot.className = 'slide-hotspot';
    hotspot.dataset.nav = 'next';
    hotspot.setAttribute('aria-label', '进入下一页');
    section.append(hotspot);
  }

  if (slide.type === 'vr' || slide.nav) {
    section.append(createNavButton('prev'));
    section.append(createNavButton('next'));
  }

  return section;
}

function getActiveFullscreenElement() {
  return (
    document.fullscreenElement ??
    document.webkitFullscreenElement ??
    document.msFullscreenElement ??
    null
  );
}

function getStageRequestFullscreen() {
  return (
    stage.requestFullscreen ??
    stage.webkitRequestFullscreen ??
    stage.msRequestFullscreen ??
    null
  );
}

function canRequestStageFullscreen() {
  return Boolean(getStageRequestFullscreen());
}

function requestImmersiveFullscreen() {
  if (getActiveFullscreenElement()) {
    return;
  }

  const requestFullscreen = getStageRequestFullscreen();

  if (!requestFullscreen) {
    return;
  }

  void Promise.resolve(
    requestFullscreen.call(stage, { navigationUI: 'hide' })
  ).catch(() => undefined);
}

function clampIndex(index) {
  return Math.min(slides.length - 1, Math.max(0, index));
}

function updateNavigation(section, index) {
  const previousButton = section.querySelector('[data-nav="prev"]');
  const nextButton = section.querySelector('[data-nav="next"]');

  if (previousButton) {
    previousButton.hidden = index <= 0;
  }

  if (nextButton) {
    nextButton.hidden = index >= slides.length - 1;
  }
}

function pauseInactiveMedia(nextIndex) {
  stage.querySelectorAll('video').forEach((video) => {
    const slide = video.closest('.slide');
    const index = Number(slide?.dataset.index || 0);

    if (video.hasAttribute('data-dialogue-video')) {
      if (index !== nextIndex) {
        video.pause();
        video.hidden = true;
        video.currentTime = 0;
      }

      return;
    }

    if (index === nextIndex) {
      void video.play().catch(() => undefined);
      return;
    }

    video.pause();
  });

  viewers.forEach((viewer, index) => {
    if (index === nextIndex) {
      viewer.start();
      return;
    }

    viewer.stop();
  });
}

function playDialogueResponse(button) {
  const source = button.dataset.dialogueResponse;

  if (!source) {
    return;
  }

  const section = button.closest('.slide');
  const video = section?.querySelector('[data-dialogue-video]');

  if (!video) {
    return;
  }

  const requestId = String(dialogueResponseSequence + 1);
  dialogueResponseSequence += 1;
  video.dataset.dialogueRequest = requestId;
  video.hidden = true;

  if (video.getAttribute('src') !== source) {
    video.src = source;
    video.load();
  }

  try {
    video.currentTime = 0;
  } catch {
    // Some browsers cannot seek until metadata is available.
  }

  const revealWhenReady = () => {
    if (video.dataset.dialogueRequest !== requestId) {
      video.removeEventListener('loadeddata', revealWhenReady);
      video.removeEventListener('canplay', revealWhenReady);
      return;
    }

    if (!canRevealDialogueResponseVideo(video)) {
      return;
    }

    video.hidden = false;
    video.removeEventListener('loadeddata', revealWhenReady);
    video.removeEventListener('canplay', revealWhenReady);
  };

  video.addEventListener('loadeddata', revealWhenReady);
  video.addEventListener('canplay', revealWhenReady);
  revealWhenReady();

  void video.play().then(revealWhenReady).catch(() => {
    if (video.dataset.dialogueRequest === requestId) {
      video.hidden = true;
    }

    video.removeEventListener('loadeddata', revealWhenReady);
    video.removeEventListener('canplay', revealWhenReady);
  });
}

async function ensureVrSlide(slide, index, section) {
  if (slide.type !== 'vr') {
    return;
  }

  let viewer = viewers.get(index);

  if (!viewer) {
    viewer = new PanoramaViewer(
      section.querySelector('[data-vr-layer]'),
      section.querySelector('[data-vr-status]')
    );
    viewers.set(index, viewer);
  }

  await viewer.load(slide.source, slide.fallbackSource).catch((error) => {
    const status = section.querySelector('[data-vr-status]');

    if (status) {
      status.hidden = false;
      status.textContent =
        error instanceof Error ? error.message : '全景载入失败';
    }
  });
}

function getSlideSection(index) {
  return stage.querySelector(`.slide[data-index="${index}"]`);
}

function getOrCreateViewer(slide, index) {
  const section = getSlideSection(index);

  if (!section || slide.type !== 'vr') {
    return null;
  }

  let viewer = viewers.get(index);

  if (!viewer) {
    viewer = new PanoramaViewer(
      section.querySelector('[data-vr-layer]'),
      section.querySelector('[data-vr-status]')
    );
    viewers.set(index, viewer);
  }

  return viewer;
}

function scheduleVrPreload() {
  if (preloadStarted) {
    return;
  }

  preloadStarted = true;
  const preload = () => {
    slides.forEach((slide, index) => {
      if (slide.type !== 'vr') {
        return;
      }

      const viewer = getOrCreateViewer(slide, index);

      if (!viewer) {
        return;
      }

      void viewer.preload(slide.source, slide.fallbackSource).catch(() => {
        const status = getSlideSection(index)?.querySelector('[data-vr-status]');

        if (status) {
          status.hidden = false;
          status.textContent = '全景预加载失败，进入页面后会再次尝试';
        }
      });
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload, { timeout: 1200 });
    return;
  }

  window.setTimeout(preload, 600);
}

async function goTo(index) {
  const nextIndex = clampIndex(index);
  const sections = [...stage.querySelectorAll('.slide')];

  activeIndex = nextIndex;
  sections.forEach((section, sectionIndex) => {
    section.classList.toggle('is-active', sectionIndex === nextIndex);
    updateNavigation(section, sectionIndex);
  });

  pauseInactiveMedia(nextIndex);
  await ensureVrSlide(slides[nextIndex], nextIndex, sections[nextIndex]);
}

function handleNavigation(direction) {
  if (
    shouldDeferHomeAdvanceForFullscreen({
      direction,
      activeSlideId: slides[activeIndex]?.id,
      fullscreenElement: getActiveFullscreenElement(),
      canRequestFullscreen: canRequestStageFullscreen()
    })
  ) {
    requestImmersiveFullscreen();
    return;
  }

  requestImmersiveFullscreen();

  if (direction === 'prev') {
    void goTo(activeIndex - 1);
    return;
  }

  if (direction === 'next') {
    void goTo(activeIndex + 1);
  }
}

function handleStageClick(event) {
  const dialogueButton = event.target.closest('[data-dialogue-bubble]');

  if (dialogueButton) {
    if (!isElementWithinActiveSlide(dialogueButton)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    requestImmersiveFullscreen();
    playDialogueResponse(dialogueButton);
    return;
  }

  const navButton = event.target.closest('[data-nav]');

  if (!navButton) {
    requestImmersiveFullscreen();
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  handleNavigation(navButton.dataset.nav);
}

function handleStagePointerDown() {
  if (slides[activeIndex]?.id === 'home') {
    return;
  }

  requestImmersiveFullscreen();
}

function handleKeydown(event) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    handleNavigation('prev');
  }

  if (
    event.key === 'ArrowRight' ||
    event.key === 'Enter' ||
    event.key === ' '
  ) {
    event.preventDefault();
    handleNavigation('next');
  }
}

function render() {
  stage.replaceChildren(...slides.map(renderSlide));
  stage.addEventListener('click', handleStageClick);
  stage.addEventListener('pointerdown', handleStagePointerDown);
  window.addEventListener('keydown', handleKeydown);
  void goTo(0);
  scheduleVrPreload();
}

render();
