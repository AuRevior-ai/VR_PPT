import { slides } from './courseware-config.js';
import { PanoramaViewer } from './vr-panorama.js';

const stage = document.getElementById('courseware');
const viewers = new Map();
let preloadStarted = false;
let activeIndex = 0;

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

function renderSlide(slide, index) {
  const section = document.createElement('section');
  section.className = 'slide';
  section.dataset.slide = slide.id;
  section.dataset.index = String(index);

  if (slide.type === 'video') {
    const video = document.createElement('video');
    video.className = 'slide-media';
    video.src = slide.src;
    video.poster = slide.poster || '';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', '');
    section.append(video);
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

function requestImmersiveFullscreen() {
  if (document.fullscreenElement || !stage.requestFullscreen) {
    return;
  }

  void stage.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined);
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
  const navButton = event.target.closest('[data-nav]');

  if (!navButton) {
    requestImmersiveFullscreen();
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  handleNavigation(navButton.dataset.nav);
}

function handleKeydown(event) {
  requestImmersiveFullscreen();

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    void goTo(activeIndex - 1);
  }

  if (
    event.key === 'ArrowRight' ||
    event.key === 'Enter' ||
    event.key === ' '
  ) {
    event.preventDefault();
    void goTo(activeIndex + 1);
  }
}

function render() {
  stage.replaceChildren(...slides.map(renderSlide));
  stage.addEventListener('click', handleStageClick);
  stage.addEventListener('pointerdown', requestImmersiveFullscreen);
  window.addEventListener('keydown', handleKeydown);
  void goTo(0);
  scheduleVrPreload();
}

render();
