export const slides = [
  {
    id: 'home',
    type: 'video',
    src: './assets/home-loop.mp4',
    poster: './assets/cover.png',
    advanceOnClick: true
  },
  {
    id: 'intro',
    type: 'image',
    src: './assets/intro.png',
    advanceOnClick: true
  },
  {
    id: 'vr-playground',
    type: 'vr',
    source:
      'https://aurevior-ai.github.io/VR_PPT_assets/customer/3-playground-vr.png',
    fallbackSource: './assets/vr-playground.png'
  },
  {
    id: 'vr-classroom',
    type: 'vr',
    source:
      'https://aurevior-ai.github.io/VR_PPT_assets/customer/4-classroom-vr.png',
    fallbackSource: './assets/vr-classroom.png'
  },
  {
    id: 'vr-quiet-classroom',
    type: 'vr',
    source:
      'https://aurevior-ai.github.io/VR_PPT_assets/customer/5-quiet-classroom-vr.png',
    fallbackSource: './assets/vr-quiet-classroom.png'
  },
  {
    id: 'dialogue',
    type: 'image',
    src: './assets/dialogue.png',
    nav: true
  },
  {
    id: 'outro',
    type: 'video',
    src: './assets/outro-loop.mp4',
    poster: './assets/outro.png',
    nav: true
  }
];
