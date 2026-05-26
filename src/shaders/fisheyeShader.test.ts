import { describe, expect, it } from 'vitest';
import { fisheyeFragmentShader, fisheyeVertexShader } from './fisheyeShader';

describe('fisheyeShader', () => {
  it('bends the mesh toward a concave classroom surface', () => {
    expect(fisheyeVertexShader).toContain('uConcaveStrength');
    expect(fisheyeVertexShader).toContain('concaveArc');
    expect(fisheyeVertexShader).toContain('sign(centered.y)');
  });

  it('uses inverse radial sampling for concave wide-angle distortion', () => {
    expect(fisheyeFragmentShader).toContain('uLensMode');
    expect(fisheyeFragmentShader).toContain('concaveArc');
    expect(fisheyeFragmentShader).toContain('1.0 - uStrength');
  });
});
