from flask import Blueprint

devices_bp = Blueprint("devices", __name__, url_prefix="/devices")

from app.devices import routes  # noqa: E402, F401
