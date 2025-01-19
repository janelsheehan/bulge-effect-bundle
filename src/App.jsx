// Importing required CSS and components
import "./App.css"; // Global styles for the app
import Scene from "./Scene"; // Importing the Scene component where the 3D rendering happens
import { Canvas } from "@react-three/fiber"; // The Canvas component is from react-three/fiber, responsible for setting up the 3D rendering context
import { Leva } from "leva"; // Leva is a UI library for creating control panels for React apps

// Title3D component that will display the 3D scene inside the app
function Title3D() {
  return (
    // Container div with absolute positioning for full-screen rendering of 3D canvas
    <div className="absolute top-0 left-0 h-screen w-screen">
      <Canvas
        // dpr: Sets device pixel ratio (helps with resolution on retina displays)
        dpr={[1, 2]}
        gl={{
          antialias: true, // Enables antialiasing for smoother edges
          preserveDrawingBuffer: true, // Allows saving the drawing buffer for things like screenshots
        }}
        camera={{
          fov: 55, // Field of view, controls how much of the scene is visible
          near: 0.1, // The near clipping plane for camera visibility
          far: 200, // The far clipping plane for camera visibility
        }}
      >
        {/* The Scene component where 3D objects and animations are defined */}
        <Scene />
      </Canvas>
    </div>
  );
}

// HeaderComponent for the top bar of the app
function HeaderComponent() {
  return (
    <header className="relative z-50 mx-7 flex max-lg:flex-col justify-between py-6 border-b border-white/60 pointer-events-auto">
      <div className="whitespace-nowrap">
        <h1 className="font-bold inline align-middle mr-2">Bulge Text Effect</h1>
        {/* Link to the article explaining the project */}
        <a title="Read the article" href="https://tympanus.net/codrops/?p=76625">
          <svg
            className="h-3 ml-0.5 inline-block align-middle"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.00006 0.25H11.7501V11H10.2501V2.81066L1.53039 11.5303L0.469727 10.4697L9.1894 1.75H1.00006V0.25Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </header>
  );
}

// Credits component that appears at the bottom of the screen
function Credits() {
  return (
    <div className="flex fixed w-full justify-between bottom-0 p-8">
      <p>
        Made by <a href="https://twitter.com/romanjeanelie">@romanjeanelie</a> for{" "}
        <a href="https://twitter.com/codrops">@codrops</a>
      </p>
      <a href="https://tympanus.net/codrops/demos" className="all-demos">
        All Demos
      </a>
    </div>
  );
}

// Aside component for additional info, usually displayed on the right side of the screen
function Aside() {
  return (
    <div className="absolute top-1/2 right-16 text-lg">
      <p className="mb-4 opacity-50">TENDER</p>
      <p>
        App that helps <br />
        to find your best partner
      </p>
      <p className="mt-40 opacity-50">LAUNCH IN 2024</p>
    </div>
  );
}

// Main App component
function App() {
  return (
    <>
      {/* The Leva control panel to adjust settings for the app */}
      <Leva
        collapsed={false} // If the Leva panel starts collapsed or expanded
        flat={true} // Flattens the controls for a more minimalistic UI
        hidden // Hides the Leva UI by default, you can make it visible if needed
        theme={{
          sizes: {
            titleBarHeight: "28px", // Custom height for title bar
          },
          fontSizes: {
            root: "10px", // Adjust font size for the controls
          },
        }}
      />
      {/* Main content wrapper */}
      <main className="font-sans">
        <HeaderComponent /> {/* Header with title and link */}
        <Title3D /> {/* 3D canvas with the animation */}
        <Aside /> {/* Additional info or controls */}
        <Credits /> {/* Credits for the project */}
      </main>
    </>
  );
}

// Export the App component so it can be used in the main entry point (index.js)
export default App;
