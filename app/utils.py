import random
import string


def generate_id() -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=10))


def build_magic_packet(mac: str) -> bytes:
    mac = mac.replace(":", "").replace("-", "").replace(".", "")
    mac_bytes = bytes.fromhex(mac)
    return b"\xff" * 6 + mac_bytes * 16
