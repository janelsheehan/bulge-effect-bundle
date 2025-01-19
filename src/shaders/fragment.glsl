// Uniform variables
uniform sampler2D uTexture;  // The texture that will be applied to the object
uniform vec2 uMouse;         // The mouse position, passed as a uniform to interact with the shader
varying vec2 vUv;            // Varying variable to pass texture coordinates from the vertex shader to the fragment shader

// Function to create a circle shape based on UV coordinates
float circle(vec2 uv, vec2 circlePosition, float radius) {
  // Calculate the distance between the current UV coordinate and the center of the circle
  float dist = distance(circlePosition, uv);

  // Return a smooth circular mask (0 or 1) depending on the distance from the center
  return 1.0 - smoothstep(0.0, radius, dist);  // `smoothstep` creates a soft transition at the circle's edge
}

void main() {
  // Sample the texture using the UV coordinates
  vec4 finalTexture = texture2D(uTexture, vUv);
  
  // For now, the fragment color is just the texture color (this could be modified later to include effects)
  csm_DiffuseColor = finalTexture;  // Set the final color output (usually the color of the pixel)
}
