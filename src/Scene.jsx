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
        console.log("Converting DOM element to canvas...");
        const canvas = await html2canvas(domEl, { backgroundColor: null });
        setTexture(new THREE.CanvasTexture(canvas));
        console.log("Texture created and applied:", canvas);
      } catch (error) {
        console.error("Error converting DOM to canvas:", error);
      }
    };

    // Convert DOM element to texture
    convertDomToCanvas();

    // Debounce resize to avoid excessive calls
    const debouncedResize = debounce(() => {
      console.log("Window resized, updating texture...");
      convertDomToCanvas();
    }, 100);

    // Resize listener
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [domEl]);

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

  const [domEl, setDomEl] = useState(null); // The DOM element reference
  const [initialized, setInitialized] = useState(false); // Track if the element is initialized
  const materialRef = useRef();
  const textureDOM = useDomToCanvas(domEl); // Get texture from the DOM element

  // Memoized uniforms for shader
  const uniforms = useMemo(
    () => ({
      uTexture: { value: textureDOM },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [textureDOM]
  );

  // Smoothly lerp mouse position for shader
  const mouseLerped = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const mouse = state.mouse;
    mouseLerped.current.x = THREE.MathUtils.lerp(mouseLerped.current.x, mouse.x, 0.1);
    mouseLerped.current.y = THREE.MathUtils.lerp(mouseLerped.current.y, mouse.y, 0.1);
    materialRef.current.uniforms.uMouse.value.x = mouseLerped.current.x;
    materialRef.current.uniforms.uMouse.value.y = mouseLerped.current.y;

    // Debug logs for mouse movement
    console.log("Lerping mouse position:", mouseLerped.current);
  });

  // Message listener from Framer
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Message received from:", event.origin);
      console.log("Received message:", event.data);

      if (event.origin !== "https://batty-cv.framer.ai") {
        console.warn("Message origin mismatch:", event.origin);
        return;
      }

      // Handle setElement message type
      if (event.data.type === "setElement") {
        console.log("Message type 'setElement' received");

        const { targetElement, elementDimensions } = event.data;
        console.log("Received targetElement:", targetElement);
        console.log("Received elementDimensions:", elementDimensions);

        // Update DOM element if not already initialized
        if (!initialized && targetElement) {
          console.log("Setting DOM element for the first time...");
          setDomEl(targetElement);
          setInitialized(true);
          console.log("DOM element initialized:", targetElement);
        } else {
          console.log("Skipping DOM element update (already initialized).");
        }
      } else {
        console.warn("Received unknown message type:", event.data.type);
      }
    };

    // Add message event listener
    console.log("Setting up message listener...");
    window.addEventListener("message", handleMessage);

    return () => {
      console.log("Cleaning up message listener...");
      window.removeEventListener("message", handleMessage);
    };
  }, [initialized]);

  return (
    <>
      {/* HTML content as an overlay */}
      <Html zIndexRange={[-1, -10]} prepend fullscreen>
        <div
          ref={(el) => {
            if (!initialized && el !== null) {
              console.log("DOM element ref set:", el);
              setDomEl(el);
            } else if (el === null) {
              console.warn("DOM element ref is null.");
            } else {
              console.log("Skipping DOM element ref set (already initialized).");
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
