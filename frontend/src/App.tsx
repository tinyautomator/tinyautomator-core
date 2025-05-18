import "./App.css";
import TinyAutomator from './components/landing-page/tiny-automator';

function App() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100vw", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 0, minHeight: "100vh", minWidth: "100vw" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <TinyAutomator />
      </div>
    </div>
  );
}

export default App;