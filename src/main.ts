import {
  FrontSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NoToneMapping,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  WebGLRenderer
} from 'three';
import {
  defaultPanoramaAsset,
  defaultPanoramaSettings,
  panoramaCamera
} from './config/panoramaConfig';
import './styles/global.css';
import {
  loadImageDimensions
} from './utils/panoramaDetection';
import { validatePanoramaUploadDimensions } from './utils/panoramaUpload';
import {
  applyPanoramaDrag,
  applyPanoramaWheel,
  PanoramaAngles
} from './utils/panoramaControls';
import { resolvePanoramaSource } from './utils/panoramaSource';

type PanoramaControls = PanoramaAngles & {
  fov: number;
  isDragging: boolean;
};

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root element');
}

const appRoot = root;

appRoot.innerHTML = `
  <main class="panorama-viewer">
    <div class="loading-screen" data-loading>
      <div class="loading-card">
        <div class="loading-mark" aria-hidden="true"></div>
        <h1>正在进入 360 全景教室</h1>
        <p data-loading-label>正在载入全景图</p>
      </div>
    </div>
    <div class="panorama-badge" aria-label="当前为 360 全景模式">360 全景</div>
    <aside class="control-panel" aria-label="镜头控制">
      <div class="control-panel-header">
        <span>镜头台</span>
      </div>
      <label class="upload-row">
        <span class="upload-button" aria-hidden="true">上传全景图</span>
        <input
          class="upload-input"
          type="file"
          accept="image/*"
          aria-label="上传 2:1 全景图"
          data-upload
        />
      </label>
      <p class="upload-error" role="status" data-upload-error hidden></p>
    </aside>
  </main>
`;

function queryRequired<ElementType extends Element>(selector: string) {
  const element = appRoot.querySelector<ElementType>(selector);

  if (!element) {
    throw new Error(`Unable to initialize panorama UI: ${selector}`);
  }

  return element;
}

const viewer = queryRequired<HTMLElement>('.panorama-viewer');
const loading = queryRequired<HTMLElement>('[data-loading]');
const loadingLabel = queryRequired<HTMLElement>('[data-loading-label]');
const uploadInput = queryRequired<HTMLInputElement>('[data-upload]');
const uploadError = queryRequired<HTMLElement>('[data-upload-error]');

const scene = new Scene();
const camera = new PerspectiveCamera(
  panoramaCamera.fov,
  window.innerWidth / window.innerHeight,
  0.1,
  panoramaCamera.radius * 3
);
const renderer = new WebGLRenderer({ antialias: true });
const textureLoader = new TextureLoader();
const controls: PanoramaControls = {
  yaw: 0,
  pitch: 0,
  fov: panoramaCamera.fov,
  isDragging: false
};
const lastPointer = { x: 0, y: 0 };

let activeUploadedSrc: string | null = null;
let uploadSequence = 0;
let panoramaMesh: Mesh<SphereGeometry, MeshBasicMaterial> | null = null;

renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = NoToneMapping;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
textureLoader.setCrossOrigin('anonymous');
viewer.prepend(renderer.domElement);
renderer.domElement.className = 'classroom-canvas';

camera.position.set(0, 0, 0.1);
camera.rotation.order = 'YXZ';

function setLoading(isLoading: boolean, label = '正在载入全景图') {
  loading.hidden = !isLoading;
  loadingLabel.textContent = label;
}

function setUploadError(message: string | null) {
  uploadError.textContent = message ?? '';
  uploadError.hidden = !message;
}

function configureTexture(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
}

function loadTexture(src: string) {
  return new Promise<Texture>((resolve, reject) => {
    textureLoader.load(
      src,
      (texture) => {
        configureTexture(texture);
        resolve(texture);
      },
      undefined,
      () => reject(new Error(`Unable to load panorama texture: ${src}`))
    );
  });
}

function applyTexture(texture: Texture) {
  if (!panoramaMesh) {
    const geometry = new SphereGeometry(panoramaCamera.radius, 128, 80);
    geometry.scale(panoramaCamera.textureHorizontalScale, 1, 1);
    panoramaMesh = new Mesh(
      geometry,
      new MeshBasicMaterial({
        map: texture,
        side: FrontSide,
        toneMapped: false
      })
    );
    scene.add(panoramaMesh);
    return;
  }

  const previousTexture = panoramaMesh.material.map;
  panoramaMesh.material.map = texture;
  panoramaMesh.material.needsUpdate = true;
  previousTexture?.dispose();
}

async function showPanorama(src: string, label = '正在载入全景图') {
  setLoading(true, label);
  const dimensions = await loadImageDimensions(src);
  const validation = validatePanoramaUploadDimensions(dimensions);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const texture = await loadTexture(src);
  applyTexture(texture);
  setLoading(false);
}

function isInteractiveTarget(target: EventTarget | null) {
  const element = target as Element | null;

  return Boolean(
    element?.closest(
      'a[href], button, input, label, select, textarea, [role="button"]'
    )
  );
}

function resize() {
  const width = viewer.clientWidth || window.innerWidth;
  const height = viewer.clientHeight || window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  const drift = defaultPanoramaSettings.autoDriftEnabled
    ? Math.sin(performance.now() * 0.00016) * 0.05
    : 0;
  camera.rotation.y =
    (panoramaCamera.initialYawDegrees * Math.PI) / 180 + controls.yaw + drift;
  camera.rotation.x = controls.pitch;
  camera.fov = controls.fov;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

viewer.addEventListener('pointerdown', (event) => {
  if (isInteractiveTarget(event.target)) {
    return;
  }

  lastPointer.x = event.clientX;
  lastPointer.y = event.clientY;
  viewer.setPointerCapture?.(event.pointerId);
  controls.isDragging = true;
});

viewer.addEventListener('pointermove', (event) => {
  if (!controls.isDragging) {
    return;
  }

  const nextAngles = applyPanoramaDrag(
    controls,
    {
      deltaX: event.clientX - lastPointer.x,
      deltaY: event.clientY - lastPointer.y
    },
    {
      yawSensitivity: panoramaCamera.yawSensitivity,
      pitchSensitivity: panoramaCamera.pitchSensitivity,
      pitchLimit: (panoramaCamera.maxPitchDegrees * Math.PI) / 180
    }
  );
  controls.yaw = nextAngles.yaw;
  controls.pitch = nextAngles.pitch;
  lastPointer.x = event.clientX;
  lastPointer.y = event.clientY;
});

const stopDragging = (event: PointerEvent) => {
  viewer.releasePointerCapture?.(event.pointerId);
  controls.isDragging = false;
};

viewer.addEventListener('pointerup', stopDragging);
viewer.addEventListener('pointercancel', stopDragging);
viewer.addEventListener(
  'wheel',
  (event) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();
    controls.fov = applyPanoramaWheel(controls.fov, event.deltaY, {
      minFov: panoramaCamera.minFov,
      maxFov: panoramaCamera.maxFov
    });
  },
  { passive: false }
);

uploadInput.addEventListener('change', async () => {
  const file = uploadInput.files?.[0];
  uploadInput.value = '';

  if (!file) {
    return;
  }

  const requestId = uploadSequence + 1;
  uploadSequence = requestId;
  const nextSrc = URL.createObjectURL(file);

  try {
    setUploadError(null);
    setLoading(true, '正在解析上传的全景图');
    await showPanorama(nextSrc);

    if (uploadSequence !== requestId) {
      URL.revokeObjectURL(nextSrc);
      return;
    }

    if (activeUploadedSrc) {
      URL.revokeObjectURL(activeUploadedSrc);
    }

    activeUploadedSrc = nextSrc;
  } catch (error) {
    URL.revokeObjectURL(nextSrc);
    setLoading(false);
    setUploadError(error instanceof Error ? error.message : '无法读取图片尺寸');
  }
});

window.addEventListener('resize', resize);
window.addEventListener('beforeunload', () => {
  if (activeUploadedSrc) {
    URL.revokeObjectURL(activeUploadedSrc);
  }
});

resize();
async function showInitialPanorama() {
  const resolvedSource = resolvePanoramaSource(
    window.location.search,
    defaultPanoramaAsset,
    window.location.href
  );

  if (!resolvedSource.ok) {
    setUploadError(resolvedSource.message);
    await showPanorama(defaultPanoramaAsset);
    return;
  }

  try {
    await showPanorama(
      resolvedSource.src,
      resolvedSource.fromQuery ? '正在载入分享全景图' : '正在载入全景图'
    );
  } catch (error) {
    if (resolvedSource.fromQuery) {
      setUploadError(
        error instanceof Error ? error.message : '无法读取分享全景图'
      );
      await showPanorama(defaultPanoramaAsset);
      return;
    }

    throw error;
  }
}

void showInitialPanorama().catch((error) => {
  setLoading(false);
  setUploadError(error instanceof Error ? error.message : '无法读取默认全景图');
});
animate();
