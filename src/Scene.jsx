import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import CustomShaderMaterial from "three-custom-shader-material";
import html2canvas from "html2canvas";

// Custom hook to convert DOM element into a Three.js texture
const useDomToCanvas = (domEl) => {
  const [texture, setTexture] = useState();

  useEffect(() => {
    if (!domEl) {
      console.log("No DOM element provided for texture conversion.");
      return;
    }

    const convertDomToCanvas = async () => {
      console.log("Converting DOM element to canvas...");
      const canvas = await html2canvas(domEl, { backgroundColor: null });
      console.log("Canvas generated from DOM element:", canvas);
      setTexture(new THREE.CanvasTexture(canvas));
    };

    convertDomToCanvas();

    const debouncedResize = () => {
      convertDomToCanvas();
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [domEl]);

  return texture;
};

// Main Scene component
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
      // Log the incoming event data
      console.log("Received message from Framer iframe:", event);

      if (event.origin !== "https://your-github-username.github.io") {
        console.log("Message from untrusted origin:", event.origin);
        return;
      }

      const { type, elementData } = event.data;

      if (type === "RENDER_ELEMENT" && elementData) {
        console.log("Rendering new element from Framer:", elementData);
        const div = document.querySelector(".dom-element");

        if (div) {
          div.innerHTML = "";
          div.appendChild(elementData.cloneNode(true)); // Clone and insert the element
          console.log("DOM element inserted into .dom-element div");
        } else {
          console.error("No .dom-element div found to insert the content.");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Logging the texture update whenever it changes
  useEffect(() => {
    if (textureDOM) {
      console.log("Texture updated with new DOM content:", textureDOM);
    }
  }, [textureDOM]);

  return (
    <>
      <Html zIndexRange={[-1, -10]} prepend fullscreen>
        <div ref={(el) => setDomEl(el)} className="dom-element">
          {/* Debugging log for DOM element */}
          {domEl && <div>DOM Element rendered inside iframe: {domEl}</div>}
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
        {/* Add lights and any other 3D objects here */}
      </mesh>
    </>
  );
}

export default Scene;
