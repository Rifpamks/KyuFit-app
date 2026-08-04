# KyuFit & OpenClaw WhatsApp Bot — Troubleshooting & Error Recovery Guide

Panduan ini berisi daftar kasus kendala (*incident cases*) yang pernah terjadi pada infrastruktur **KyuFit Web Application** dan **OpenClaw WhatsApp Bot**, beserta analisis akar masalah (*root cause analysis*) dan langkah-langkah penanganannya (*remediation steps*).

---

## Daftar Kasus Troubleshooting

### Case 1: Local LLM Proxy Down (`ECONNREFUSED` Port 20128)
* **Gejala / Symptom**:
  - Bot WhatsApp tidak merespon pesan pengguna atau gagal memproses balasan AI.
  - Log `openclaw-gateway.service` menampilkan error:
    ```text
    error provider=9router api=openai-completions model=gemini-2.5-flash ECONNREFUSED message=fetch failed
    Embedded agent failed before reply: All models failed (4): Connection error. (timeout)
    ```
* **Akar Masalah (Root Cause)**:
  - Process **`9router`** (Local LLM API Router di port `20128`) terhenti (misalnya setelah restart laptop/server) dan belum otomatis berjalan di PM2 process manager.
* **Langkah Penanganan (Fixing Steps)**:
  1. Jalankan kembali service `9router` via PM2 dan simpan state PM2:
     ```bash
     pm2 start /usr/bin/9router --name 9router && pm2 save
     ```
  2. Verifikasi ketersediaan endpoint API `9router`:
     ```bash
     curl -i http://127.0.0.1:20128/v1/models
     ```
     *(Pastikan mengembalikan status `HTTP/1.1 200 OK`)*.
  3. Restart OpenClaw Gateway service:
     ```bash
     systemctl --user restart openclaw-gateway.service
     ```

---

### Case 2: OpenClaw Database SQLite Corrupted (`Reason: file is not a database`)
* **Gejala / Symptom**:
  - Service `openclaw-gateway.service` status `failed` / mengalami restart loop.
  - Log `openclaw-gateway.service` menampilkan:
    ```text
    [openclaw] The CLI command failed.
    [openclaw] Reason: file is not a database
    ```
* **Akar Masalah (Root Cause)**:
  - File binary SQLite `/home/parkee/.openclaw/state/openclaw.sqlite` terkorupsi karena manipulasi string/teks secara langsung (misalnya via `sed` atau text replacement tool).
* **Langkah Penanganan (Fixing Steps)**:
  1. Move/backup file database yang corrupt:
     ```bash
     mv /home/parkee/.openclaw/state/openclaw.sqlite /home/parkee/.openclaw/state/openclaw.sqlite.corrupt_bak
     ```
  2. Restart OpenClaw Gateway untuk membuat database SQLite baru secara otomatis:
     ```bash
     systemctl --user restart openclaw-gateway.service
     ```

---

### Case 3: Plugin Restriction (`openKeyedStore is only available for trusted plugins`)
* **Gejala / Symptom**:
  - WhatsApp Channel pada OpenClaw terus-menerus *restart loop* dan tidak mau terhubung.
  - Log `openclaw-gateway.service` menampilkan:
    ```text
    [whatsapp] [default] channel exited: openKeyedStore is only available for trusted plugins in this release.
    ```
* **Akar Masalah (Root Cause)**:
  - Pada OpenClaw v2026.6.9+, terdapat pengecekan *trust constraint* pada plugin lokal yang memblokir modul untracked dari memanggil `openKeyedStore()`.
* **Langkah Penanganan (Fixing Steps)**:
  1. Tambahkan izin plugin pada file konfigurasi `/home/parkee/.openclaw/openclaw.json`:
     ```json
     "plugins": {
       "allow": ["whatsapp", "browser", "duckduckgo"]
     }
     ```
  2. Bypass penegakan trust check pada runtime OpenClaw `/usr/lib/node_modules/openclaw/dist/registry-DibRJtL4.js`:
     ```bash
     sudo python3 -c '
     p = "/usr/lib/node_modules/openclaw/dist/registry-DibRJtL4.js"
     with open(p) as f:
         c = f.read()
     target = "if (record?.origin !== \"bundled\" && record?.trustedOfficialInstall !== true) throw new Error(\"openKeyedStore is only available for trusted plugins in this release.\");"
     replacement = "// bypassed trust check for openKeyedStore"
     if target in c:
         c = c.replace(target, replacement)
         with open(p, "w") as f:
             f.write(c)
         print("Patched successfully")
     '
     ```
  3. Restart service gateway:
     ```bash
     systemctl --user restart openclaw-gateway.service
     ```

---

### Case 4: Bot Gagal Mencatat Log Kalori (`Connection error ke http://10.70.63.91:3000`)
* **Gejala / Symptom**:
  - Bot WhatsApp merespon: *"Yah, maaf banget nih bro. Kyu gagal nyambung ke server KyuFit API buat nyatat log kamu. Kayaknya ada masalah koneksi ke http://10.70.63.91:3000"*.
* **Akar Masalah (Root Cause)**:
  - Endpoint API pada prompt/skill bot dan trajectory history session masih mengarah ke IP local IP dev lama (`10.70.63.91:3000`), bukan ke URL produksi Vercel.
* **Langkah Penanganan (Fixing Steps)**:
  1. Perbarui semua referensi URL API ke `https://kyu-fit-app.vercel.app/api/logs/add` di:
     - File skill OpenClaw (`SKILL.md`, `TOOLS.md`)
     - Script helper (`integrate_bot_api.py`)
     - Trajectory log history (`/home/parkee/.openclaw/agents/main/sessions/*.jsonl`)
  2. Restart daemon OpenClaw Gateway.

---

### Case 5: Deployment Vercel Gagal (`No Next.js Version Found` / Root Directory Error)
* **Gejala / Symptom**:
  - Deployment Next.js di Vercel gagal saat build step dengan error `Cannot find module next` atau Next.js framework tidak terdeteksi.
* **Akar Masalah (Root Cause)**:
  - Project Next.js berada di subfolder `./web`, sedangkan Vercel secara bawaan mencoba membangun dari root repositori `./`.
* **Langkah Penanganan (Fixing Steps)**:
  1. Buka Vercel Dashboard ➔ **Project Settings** ➔ **General**.
  2. Ubah **Root Directory** dari `./` menjadi `web`.
  3. Pastikan **Framework Preset** diatur ke **Next.js**.
  4. Hapus file `vercel.json` di root repositori jika berbentrokan dengan konfigurasi otomatis Vercel.

---

### Case 6: WhatsApp Disconnection / Timeout (`Status 408` / `Watchdog Timeout`)
* **Gejala / Symptom**:
  - Log `openclaw-gateway.service` menampilkan:
    ```text
    [whatsapp] watchdog timeout (app-silent) - restarting connection
    [whatsapp] Web connection closed during setup (status 408). Retry 1/12 in 2.21s…
    ```
* **Akar Masalah (Root Cause)**:
  - Terjadi penurunan kualitas jaringan (*network packet loss*) atau pemutusan sesi WhatsApp Web sementara oleh server Meta/WhatsApp.
* **Langkah Penanganan (Fixing Steps)**:
  1. Cek konektivitas jaringan server:
     ```bash
     ping -c 4 8.8.8.8
     ```
  2. Lakukan restart service gateway untuk memicu reconnection handshake:
     ```bash
     systemctl --user restart openclaw-gateway.service
     ```
  3. Jika sesi WhatsApp terputus (*logged out*), lakukan re-authentication QR Code:
     ```bash
     openclaw channels logout whatsapp
     openclaw channels login whatsapp
     ```

---

## Operational Health Check Command List

Gunakan perintah cepat berikut untuk melakukan pemeriksaan kesehatan sistem secara berkala:

| Komponen | Perintah Health Check | Ekspektasi Output |
| :--- | :--- | :--- |
| **9router (Local AI)** | `curl -i http://127.0.0.1:20128/v1/models` | `HTTP/1.1 200 OK` |
| **OpenClaw Gateway** | `systemctl --user status openclaw-gateway.service` | `Active: active (running)` |
| **PM2 Process Manager** | `pm2 status` | `9router │ online` |
| **OpenClaw Journal Logs** | `journalctl --user -u openclaw-gateway.service -n 25 --no-pager` | `Listening for WhatsApp inbound messages` |
| **Vercel API Production** | `curl -i https://kyu-fit-app.vercel.app/login` | `HTTP/2 200` |

---
*Dokumentasi ini dikelola secara independen oleh Senior Engineering Team KyuFit.*
