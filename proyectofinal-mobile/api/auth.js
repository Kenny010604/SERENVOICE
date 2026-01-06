import API from "./config";

// LOGIN
export async function loginUser({ correo, contrasena }) {
  try {
    const res = await API.post("/login", {
      correo,
      contrasena,
    });

    return {
      success: true,
      user: res.data.user,
    };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al iniciar sesión",
    };
  }
}

// REGISTER
export async function registerUser(data) {
  try {
    const res = await API.post("/register", data);

    return {
      success: true,
      user: res.data.user,
    };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error al registrarse",
    };
  }
}
