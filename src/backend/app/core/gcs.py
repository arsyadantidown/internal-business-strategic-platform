"""Helper Google Cloud Storage untuk file project.

Bucket dibuat privat: file tidak pernah dibuka publik, hanya lewat signed URL berumur pendek.
Library google-cloud-storage bersifat sinkron, jadi semua pemanggilan dijalankan di thread terpisah
supaya event loop FastAPI tidak tertahan. Di test, ganti `get_storage` dengan storage palsu
(`app.dependency_overrides`)."""

import asyncio
import logging
from datetime import timedelta
from typing import BinaryIO, Protocol

from app.settings import settings

logger = logging.getLogger(__name__)


class StorageError(Exception):
    """Operasi ke GCS gagal (jaringan, kredensial, bucket tidak ada, dsb.)."""


class ObjectStorage(Protocol):
    async def upload(self, key: str, fileobj: BinaryIO, content_type: str) -> None: ...

    async def delete(self, key: str) -> None: ...

    async def signed_url(self, key: str, *, filename: str, content_type: str) -> str: ...


class GCSStorage:
    def __init__(self, bucket_name: str, credentials_file: str = ""):
        if not bucket_name:
            raise StorageError("GCS_BUCKET_NAME belum diatur.")
        self._bucket_name = bucket_name
        self._credentials_file = credentials_file
        self._client = None

    def _bucket(self):
        # Import dan koneksi ditunda sampai benar-benar dipakai, supaya aplikasi (dan test) tetap
        # bisa jalan tanpa kredensial GCS.
        if self._client is None:
            from google.cloud import storage

            self._client = (
                storage.Client.from_service_account_json(self._credentials_file)
                if self._credentials_file
                else storage.Client()
            )
        return self._client.bucket(self._bucket_name)

    async def upload(self, key: str, fileobj: BinaryIO, content_type: str) -> None:
        def run():
            fileobj.seek(0)
            self._bucket().blob(key).upload_from_file(fileobj, content_type=content_type, rewind=True)

        try:
            await asyncio.to_thread(run)
        except Exception as error:
            logger.exception("Upload ke GCS gagal: %s", key)
            raise StorageError("Upload file ke penyimpanan gagal.") from error

    async def delete(self, key: str) -> None:
        def run():
            from google.api_core.exceptions import NotFound

            try:
                self._bucket().blob(key).delete()
            except NotFound:
                pass  # sudah tidak ada: tujuan hapus tercapai

        try:
            await asyncio.to_thread(run)
        except Exception as error:
            logger.exception("Hapus file di GCS gagal: %s", key)
            raise StorageError("Hapus file di penyimpanan gagal.") from error

    async def signed_url(self, key: str, *, filename: str, content_type: str) -> str:
        safe_name = "".join(ch for ch in filename if ch not in '"\\\r\n') or "download"

        def run():
            return self._bucket().blob(key).generate_signed_url(
                version="v4",
                expiration=timedelta(seconds=settings.GCS_SIGNED_URL_TTL_SECONDS),
                method="GET",
                response_type=content_type,
                response_disposition=f'attachment; filename="{safe_name}"',
            )

        try:
            return await asyncio.to_thread(run)
        except Exception as error:
            logger.exception("Membuat signed URL gagal: %s", key)
            raise StorageError("Membuat link unduhan gagal.") from error


_storage: GCSStorage | None = None


def get_storage() -> ObjectStorage:
    """Dependency FastAPI. Satu instance dipakai bersama."""
    global _storage
    if _storage is None:
        _storage = GCSStorage(settings.GCS_BUCKET_NAME, settings.GCS_CREDENTIALS_FILE)
    return _storage
