import "./App.css";
import { LandingPage } from "./components/shared/LandingPage";
import BrainWandEarthMorph from "./components/shared/BrainWandEarthMorph";

function App() {
  return (
    <>
        <div className="w-full h-screen bg-black">
      <BrainWandEarthMorph />
    </div>
    <div id="root">
      <LandingPage />
    </div>

    </>
  );
}

export default App;
