// Importing necessary hooks and utilities
import { useRef, useMemo, useEffect, useState } from "react"; // React hooks
import { useControls } from "leva"; // Leva for UI controls
import { debounce } from "lodash"; // For debouncing resize events

// Importing 3D utilities from Three.js and @react-three/fiber
import * as THREE from "three"; // Core Three.js library
import { PointLightHelper } from "three"; // Helper for visualizing point lights
import { useFrame, useThree } from "@react-three/fiber"; // React Three Fiber for rendering and animation
import { useHelper, Html } from "@react-three/drei"; // Drei is a set of useful abstractions for React Three Fiber
import CustomShaderMaterial from "three-custom-shader-material"; // A custom shader material for Three.js
import vertexShader from "./shaders/vertex.glsl"; // Vertex shader (for manipulating vertex data)
import fragmentShader from "./shaders/fragment.glsl"; // Fragment shader (for manipulating pixel colors)
import html2canvas from "html2canvas"; // To capture DOM elements as a canvas texture

// Custom hook to convert a DOM element into a Three.js texture
const useDomToCanvas = (domEl) => {
  const [texture, setTexture] = useState(); // State to store the texture

  useEffect(() => {
    // If no DOM element, return
    if (!domEl) return;

    // Function to capture DOM element as a canvas
    const convertDomToCanvas = async () => {
      const canvas = await html2canvas(domEl, { backgroundColor: null }); // Capture the DOM element
      setTexture(new THREE.CanvasTexture(canvas)); // Convert to Three.js texture
    };

    convertDomToCanvas();

    // Debounced resize handler to update the texture when the window resizes
    const debouncedResize = debounce(() => {
      convertDomToCanvas();
    }, 100);

    window.addEventListener("resize", debouncedResize); // Event listener for resize

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [domEl]); // Effect depends on the DOM element

  return texture; // Return the texture
};

// Lights component that creates a point light and adds interactive controls
function Lights() {
  const pointLightRef = useRef(); // Ref to store the light object

  // Using the helper from Drei to visualize the point light in the 3D scene
  useHelper(pointLightRef, PointLightHelper, 0.7, "cyan");

  // Using Leva for light control
  const config = useControls("Lights", {
    color: "#ffffff", // Light color
    intensity: { value: 30, min: 0, max: 5000, step: 0.01 }, // Intensity of the light
    distance: { value: 12, min: 0, max: 100, step: 0.1 }, // Distance of the light's effect
    decay: { value: 1, min: 0, max: 5, step: 0.1 }, // Decay of the light over distance
    position: { value: [2, 4, 6] }, // Position of the light in 3D space
  });

  // Returning the point light with the configured properties
  return <pointLight ref={pointLightRef} {...config} />;
}

// Main Scene component where the 3D objects and shaders are set up
function Scene() {
  const state = useThree(); // Getting the current rendering state from React Three Fiber
  const { width, height } = state.viewport; // Getting the viewport dimensions for scaling
  const [domEl, setDomEl] = useState(null); // Ref for the DOM element to capture as texture

  const materialRef = useRef(); // Ref for the custom shader material
  const textureDOM = useDomToCanvas(domEl); // Getting the texture from the DOM element

  // Setting up shader uniforms to send to the shaders
  const uniforms = useMemo(
    () => ({
      uTexture: { value: textureDOM }, // The texture created from the DOM element
      uMouse: { value: new THREE.Vector2(0, 0) }, // Mouse coordinates for interaction
    }),
    [textureDOM] // Recompute when textureDOM changes
  );

  // Mouse lerping for smoother mouse interaction
  const mouseLerped = useRef({ x: 0, y: 0 });

  // Using useFrame to update the mouse position every frame for animation
  useFrame((state, delta) => {
    const mouse = state.mouse; // Getting the current mouse position
    // Lerp (smooth) the mouse position to avoid jittery movements
    mouseLerped.current.x = THREE.MathUtils.lerp(mouseLerped.current.x, mouse.x, 0.1);
    mouseLerped.current.y = THREE.MathUtils.lerp(mouseLerped.current.y, mouse.y, 0.1);
    // Updating the shader uniforms with the smooth mouse position
    materialRef.current.uniforms.uMouse.value.x = mouseLerped.current.x;
    materialRef.current.uniforms.uMouse.value.y = mouseLerped.current.y;
  });

  return (
    <>
      {/* Html component from Drei: Allows for DOM elements in 3D space */}
      <Html zIndexRange={[-1, -10]} prepend fullscreen>
        {/* DOM element (text) to be used as texture for 3D plane */}
        <div ref={(el) => setDomEl(el)} className="dom-element">
          <p className="flex flex-col">
            WHEN <br />
            WILL <br />
            WE <br />
            MEET ?<br />
          </p>
        </div>
      </Html>

      {/* 3D mesh representing the plane where the texture will be applied */}
      <mesh>
        {/* Plane geometry (width x height, with 254 subdivisions) */}
        <planeGeometry args={[width, height, 254, 254]} />
        {/* Custom Shader Material */}
        <CustomShaderMaterial
          ref={materialRef}
          baseMaterial={THREE.MeshStandardMaterial} // Base material for the mesh
          vertexShader={vertexShader} // Custom vertex shader
          fragmentShader={fragmentShader} // Custom fragment shader
          uniforms={uniforms} // Shader uniforms containing texture and mouse data
          flatShading // Use flat shading for a more stylized look
          silent // Prevent logging
        />
        <Lights /> {/* Adding the lights to the scene */}
      </mesh>
    </>
  );
}

export default Scene;
