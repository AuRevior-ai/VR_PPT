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
  TextureLoader,
  WebGLRenderer
} from '../vendor/three.module.js';

const cameraConfig = {
  fov: 76,
  minFov: 44,
  maxFov: 92,
  initialYawDegrees: 90,
  maxPitchDegrees: 42,
  yawSensitivity: 0.004,
  pitchSensitivity: 0.003,
  radius: 500
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height
      });
    };
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function validatePanoramaDimensions(dimensions) {
  if (!dimensions.width || !dimensions.height) {
    throw new Error('无法读取全景图尺寸');
  }

  const ratio = dimensions.width / dimensions.height;

  if (Math.abs(ratio - 2) > 0.08) {
    throw new Error('全景图需要接近 2:1 比例');
  }
}

export class PanoramaViewer {
  constructor(container, statusElement) {
    this.container = container;
    this.statusElement = statusElement;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      cameraConfig.fov,
      1,
      0.1,
      cameraConfig.radius * 3
    );
    this.renderer = new WebGLRenderer({ antialias: true });
    this.loader = new TextureLoader();
    this.controls = {
      yaw: 0,
      pitch: 0,
      fov: cameraConfig.fov,
      isDragging: false
    };
    this.lastPointer = { x: 0, y: 0 };
    this.frameId = 0;
    this.mesh = null;
    this.loadedSource = '';
    this.loadingSource = '';
    this.loadPromise = null;

    this.camera.position.set(0, 0, 0.1);
    this.camera.rotation.order = 'YXZ';
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.loader.setCrossOrigin('anonymous');
    this.container.prepend(this.renderer.domElement);

    this.onPointerDown = this.handlePointerDown.bind(this);
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerEnd = this.handlePointerEnd.bind(this);
    this.onWheel = this.handleWheel.bind(this);
    this.onResize = this.resize.bind(this);

    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerEnd);
    this.renderer.domElement.addEventListener('pointercancel', this.onPointerEnd);
    this.renderer.domElement.addEventListener('wheel', this.onWheel, {
      passive: false
    });
    window.addEventListener('resize', this.onResize);
    this.resize();
  }

  setStatus(message) {
    if (!this.statusElement) {
      return;
    }

    this.statusElement.textContent = message || '';
    this.statusElement.hidden = !message;
  }

  async load(source, fallbackSource, options = {}) {
    const { start = true, showStatus = true } = options;

    if (this.loadedSource === source) {
      if (start) {
        this.start();
      }
      return;
    }

    if (this.loadPromise && this.loadingSource === source) {
      await this.loadPromise;

      if (start) {
        this.start();
      }

      return;
    }

    if (showStatus) {
      this.setStatus('正在载入全景');
    } else {
      this.setStatus('');
    }

    this.loadingSource = source;
    this.loadPromise = this.loadWithFallback(source, fallbackSource);

    try {
      await this.loadPromise;

      this.setStatus('');

      if (start) {
        this.start();
      }
    } finally {
      this.loadingSource = '';
      this.loadPromise = null;
    }
  }

  async preload(source, fallbackSource) {
    await this.load(source, fallbackSource, {
      start: false,
      showStatus: false
    });
    this.stop();
  }

  async loadWithFallback(source, fallbackSource) {
    try {
      await this.loadSingleSource(source);
      this.loadedSource = source;
      return;
    } catch (error) {
      if (!fallbackSource || fallbackSource === source) {
        throw error;
      }
    }

    await this.loadSingleSource(fallbackSource);
    this.loadedSource = fallbackSource;
  }

  async loadSingleSource(source) {
    const dimensions = await loadImageDimensions(source);
    validatePanoramaDimensions(dimensions);
    const texture = await this.loadTexture(source);
    this.applyTexture(texture);
  }

  loadTexture(source) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        source,
        (texture) => {
          texture.colorSpace = SRGBColorSpace;
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          resolve(texture);
        },
        undefined,
        () => reject(new Error(`Unable to load panorama texture: ${source}`))
      );
    });
  }

  applyTexture(texture) {
    if (!this.mesh) {
      const geometry = new SphereGeometry(cameraConfig.radius, 128, 80);
      geometry.scale(-1, 1, 1);
      this.mesh = new Mesh(
        geometry,
        new MeshBasicMaterial({
          map: texture,
          side: FrontSide,
          toneMapped: false
        })
      );
      this.scene.add(this.mesh);
      return;
    }

    const previousTexture = this.mesh.material.map;
    this.mesh.material.map = texture;
    this.mesh.material.needsUpdate = true;
    previousTexture?.dispose();
  }

  handlePointerDown(event) {
    this.lastPointer.x = event.clientX;
    this.lastPointer.y = event.clientY;
    this.renderer.domElement.setPointerCapture?.(event.pointerId);
    this.controls.isDragging = true;
  }

  handlePointerMove(event) {
    if (!this.controls.isDragging) {
      return;
    }

    const deltaX = event.clientX - this.lastPointer.x;
    const deltaY = event.clientY - this.lastPointer.y;
    const pitchLimit = (cameraConfig.maxPitchDegrees * Math.PI) / 180;

    this.controls.yaw += deltaX * cameraConfig.yawSensitivity;
    this.controls.pitch = clamp(
      this.controls.pitch + deltaY * cameraConfig.pitchSensitivity,
      -pitchLimit,
      pitchLimit
    );
    this.lastPointer.x = event.clientX;
    this.lastPointer.y = event.clientY;
  }

  handlePointerEnd(event) {
    this.renderer.domElement.releasePointerCapture?.(event.pointerId);
    this.controls.isDragging = false;
  }

  handleWheel(event) {
    event.preventDefault();
    this.controls.fov = clamp(
      this.controls.fov + event.deltaY * 0.03,
      cameraConfig.minFov,
      cameraConfig.maxFov
    );
  }

  resize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.frameId) {
      return;
    }

    const render = () => {
      this.frameId = requestAnimationFrame(render);
      this.camera.rotation.y =
        (cameraConfig.initialYawDegrees * Math.PI) / 180 + this.controls.yaw;
      this.camera.rotation.x = this.controls.pitch;
      this.camera.fov = this.controls.fov;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    };

    render();
  }

  stop() {
    if (!this.frameId) {
      return;
    }

    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }
}
