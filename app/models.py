from datetime import datetime, timezone

from app import db
from app.utils import generate_id


class Device(db.Model):
    __tablename__ = "devices"

    id = db.Column(db.String(10), primary_key=True, default=generate_id)
    device_name = db.Column(db.String(128), nullable=False)
    host = db.Column(db.String(255), nullable=False)
    port = db.Column(db.Integer, nullable=False)
    mac = db.Column(db.String(17), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
