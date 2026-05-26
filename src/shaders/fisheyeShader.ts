export const fisheyeVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fisheyeFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uStrength;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv * 2.0 - 1.0;
    float radius = length(centered);
    // Radial falloff keeps the classroom center readable while the edges stretch
    // into a soft picturebook wide-angle lens.
    float falloff = smoothstep(0.08, 1.0, radius);
    vec2 warped = centered * (1.0 + uStrength * falloff * radius * radius * 0.58);
    vec2 uv = warped * 0.5 + 0.5;
    vec4 color = texture2D(uTexture, uv);
    color.a *= uOpacity;
    gl_FragColor = color;
  }
`;
