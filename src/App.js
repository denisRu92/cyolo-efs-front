import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";

import UploadFiles from "./components/UploadFiles";


function App() {
  return (
    <div className="container central" style={{ width: "600px" }}>
      <div style={{ margin: "20px 0" }}>
        <h3>Ephemeral File Sharing</h3>
      </div>
      <UploadFiles />
    </div>
  );
}

export default App;
