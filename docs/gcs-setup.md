# Menjalankan Upload File Portfolio (Google Cloud Storage)

Endpoint upload/download file project (gambar, video, dokumen, case study) menyimpan file di bucket GCS **private**. Download memakai signed URL yang berlaku 5 menit.

Agar upload bisa dijalankan di komputer lokal, ikuti langkah berikut.

## 1. Minta file key (JSON)

Minta file service account key (`.json`) langsung ke pemilik project GCP, lewat chat pribadi.

**Jangan pernah:**
- meng-commit file key ke GitHub (repo ini public)
- mengirim isi key ke grup chat atau menempelnya di issue/PR

## 2. Taruh key di folder `secrets/`

Buat folder `secrets` di root repo, lalu simpan key dengan nama `gcs-key.json`:

```
internal-business-strategic-platform/
  secrets/
    gcs-key.json
```

Folder `secrets/` sudah masuk `.gitignore`, jadi tidak ikut ter-commit.

Kalau key kamu simpan di folder lain, set variabel `GCS_KEY_DIR` ke folder tersebut sebelum menjalankan compose.

## 3. Isi konfigurasi di `development.env`

Buka `src/backend/app/config/env/development.env` dan tambahkan:

```
GCS_BUCKET_NAME=<nama bucket, tanya pemilik GCP>
GCS_CREDENTIALS_FILE=/secrets/gcs-key.json
```

Nilai `/secrets/gcs-key.json` adalah lokasi di dalam container (jangan diganti dengan path Windows).

## 4. Build ulang service api

```
docker compose -f deploy/compose/docker-compose.dev.yml up -d --build api
```

## 5. Tes lewat Swagger

1. Buka http://localhost:8000/docs
2. Login lewat endpoint auth, lalu klik **Authorize**
3. Coba endpoint upload file pada bagian Projects (butuh permission `portfolio.manage`)
4. Coba endpoint download. Hasilnya adalah signed URL yang berlaku 5 menit.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| `FileNotFoundError: /secrets/gcs-key.json` | Folder `secrets/` belum ada atau belum ter-mount | Cek langkah 2, lalu build ulang |
| Upload gagal 403 dari GCS | Service account tidak punya akses ke bucket | Minta pemilik GCP mengecek peran akun |
| Konfigurasi tidak terbaca | Variabel ditulis di `.env` root | Tulis di `development.env` (dibaca oleh service api) |
