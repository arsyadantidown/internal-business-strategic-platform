import logging
import uuid
from typing import BinaryIO
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.api.projects import file_rules
from app.api.projects.repository import ProjectRepository
from app.api.projects.schema import ProjectFileUpdate
from app.api.projects.serializers import serialize_file
from app.core.gcs import ObjectStorage, StorageError
from app.models.project_file_model import FILE_CATEGORIES, ProjectFile
from app.settings import settings

logger = logging.getLogger(__name__)

CASE_STUDY_TAKEN = "Project ini sudah punya case study. Hapus yang lama sebelum mengunggah yang baru."


def storage_unavailable(error: StorageError) -> HTTPException:
    return HTTPException(502, str(error))


class ProjectFileUseCase:
    def __init__(self, repository: ProjectRepository, storage: ObjectStorage):
        self.repository = repository
        self.storage = storage

    async def _ensure_project(self, project_id: UUID) -> None:
        if not await self.repository.project_is_live(project_id):
            raise HTTPException(404, "Project tidak ditemukan.")

    async def _get_file_or_404(self, project_id: UUID, file_id: UUID) -> ProjectFile:
        await self._ensure_project(project_id)
        item = await self.repository.get_file(project_id, file_id)
        if item is None:
            raise HTTPException(404, "File tidak ditemukan.")
        return item

    async def upload(
        self,
        project_id: UUID,
        *,
        fileobj: BinaryIO,
        filename: str | None,
        declared_type: str | None,
        category: str,
        title: str | None,
        description: str | None,
        sort_order: int,
        user_id: UUID | None,
    ) -> dict:
        await self._ensure_project(project_id)

        if category not in FILE_CATEGORIES:
            raise HTTPException(422, f"file_category harus salah satu dari: {', '.join(FILE_CATEGORIES)}.")
        if not 0 <= sort_order <= 32767:
            raise HTTPException(422, "sort_order harus antara 0 dan 32767.")

        fileobj.seek(0, 2)
        size = fileobj.tell()
        fileobj.seek(0)

        if size == 0:
            raise HTTPException(422, "File kosong.")
        if size > file_rules.max_bytes(category):
            limit_mb = file_rules.max_bytes(category) // file_rules.MB
            raise HTTPException(413, f"Ukuran file melebihi batas {limit_mb} MB untuk kategori {category}.")

        detected = file_rules.detect_mime(fileobj)
        allowed = file_rules.ALLOWED_TYPES[category]
        if detected is None or detected not in allowed:
            raise HTTPException(
                422,
                f"Tipe file tidak diizinkan untuk kategori {category}. Diizinkan: {', '.join(sorted(allowed))}.",
            )
        # Content-Type dari klien tidak dipercaya, tapi bila diisi harus cocok dengan isi file.
        if declared_type and declared_type not in (detected, "application/octet-stream"):
            raise HTTPException(422, "Content-Type tidak cocok dengan isi file.")

        if category == "case_study" and await self.repository.case_study_exists(project_id):
            raise HTTPException(409, CASE_STUDY_TAKEN)

        key = f"projects/{project_id}/{category}/{uuid.uuid4()}{allowed[detected]}"

        try:
            await self.storage.upload(key, fileobj, detected)
        except StorageError as error:
            raise storage_unavailable(error)

        item = ProjectFile(
            project_id=project_id,
            file_category=category,
            file_name=file_rules.clean_filename(filename),
            file_title=(title or "").strip() or None,
            file_description=(description or "").strip() or None,
            mime_type=detected,
            file_size_bytes=size,
            storage_key=key,
            sort_order=sort_order,
            created_by=user_id,
        )

        try:
            self.repository.add(item)
            await self.repository.save()
        except IntegrityError:
            await self.repository.rollback()
            await self._discard_object(key)
            raise HTTPException(409, CASE_STUDY_TAKEN if category == "case_study" else "Data file bentrok.")
        except Exception:
            # Database gagal setelah file terlanjur ada di bucket: hapus supaya tidak jadi file yatim.
            await self.repository.rollback()
            await self._discard_object(key)
            raise

        return serialize_file(item)

    async def _discard_object(self, key: str) -> None:
        try:
            await self.storage.delete(key)
        except StorageError:
            logger.error("File yatim di bucket, perlu dibersihkan manual: %s", key)

    async def update(self, project_id: UUID, file_id: UUID, payload: ProjectFileUpdate) -> dict:
        item = await self._get_file_or_404(project_id, file_id)
        changes = payload.model_dump(exclude_unset=True)

        if not changes:
            raise HTTPException(400, "Tidak ada data yang diperbarui.")
        if changes.get("sort_order", 0) is None:
            raise HTTPException(422, "sort_order tidak boleh null.")

        for field, value in changes.items():
            setattr(item, field, value)

        await self.repository.save()
        return serialize_file(item)

    async def delete(self, project_id: UUID, file_id: UUID) -> None:
        item = await self._get_file_or_404(project_id, file_id)
        key = item.storage_key

        await self.repository.delete(item)
        await self.repository.save()
        # Baris database dihapus dulu. Bila hapus di bucket gagal, yang tersisa hanya file yatim
        # (tidak terlihat siapa pun); kebalikannya (baris ada, file hilang) akan merusak unduhan.
        await self._discard_object(key)

    async def download_link(self, project_id: UUID, file_id: UUID) -> dict:
        item = await self._get_file_or_404(project_id, file_id)

        try:
            url = await self.storage.signed_url(
                item.storage_key, filename=item.file_name, content_type=item.mime_type
            )
        except StorageError as error:
            raise storage_unavailable(error)

        return {
            "download_url": url,
            "expires_in_seconds": settings.GCS_SIGNED_URL_TTL_SECONDS,
            "file_name": item.file_name,
            "mime_type": item.mime_type,
            "file_size_bytes": item.file_size_bytes,
        }
