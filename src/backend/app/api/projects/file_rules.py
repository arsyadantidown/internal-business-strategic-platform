"""Aturan validasi upload file project: tipe diperiksa dari isi file (magic bytes), bukan dari nama file
atau Content-Type kiriman klien yang bisa dipalsukan, plus batas ukuran per kategori."""

import re
import zipfile
from typing import BinaryIO

from app.settings import settings

MB = 1024 * 1024

# kategori -> {mime: ekstensi}
ALLOWED_TYPES: dict[str, dict[str, str]] = {
    "image": {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"},
    "video": {"video/mp4": ".mp4", "video/webm": ".webm"},
    "document": {
        "application/pdf": ".pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    },
    "case_study": {"application/pdf": ".pdf"},
}

OOXML_TYPES = {
    "word/": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "ppt/": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "xl/": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def max_bytes(category: str) -> int:
    limits = {
        "image": settings.PROJECT_FILE_MAX_IMAGE_MB,
        "video": settings.PROJECT_FILE_MAX_VIDEO_MB,
        "document": settings.PROJECT_FILE_MAX_DOCUMENT_MB,
        "case_study": settings.PROJECT_FILE_MAX_CASE_STUDY_MB,
    }
    return limits[category] * MB


def detect_mime(fileobj: BinaryIO) -> str | None:
    """Tipe file berdasarkan isinya, atau None bila bukan salah satu tipe yang didukung."""
    fileobj.seek(0)
    head = fileobj.read(16)
    fileobj.seek(0)

    if head.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "image/webp"
    if head[4:8] == b"ftyp":
        return "video/mp4"
    if head.startswith(b"\x1a\x45\xdf\xa3"):
        return "video/webm"
    if head.startswith(b"%PDF-"):
        return "application/pdf"
    if head.startswith(b"PK\x03\x04"):
        try:
            names = zipfile.ZipFile(fileobj).namelist()
        except zipfile.BadZipFile:
            return None
        finally:
            fileobj.seek(0)
        if "[Content_Types].xml" in names:
            for prefix, mime in OOXML_TYPES.items():
                if any(name.startswith(prefix) for name in names):
                    return mime
    return None


def clean_filename(name: str | None) -> str:
    """Nama file asli untuk ditampilkan: tanpa path folder dan tanpa karakter kontrol."""
    name = (name or "").replace("\\", "/").split("/")[-1]
    name = re.sub(r"[\x00-\x1f\x7f]", "", name).strip()
    return (name or "file")[:255]
