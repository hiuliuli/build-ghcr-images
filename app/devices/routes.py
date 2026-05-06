import socket

from flask import request, jsonify

from app import db
from app.devices import devices_bp
from app.models import Device
from app.utils import build_magic_packet


@devices_bp.route("/", methods=["GET"])
def list_devices():
    devices = db.session.execute(db.select(Device)).scalars().all()
    return jsonify([_serialize(d) for d in devices])


@devices_bp.route("/", methods=["POST"])
def create_device():
    data = request.get_json(silent=True) or {}
    required = ["device_name", "host", "port", "mac"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    device = Device(
        device_name=data["device_name"],
        host=data["host"],
        port=data["port"],
        mac=data["mac"],
    )
    db.session.add(device)
    db.session.commit()
    return jsonify(_serialize(device)), 201


@devices_bp.route("/<device_id>", methods=["GET"])
def get_device(device_id):
    device = db.session.get(Device, device_id)
    if device is None:
        return jsonify({"error": "Device not found"}), 404
    return jsonify(_serialize(device))


@devices_bp.route("/<device_id>", methods=["PUT"])
def update_device(device_id):
    device = db.session.get(Device, device_id)
    if device is None:
        return jsonify({"error": "Device not found"}), 404

    data = request.get_json(silent=True) or {}
    for field in ("device_name", "host", "port", "mac"):
        if field in data:
            setattr(device, field, data[field])

    db.session.commit()
    return jsonify(_serialize(device))


@devices_bp.route("/<device_id>", methods=["DELETE"])
def delete_device(device_id):
    device = db.session.get(Device, device_id)
    if device is None:
        return jsonify({"error": "Device not found"}), 404

    db.session.delete(device)
    db.session.commit()
    return jsonify({"message": "Device deleted"}), 200


@devices_bp.route("/<device_id>/wake", methods=["POST"])
def wake_device(device_id):
    device = db.session.get(Device, device_id)
    if device is None:
        return jsonify({"error": "Device not found"}), 404

    packet = build_magic_packet(device.mac)

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.sendto(packet, (device.host, device.port))

    return jsonify({"message": f"Magic packet sent to {device.device_name}"}), 200


def _serialize(device: Device) -> dict:
    return {
        "id": device.id,
        "device_name": device.device_name,
        "host": device.host,
        "port": device.port,
        "mac": device.mac,
        "created_at": device.created_at.isoformat(),
        "updated_at": device.updated_at.isoformat(),
    }
