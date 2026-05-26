# Local Panorama Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local 2:1 image upload path that switches the current session into the existing interactive panorama viewer.

**Architecture:** Keep upload ownership in `VRClassroom`, keep rendering in `PanoramaScene`, and keep validation in a small utility. Uploaded and bundled panoramas both flow through the same preload, sphere texture, drag, wheel, and drift logic.

**Tech Stack:** React 19, TypeScript, Vite, Three.js, @react-three/fiber, Vitest.

---

## File Structure

- Create `src/utils/panoramaUpload.ts`: pure upload dimension validation.
- Keep `src/utils/panoramaUpload.test.ts`: unit tests for validation behavior.
- Modify `src/components/PanoramaScene.tsx`: accept `imageSrc` and load that texture.
- Modify `src/components/ControlPanel.tsx`: expose upload input and status/error text.
- Modify `src/components/VRClassroom.tsx`: create/revoke object URLs, validate dimensions, force panorama mode on success.
- Modify `src/styles/global.css`: style the compact upload control inside the existing panel.

### Task 1: Upload Validation Utility

**Files:**
- Create: `src/utils/panoramaUpload.ts`
- Test: `src/utils/panoramaUpload.test.ts`

- [ ] **Step 1: Run the existing failing test**

Run: `npm test -- src/utils/panoramaUpload.test.ts`

Expected: FAIL because `src/utils/panoramaUpload.ts` does not exist.

- [ ] **Step 2: Implement the utility**

```ts
import { ImageDimensions, isEquirectangularPanorama } from './panoramaDetection';

export type PanoramaUploadValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validatePanoramaUploadDimensions(
  dimensions: ImageDimensions
): PanoramaUploadValidation {
  if (
    !Number.isFinite(dimensions.width) ||
    !Number.isFinite(dimensions.height) ||
    dimensions.width <= 0 ||
    dimensions.height <= 0
  ) {
    return {
      ok: false,
      message: '无法读取图片尺寸'
    };
  }

  if (!isEquirectangularPanorama(dimensions)) {
    return {
      ok: false,
      message: '请上传接近 2:1 比例的全景图'
    };
  }

  return { ok: true };
}
```

- [ ] **Step 3: Run the upload utility test**

Run: `npm test -- src/utils/panoramaUpload.test.ts`

Expected: PASS.

### Task 2: Render Configurable Panorama Source

**Files:**
- Modify: `src/components/PanoramaScene.tsx`
- Covered by: `npm run build`

- [ ] **Step 1: Change props and loader source**

Use `imageSrc` as the texture source:

```ts
type PanoramaSceneProps = {
  controls: PanoramaControls;
  imageSrc: string;
  settings: Pick<SceneSettings, 'autoDriftEnabled'>;
  introScale: number;
};
```

```ts
const texture = useLoader(TextureLoader, imageSrc);
```

- [ ] **Step 2: Remove unused fixed asset import**

Remove `classroomAssets` from the imports in `PanoramaScene.tsx`.

### Task 3: Add Upload UI and State

**Files:**
- Modify: `src/components/ControlPanel.tsx`
- Modify: `src/components/VRClassroom.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Extend control panel props**

Add:

```ts
uploadError?: string | null;
onPanoramaUpload: (file: File) => void;
```

- [ ] **Step 2: Add the file input**

Add a styled label in `ControlPanel`:

```tsx
<label className="upload-row">
  <span>全景图</span>
  <input
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (file) {
        onPanoramaUpload(file);
      }
    }}
  />
</label>
```

Show `uploadError` below the input when present.

- [ ] **Step 3: Add upload state and handler in `VRClassroom`**

Use:

```ts
const [uploadedPanoramaSrc, setUploadedPanoramaSrc] = useState<string | null>(null);
const [uploadError, setUploadError] = useState<string | null>(null);
const uploadedPanoramaSrcRef = useRef<string | null>(null);
```

The handler creates an object URL, loads dimensions, validates them, revokes rejected URLs, replaces accepted URLs, clears the error, and sets `sceneMode` to `panorama`.

- [ ] **Step 4: Pass `imageSrc` to `PanoramaScene`**

Use:

```tsx
<PanoramaScene
  controls={panoramaControls}
  imageSrc={uploadedPanoramaSrc ?? classroomAssets.panorama}
  settings={settings}
  introScale={introScale}
/>
```

- [ ] **Step 5: Include upload source in preload**

When `sceneMode === 'panorama'`, preload `[uploadedPanoramaSrc ?? classroomAssets.panorama]`.

### Task 4: Verify and Polish

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document local upload behavior**

Add one sentence to the image placement section: uploads are local previews and reset on refresh.

- [ ] **Step 2: Run all tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: TypeScript and Vite complete with exit code 0.
