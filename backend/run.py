from app import create_app
import os
from database.config import Config

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = Config.DEBUG

    app.run(
        host="0.0.0.0",
        port=port,
        debug=debug,
        use_reloader=False   # 🔥 NECESARIO PARA EVITAR EL CRASH
    )
