import API from "./config"; // axios o tu wrapper

export const analizarAudio = async (uri, duration, userId = null) => {
  try {
    const formData = new FormData();

    const filename = uri.split("/").pop();
    const ext = filename.split(".").pop();

    formData.append("audio", {
      uri,
      name: filename,
      type: `audio/${ext}`,
    });

    formData.append("duration", String(duration));

    if (userId) {
      formData.append("user_id", String(userId));
    }

    // OJO: aquí se usa isForm = true
    const response = await API.post("/api/audio/analyze", formData, false, true);

    return response;
  } catch (error) {
    console.log("❌ ERROR EN analizarAudio:", error);
    return {
      success: false,
      error: "Error enviando audio",
    };
  }
};
