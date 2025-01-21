import { useRef, useMemo, useEffect, useState } from "react";
import { debounce } from "lodash";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import html2canvas from "html2canvas";

// Custom hook to convert a DOM element into a Three.js texture
const useDomToCanvas = (domEl) => {
  const [texture, setTexture] = useState();

  useEffect(() => {
    if (!domEl) return;

    const convertDomToCanvas = async () => {
      try {
        console.log("Capturing DOM element as canvas texture...");
        const canvas = await html2canvas(domEl, { backgroundColor: null });
        setTexture(new THREE.CanvasTexture(canvas)); 
        console.log("Canvas captured and texture updated.");
      } catch (error) {
        console.error("Error capturing DOM element:", error);
      }
    };

    // Initial conversion when domEl is available
    convertDomToCanvas();

    // Debounce resize to avoid excessive calls
    const debouncedResize = debounce(() => {
      console.log("Resizing and updating texture...");
      convertDomToCanvas();
    }, 100);

    // Event listener for window resizing
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [domEl]); // This will rerun whenever domEl changes

  return texture;
};

function Lights() {
  const pointLightRef = useRef();
  return (
    <pointLight
      ref={pointLightRef}
      color="#ffffff"
      intensity={30}
      distance={12}
      decay={1}
      position={[2, 4, 6]}
    />
  );
}

function Scene() {
  const state = useThree();
  const { width, height } = state.viewport;

  const [domEl, setDomEl] = useState(null); // This is the DOM element
  const [initialized, setInitialized] = useState(false); // Track if the element is initialized
  const materialRef = useRef();
  const textureDOM = useDomToCanvas(domEl); // Get the texture from DOM element

  // Memoize uniforms to ensure proper updates to the shader
  const uniforms = useMemo(
    () => ({
      uTexture: { value: textureDOM },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [textureDOM]
  );

  // Lerp mouse position for smooth movement
  const mouseLerped = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const mouse = state.mouse;
    mouseLerped.current.x = THREE.MathUtils.lerp(mouseLerped.current.x, mouse.x, 0.1);
    mouseLerped.current.y = THREE.MathUtils.lerp(mouseLerped.current.y, mouse.y, 0.1);
    materialRef.current.uniforms.uMouse.value.x = mouseLerped.current.x;
    materialRef.current.uniforms.uMouse.value.y = mouseLerped.current.y;
  });

  // Framer iframe message handling
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Received message from:", event.origin);

      // Only allow messages from the Framer iframe origin
      if (event.origin !== "https://batty-cv.framer.ai") {
        console.warn("Received message from an unexpected origin:", event.origin);
        return;
      }

      if (event.data.type === "setElement") {
        console.log("Message type 'setElement' received");

        const { targetElement, elementDimensions } = event.data;
        console.log("Received targetElement:", targetElement);
        console.log("Received elementDimensions:", elementDimensions);

        // Only set the DOM element once to prevent overwriting it
        if (!initialized) {
          console.log("Setting DOM element for the first time...");
          setDomEl(targetElement);
          setInitialized(true); // Mark it as initialized
          console.log("Element setup complete, no further DOM updates after initial load.");
        } else {
          console.log("Skipping DOM element update, already initialized.");
        }
      } else {
        console.warn("Received message with unknown type:", event.data.type);
      }
    };

    // Setup message listener, ensure it's set only once
    console.log("Setting up message listener for 'setElement' events");
    window.addEventListener("message", handleMessage);

    // Cleanup listener when component unmounts
    return () => {
      console.log("Cleaning up message listener");
      window.removeEventListener("message", handleMessage);
    };
  }, [initialized]); // Ensure this only runs when initialized changes

  return (
    <>
      {/* HTML content displayed as an overlay */}
      <Html zIndexRange={[-1, -10]} prepend fullscreen>
        <div
          ref={(el) => {
            // Only set the DOM element once, log initialization
            if (!initialized && el) {
              console.log("DOM element ref set for the first time: ", el);
              setDomEl(el); // Set the DOM element only once
            } else if (initialized) {
              console.log("Skipping DOM element ref set (already initialized)");
            }
          }}
          className="dom-element"
          style={{
            fontSize: "clamp(100px, 17vw, 200px)",
          }}
        >
          <p>Bulge <br />Effect</p>
        </div>
      </Html>

      {/* 3D Mesh */}
      <mesh>
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
