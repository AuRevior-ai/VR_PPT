export const fisheyeVertexShader = `
  uniform float uLensMode;
  uniform float uConcaveStrength;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    vec2 centered = uv * 2.0 - 1.0;
    float concaveEnabled = step(0.5, uLensMode);
    float concaveArc = (1.0 - centered.x * centered.x) * abs(centered.y);
    float edgeArc = centered.x * centered.x;

    transformed.y -= sign(centered.y) * abs(position.y) * concaveArc * uConcaveStrength * 0.18 * concaveEnabled;
    transformed.x *= 1.0 + edgeArc * uConcaveStrength * 0.08 * concaveEnabled;
    transformed.z -= abs(position.x) * edgeArc * uConcaveStrength * 0.08 * concaveEnabled;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

export const fisheyeFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uStrength;
  uniform float uLensMode;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv * 2.0 - 1.0;
    float radius = length(centered);
    float concaveEnabled = step(0.5, uLensMode);
    float falloff = smoothstep(0.08, 1.0, radius);
    float concaveArc = (1.0 - centered.x * centered.x) * centered.y;

    vec2 convexWarp = centered * (1.0 + uStrength * falloff * radius * radius * 0.58);
    vec2 concaveWarp = centered * (1.0 - uStrength * falloff * radius * radius * 0.24);
    concaveWarp.y += uStrength * concaveArc * 0.34;
    concaveWarp.x -= uStrength * centered.x * abs(centered.x) * abs(centered.y) * 0.045;

    vec2 warped = mix(convexWarp, concaveWarp, concaveEnabled);
    vec2 uv = warped * 0.5 + 0.5;
    vec4 color = texture2D(uTexture, uv);
    color.a *= uOpacity;
    gl_FragColor = color;
  }
`;
