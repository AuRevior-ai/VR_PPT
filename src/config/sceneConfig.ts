export type SceneLayerId =
  | 'bg_wall'
  | 'teacher_podium'
  | 'desks_students_mid'
  | 'students_foreground'
  | 'overlays'
  | 'original';

export type LensMode = 'concaveWide' | 'convexFisheye';

export type SceneLayerConfig = {
  id: SceneLayerId;
  name: string;
  src: string;
  depth: number;
  parallaxFactor: number;
  scale: number;
  opacity?: number;
};

export type SceneSettings = {
  lensMode: LensMode;
  fisheyeEnabled: boolean;
  autoDriftEnabled: boolean;
  parallaxStrength: number;
  fisheyeStrength: number;
  viewRotationMaxDegrees: number;
};

const basePath = '/assets/classroom';

// Keep all classroom asset paths here so replacement art can be dropped into
// public/assets/classroom without touching rendering components.
export const classroomAssets = {
  basePath,
  original: `${basePath}/original.png`,
  depthMap: `${basePath}/depth_map.png`,
  layers: {
    bg_wall: `${basePath}/bg_wall.png`,
    teacher_podium: `${basePath}/teacher_podium.png`,
    desks_students_mid: `${basePath}/desks_students_mid.png`,
    students_foreground: `${basePath}/students_foreground.png`,
    overlays: `${basePath}/overlays.png`
  }
} as const;

export const layeredSceneLayers: SceneLayerConfig[] = [
  {
    id: 'bg_wall',
    name: '墙面和黑板背景',
    src: classroomAssets.layers.bg_wall,
    depth: -0.12,
    parallaxFactor: 0.16,
    scale: 1.24
  },
  {
    id: 'teacher_podium',
    name: '老师和讲台',
    src: classroomAssets.layers.teacher_podium,
    depth: -0.04,
    parallaxFactor: 0.38,
    scale: 1.25
  },
  {
    id: 'desks_students_mid',
    name: '中景学生和课桌',
    src: classroomAssets.layers.desks_students_mid,
    depth: 0.03,
    parallaxFactor: 0.62,
    scale: 1.28
  },
  {
    id: 'students_foreground',
    name: '前景学生',
    src: classroomAssets.layers.students_foreground,
    depth: 0.1,
    parallaxFactor: 0.92,
    scale: 1.32
  },
  {
    id: 'overlays',
    name: '黑板字和公告栏细节',
    src: classroomAssets.layers.overlays,
    depth: 0.14,
    parallaxFactor: 0.52,
    scale: 1.26
  }
];

export const singleImageLayer: SceneLayerConfig = {
  id: 'original',
  name: '原始课堂插画',
  src: classroomAssets.original,
  depth: 0,
  parallaxFactor: 0.48,
  scale: 1.32
};

export const requiredLayerSources = layeredSceneLayers.map((layer) => layer.src);

// Gentle defaults: enough motion to feel spatial, low enough for young users.
export const defaultSceneSettings: SceneSettings = {
  lensMode: 'concaveWide',
  fisheyeEnabled: true,
  autoDriftEnabled: true,
  parallaxStrength: 1.05,
  fisheyeStrength: 0.42,
  viewRotationMaxDegrees: 34
};

export const controlRanges = {
  parallaxStrength: {
    min: 0,
    max: 2.2,
    step: 0.05
  },
  fisheyeStrength: {
    min: 0,
    max: 0.9,
    step: 0.02
  }
} as const;
