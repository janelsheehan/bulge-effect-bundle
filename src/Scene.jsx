import { useRef, useMemo, useEffect, useState } from "react"; // React hooks
import { debounce } from "lodash"; // For debouncing resize events
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
    if (!domEl) return;

    // Function to capture DOM element as a canvas
    const convertDomToCanvas = async () => {
      try {
        console.log("Capturing DOM element as canvas texture...");
        const canvas = await html2canvas(domEl, { backgroundColor: null, useCORS: true });
        setTexture(new THREE.CanvasTexture(canvas)); // Convert to Three.js texture
        console.log("Canvas captured and texture updated.");
      } catch (error) {
        console.error("Error capturing DOM element:", error);
      }
    };

    // Initial conversion on first render
    convertDomToCanvas();

    // Debounced resize handler to update the texture when the window resizes
    const debouncedResize = debounce(() => {
      convertDomToCanvas();
    }, 100);

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [domEl]); // Effect depends on the DOM element

  return texture; // Return the texture
};

// Lights component
function Lights() {
  const pointLightRef = useRef();

  return <pointLight ref={pointLightRef} color="#ffffff" intensity={30} distance={12} decay={1} position={[2, 4, 6]} />;
}

function Scene() {
  const state = useThree();
  const { width, height } = state.viewport;
  const [domEl, setDomEl] = useState(null); // Ref for the DOM element to capture as texture
  const materialRef = useRef();
  const textureDOM = useDomToCanvas(domEl);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: textureDOM },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [textureDOM]
  );

  const mouseLerped = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const mouse = state.mouse;
    mouseLerped.current.x = THREE.MathUtils.lerp(mouseLerped.current.x, mouse.x, 0.1);
    mouseLerped.current.y = THREE.MathUtils.lerp(mouseLerped.current.y, mouse.y, 0.1);
    materialRef.current.uniforms.uMouse.value.x = mouseLerped.current.x;
    materialRef.current.uniforms.uMouse.value.y = mouseLerped.current.y;
  });

  return (
    <>
      {/* Html component from Drei: Allows for DOM elements in 3D space */}
      <Html zIndexRange={[-1, -10]} prepend fullscreen>
        <div
          ref={(el) => {
            setDomEl(el);
            console.log("DOM element ref set: ", el); // Log when DOM element is set
          }}
          className="dom-element"
          style={{
            fontSize: "clamp(100px, 17vw, 200px)", // Responsive font size using clamp
          }}
        >
          <p>Bulge <br />Effect</p>
          {/* This will be replaced by dynamic content from Framer */}
        </div>
      </Html>

      <mesh>
        {/* Plane geometry (width x height, with 254 subdivisions) */}
        <planeGeometry args={[width, height, 254, 254]} />
        <CustomShaderMaterial
          ref={materialRef}
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          flatShading
          silent
        />
        <Lights />
      </mesh>
    </>
  );
}

export default Scene;
