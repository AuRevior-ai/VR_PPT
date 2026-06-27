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
    source: './assets/vr-playground.png',
    fallbackSource: './assets/vr-playground.png'
  },
  {
    id: 'vr-classroom',
    type: 'vr',
    source: './assets/vr-classroom.png',
    fallbackSource: './assets/vr-classroom.png'
  },
  {
    id: 'dialogue',
    type: 'dialogue',
    src: './assets/dialogue-loop.mp4',
    poster: './assets/dialogue.png',
    nav: true,
    bubbles: [
      {
        id: 'play',
        label: '下课玩什么？',
        variant: 'blue',
        responseVideo: './assets/recess-reply.mp4'
      },
      {
        id: 'homework',
        label: '作业多不多？',
        variant: 'orange',
        responseVideo: './assets/homework-reply.mp4'
      },
      {
        id: 'miss-mom',
        label: '想妈妈了怎么办？',
        variant: 'green',
        responseVideo: './assets/miss-mom-reply.mp4'
      }
    ]
  },
  {
    id: 'outro',
    type: 'video',
    src: './assets/outro-loop.mp4',
    poster: './assets/outro.png',
    nav: true
  }
];
