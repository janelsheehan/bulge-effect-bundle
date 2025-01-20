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

    convertDomToCanvas();

    const debouncedResize = debounce(() => {
      convertDomToCanvas();
    }, 100);

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [domEl]);

  return texture; 
};

function Lights() {
  const pointLightRef = useRef();
  return <pointLight ref={pointLightRef} color="#ffffff" intensity={30} distance={12} decay={1} position={[2, 4, 6]} />;
}

function Scene() {
  const state = useThree();
  const { width, height } = state.viewport;
  const [domEl, setDomEl] = useState(null); 
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

  useEffect(() => {
    const handleMessage = (event) => {
      // Check if the message is coming from the expected origin (Framer)
      console.log("Received message from:", event.origin); // Log the origin of the message
      if (event.origin !== "https://batty-cv.framer.ai") {
        console.warn("Received message from an unexpected origin:", event.origin);
        return;
      }

      // Handle the received message
      if (event.data.type === "setElement") {
        console.log("Message type 'setElement' received");

        // Only set the initial element to be used inside the iframe
        const { targetElement, elementDimensions } = event.data;
        console.log("Received targetElement:", targetElement);
        console.log("Received elementDimensions:", elementDimensions);

        // At this point, do not manipulate the .dom-element on GitHub Pages
        // Initial DOM setup should already have occurred when the iframe was loaded

        // Log that the element setup has been completed on GitHub Pages
        console.log("Element setup complete on GitHub Pages, no further DOM updates after initial load.");
      } else {
        console.warn("Received message with unknown type:", event.data.type);
      }
    };

    // Listen for messages from the Framer iframe
    console.log("Setting up message listener for 'setElement' events");
    window.addEventListener("message", handleMessage);

    // Clean up listener when component is unmounted
    return () => {
      console.log("Cleaning up message listener");
      window.removeEventListener("message", handleMessage);
    };
  }, [domEl]);

  return (
    <>
      <Html zIndexRange={[-1, -10]} prepend fullscreen>
        <div
          ref={(el) => {
            setDomEl(el);
            console.log("DOM element ref set: ", el); // Debug log when DOM element ref is set
          }}
          className="dom-element"
          style={{
            fontSize: "clamp(100px, 17vw, 200px)", 
          }}
        >
          <p>Bulge <br />Effect</p>
        </div>
      </Html>

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
