# Local Panorama Upload Design

## Goal

Allow the user to upload a local 2:1 image during the current browser session and view it with the existing panorama rendering and controls. Refreshing the page restores the bundled default assets.

## Architecture

The app keeps the current scene detection flow for bundled assets. A successful upload creates a browser object URL and stores it in `VRClassroom` state. When that state exists, the scene mode is forced to `panorama`, preload uses the uploaded URL, and `PanoramaScene` receives the uploaded URL instead of reading the bundled panorama path.

## Components

- `src/utils/panoramaUpload.ts` validates uploaded image dimensions with the same 2:1 tolerance used by automatic panorama detection.
- `src/components/ControlPanel.tsx` adds a compact image file input inside the existing control panel style.
- `src/components/VRClassroom.tsx` owns upload state, upload error text, object URL cleanup, and scene switching.
- `src/components/PanoramaScene.tsx` accepts an `imageSrc` prop so uploaded and bundled panoramas share the same sphere mapping and controls.

## Data Flow

1. User chooses an image file.
2. `VRClassroom` loads dimensions using `loadImageDimensions` against a temporary object URL.
3. `validatePanoramaUploadDimensions` accepts only readable images close to 2:1.
4. On success, `VRClassroom` revokes any previous uploaded object URL, stores the new one, clears the error, and switches to panorama mode.
5. On failure, `VRClassroom` revokes the temporary object URL, leaves the current scene unchanged, and shows the validation message.

## Error Handling

- Non-image or unreadable dimensions show `无法读取图片尺寸`.
- Images outside the 2:1 tolerance show `请上传接近 2:1 比例的全景图`.
- Selecting the same file again is supported by clearing the file input value after handling.
- Object URLs are revoked when replaced and when `VRClassroom` unmounts.

## Testing

- Add unit coverage for upload dimension validation.
- Run the new upload test red before implementation.
- Run the full Vitest suite after implementation.
- Run `npm run build` to verify TypeScript and Vite production output.
