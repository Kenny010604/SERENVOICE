import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [mensaje, setMensaje] = useState("Conectando con Flask...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/")
      .then((res) => setMensaje(res.data.mensaje))
      .catch(() => setMensaje("❌ Error al conectar con Flask"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h1>🌐 Prueba de Conexión Flask + React</h1>
      {loading ? (
        <div className="loader"></div>
      ) : (
        <p className="mensaje">{mensaje}</p>
      )}
    </div>
  );
}

export default App;
