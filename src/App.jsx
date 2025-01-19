// Importing necessary styles and components
import "./App.css"; // Global styles for the app
import Scene from "./Scene"; // Importing the Scene component where the 3D rendering happens
import { Canvas } from "@react-three/fiber"; // The Canvas component for the 3D context

// Title3D component that displays the 3D scene inside the app
function Title3D() {
  return (
    // Full-screen 3D canvas rendering
    <div className="absolute top-0 left-0 h-screen w-screen">
      <Canvas
        dpr={[1, 2]} // Device pixel ratio (higher resolution for retina displays)
        gl={{
          antialias: true, // Enable antialiasing for smooth edges
          preserveDrawingBuffer: true, // Enable saving buffer for screenshot capability
        }}
        camera={{
          fov: 55, // Field of view of the camera
          near: 0.1, // Near clipping plane
          far: 200, // Far clipping plane
        }}
      >
        {/* Scene component where the 3D scene setup occurs */}
        <Scene />
      </Canvas>
    </div>
  );
}

// Main App component
function App() {
  return (
    <main className="font-sans">
      {/* 3D Title Scene */}
      <Title3D />
    </main>
  );
}

// Export the App component for use in the main entry point (index.js)
export default App;
