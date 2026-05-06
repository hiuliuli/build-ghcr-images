import os

from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app() -> Flask:
    app = Flask(__name__)

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(project_root, "data", "wol.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

    db.init_app(app)

    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    from app import models  # noqa: F401
    from app.devices import devices_bp

    app.register_blueprint(devices_bp)

    @app.route("/")
    def index():
        return render_template("devices/index.html")

    with app.app_context():
        db.create_all()

    return app
