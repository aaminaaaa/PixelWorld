import "./world.css";
import PixelPets from "./PixelPets";

function App() {

return (
    <>
      <div className="cloud c1" />
      <div className="cloud c2" />
      <div className="sun" />

      <main className="title">
        <h1>Pixel World!</h1>
        <p>Choose your Pixel Pet</p>
      </main>

      <div className="grass" />
      <PixelPets groundOffset={40} />
    </>
  );
}

export default App;
