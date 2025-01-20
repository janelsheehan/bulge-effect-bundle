// Adding a log at the top to confirm the file has been updated
console.log("We did something yay!");

// Importing necessary hooks and utilities
import { useRef, useMemo, useEffect, useState } from "react"; // React hooks
import { debounce } from "lodash"; // For debouncing resize events

// Importing 3D utilities from Three.js and @react-three/fiber
import * as THREE from "three"; // Core Three.js library
import { useFrame, useThree } from "@react-three/fiber"; // React Three Fiber for rendering and animation
import { Html } from "@react-three/drei"; // Drei is a set of useful abstractions for React Three Fiber
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

  // Returning the point light (you can modify this later for Framer-specific lighting, if necessary)
  return <pointLight ref={pointLightRef} color="#ffffff" intensity={30} distance={12} decay={1} position={[2, 4, 6]} />;
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

  // Log when the DOM element is updated
  useEffect(() => {
    if (domEl) {
      console.log("DOM element successfully set:", domEl); // Logging DOM element reference
    }
  }, [domEl]); // Only log when `domEl` state changes

  return (
    <>
      {/* Html component from Drei: Allows for DOM elements in 3D space */}
      <Html zIndexRange={[-1, -10]} prepend fullscreen>
        {/* This DOM element will be replaced by the content from Framer */}
        <div ref={(el) => setDomEl(el)} className="dom-element">
          {/* No need for hardcoded content here. Framer will provide dynamic content */}
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
