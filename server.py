"""DesignFlow Studio local-first development server.

Runs entirely on the local machine, serves the desktop-style web interface and
persists application state to data/state.json. The UI remains usable in demo
mode without external API credentials.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import socket
import sys
import threading
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


BUNDLE_ROOT = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
PROJECT_ROOT = Path(__file__).resolve().parent
CONFIG_ROOT = Path(sys.executable).resolve().parent if getattr(sys, "frozen", False) else PROJECT_ROOT


def load_local_env(path: Path) -> None:
    """Load a local .env file without adding a runtime dependency."""
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        name = name.strip()
        value = value.strip().strip('"').strip("'")
        if name:
            os.environ.setdefault(name, value)


load_local_env(CONFIG_ROOT / ".env")
if getattr(sys, "frozen", False):
    # The packaged executable lives in dist/, while local development keeps
    # the private .env one directory above it. Never bundle the secret itself.
    load_local_env(CONFIG_ROOT.parent / ".env")
APP_DIR = BUNDLE_ROOT / "app"
ASSET_DIR = BUNDLE_ROOT / "assets"
if getattr(sys, "frozen", False):
    DATA_DIR = Path(
        os.environ.get("DESIGNFLOW_DATA_DIR")
        or Path(os.environ.get("LOCALAPPDATA", Path.home())) / "DesignFlow Studio" / "data"
    )
else:
    DATA_DIR = PROJECT_ROOT / "data"
STATE_FILE = DATA_DIR / "state.json"
STATE_LOCK = threading.Lock()


def public_api_config() -> dict:
    return {
        "provider": "qwen",
        "userKeyRequired": True,
        "model": "qwen-image-3.0-pro",
        "maxBatchSize": 24,
    }


def ensure_state() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        STATE_FILE.write_text("{}", encoding="utf-8")


def read_state() -> dict:
    ensure_state()
    with STATE_LOCK:
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}


def write_state(payload: dict) -> None:
    ensure_state()
    temp = STATE_FILE.with_suffix(".tmp")
    with STATE_LOCK:
        temp.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temp.replace(STATE_FILE)


class DesignFlowHandler(BaseHTTPRequestHandler):
    server_version = "DesignFlow/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print(f"[DesignFlow] {self.address_string()} - {fmt % args}")

    def _send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path: Path) -> None:
        if not path.exists() or not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return
        content_type, _ = mimetypes.guess_type(path.name)
        data = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    def _body_json(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
            return payload if isinstance(payload, dict) else {}
        except (UnicodeDecodeError, json.JSONDecodeError):
            return {}

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path == "/api/health":
            self._send_json({"ok": True, "version": "1.0.0", "mode": "local", **public_api_config()})
            return
        if path == "/api/config":
            self._send_json(public_api_config())
            return
        if path == "/api/state":
            self._send_json(read_state())
            return
        if path == "/":
            self._send_file(APP_DIR / "index.html")
            return

        if path.startswith("/assets/"):
            candidate = (ASSET_DIR / path.removeprefix("/assets/")).resolve()
            if ASSET_DIR.resolve() not in candidate.parents:
                self.send_error(HTTPStatus.FORBIDDEN)
                return
            if not candidate.exists():
                app_asset = (APP_DIR / "assets" / path.removeprefix("/assets/")).resolve()
                if (APP_DIR / "assets").resolve() in app_asset.parents:
                    candidate = app_asset
            self._send_file(candidate)
            return

        candidate = (APP_DIR / path.lstrip("/")).resolve()
        if APP_DIR.resolve() not in candidate.parents:
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        self._send_file(candidate)

    def do_PUT(self) -> None:  # noqa: N802
        if urlparse(self.path).path != "/api/state":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        payload = self._body_json()
        if not payload:
            self._send_json(
                {"ok": False, "message": "状态数据为空或格式不正确"},
                HTTPStatus.BAD_REQUEST,
            )
            return
        write_state(payload)
        self._send_json({"ok": True})

    def do_POST(self) -> None:  # noqa: N802
        if urlparse(self.path).path != "/api/shutdown":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        self._send_json({"ok": True, "message": "创想设计平台已安全退出"})
        threading.Thread(target=self.server.shutdown, daemon=True).start()


def available_port(preferred: int) -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        try:
            probe.bind(("127.0.0.1", preferred))
            return preferred
        except OSError:
            probe.bind(("127.0.0.1", 0))
            return int(probe.getsockname()[1])


def main() -> None:
    parser = argparse.ArgumentParser(description="Run DesignFlow Studio locally")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8765, type=int)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    ensure_state()
    port = available_port(args.port)
    address = f"http://{args.host}:{port}"
    server = ThreadingHTTPServer((args.host, port), DesignFlowHandler)
    print(f"创想设计平台已启动：{address}")
    print("按 Ctrl+C 停止。数据仅保存在本机 data/state.json。")
    if not args.no_browser:
        threading.Timer(0.8, lambda: webbrowser.open(address)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
