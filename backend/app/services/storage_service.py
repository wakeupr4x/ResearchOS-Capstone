import os
import shutil
from pathlib import Path
from typing import Tuple
from app.config.settings import settings


class StorageService:
    """Local filesystem storage adapter, ready for S3 / GCS cloud backend."""

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.storage_dir = Path(settings.STORAGE_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, filename: str, content: bytes) -> Tuple[str, int]:
        """Saves file content to disk and returns (file_path, size_bytes)."""
        safe_filename = Path(filename).name
        destination = self.upload_dir / safe_filename

        with open(destination, "wb") as f:
            f.write(content)

        return str(destination.resolve()), len(content)

    def get_file(self, file_path: str) -> bytes:
        """Reads file bytes from storage."""
        with open(file_path, "rb") as f:
            return f.read()

    def delete_file(self, file_path: str) -> bool:
        """Deletes file from storage."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
        return False


storage_service = StorageService()
