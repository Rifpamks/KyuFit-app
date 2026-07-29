# Walkthrough: Setup WhatsApp Bot (Kyu) di Laptop Standby

Dokumen ini mendokumentasikan panduan instalasi, konfigurasi, dan modifikasi teknis lengkap yang telah dilakukan untuk menjalankan WhatsApp Bot (**Kyu**) menggunakan **9Router** dan **OpenClaw** pada laptop standby lokal (`10.70.63.89`).

---

## 🏗️ Latar Belakang & Perubahan Arsitektur

Awalnya proyek dirancang untuk berjalan di **GCP VPS (Always Free Tier)**. Namun, demi kecepatan respon, pemrosesan media (gambar makanan/minuman), dan stabilitas session WhatsApp Web, arsitektur dipindahkan ke **Laptop Standby Lokal (Host LAN/ZeroTier)** dengan spesifikasi:
* **Spesifikasi Laptop**: 8 vCPU, 7.5GB RAM (jauh lebih cepat dibanding VM gratisan GCP).
* **Alur Integrasi**:
  ```mermaid
  graph TD
      WA[WhatsApp User / Group] <-->|Pesan & Media| OC[OpenClaw Gateway]
      OC <-->|API Request| NR[9Router AI Proxy]
      NR <-->|Gemini API| AIS[Google AI Studio Free Tier]
  ```

---

## 🛠️ Langkah-Langkah Setup Lengkap

### Langkah 1: Registrasi API Key Google AI Studio (Free Tier)
Untuk menghindari pemblokiran/penahanan billing dari Google Cloud akibat saldo habis pada project lama:
1. Hubungkan Google AI Studio menggunakan akun Gmail cadangan/lain yang **tidak terhubung ke kartu kredit (Billing Account)**.
2. Buat API Key baru di bawah project *Free Tier* murni.
3. API Key yang didapatkan: `<YOUR_GEMINI_API_KEY>` (15 RPM / 1,500 RPD kuota gratis).

---

### Langkah 2: Instalasi & Daemonisasi 9Router
Untuk memastikan CLI OpenClaw mendeteksi adanya 9Router dengan benar, 9Router dipasang langsung pada host laptop (bukan di dalam container terisolasi) dan dijalankan menggunakan PM2 dalam mode *headless tray*:

1. **Instal 9Router secara global**:
   ```bash
   npm install -g 9router
   ```
2. **Jalankan via PM2 dengan flag penahan crash menu TUI**:
   ```bash
   DATA_DIR=/home/parkee/.9router pm2 start 9router --name 9router -- --tray --no-browser
   ```
   *(Flag `--tray --no-browser` mencegah loop restart PM2 saat dijalankan di lingkungan non-TTY/headless server).*

---

### Langkah 3: Update API Key ke Database SQLite 9Router
Jika dashboard web mengalami kendala akses, API Key di-inject langsung ke database SQLite 9Router (`/home/parkee/.9router/db/data.sqlite`) menggunakan skrip Node.js berikut:

```javascript
const Database = require("/usr/lib/node_modules/better-sqlite3");
const db = new Database("/home/parkee/.9router/db/data.sqlite");

// 1. Ambil data koneksi Gemini
const row = db.prepare("SELECT * FROM providerConnections WHERE provider = 'gemini'").get();
const data = JSON.parse(row.data);

// 2. Perbarui API Key dan bersihkan error state dari sisa blokir billing lama
data.apiKey = "<YOUR_GEMINI_API_KEY>";
data.testStatus = "available";
delete data.lastError;
delete data.lastErrorAt;
delete data.errorCode;
delete data.backoffLevel;

// 3. Simpan perubahan dan aktifkan provider
db.prepare("UPDATE providerConnections SET isActive = 1, data = ? WHERE provider = 'gemini'").run(JSON.stringify(data));
```

Setelah database diperbarui, lakukan restart service 9Router:
```bash
pm2 restart 9router
```

---

### Langkah 4: Konfigurasi Model di OpenClaw (`openclaw.json`)
OpenClaw diatur agar merutekan model utama dan analisis gambar ke proxy 9Router menggunakan provider `gemini`.

File konfigurasi `/home/parkee/.openclaw/openclaw.json` disesuaikan pada bagian berikut:
```json
{
  "agents": {
    "defaults": {
      "workspace": "/home/parkee/.openclaw/workspace",
      "models": {
        "9router/gemini/gemini-2.5-flash": {}
      },
      "model": {
        "primary": "9router/gemini/gemini-2.5-flash"
      },
      "imageModel": {
        "primary": "9router/gemini/gemini-2.5-flash"
      }
    }
  },
  "models": {
    "providers": {
      "9router": {
        "baseUrl": "http://127.0.0.1:20128/v1",
        "apiKey": "<YOUR_9ROUTER_API_KEY>",
        "api": "openai-completions",
        "models": [
          {
            "id": "gemini/gemini-2.5-flash",
            "name": "gemini-2.5-flash"
          }
        ]
      }
    }
  }
}
```

Setelah konfigurasi diubah, lakukan restart gateway OpenClaw:
```bash
systemctl --user restart openclaw-gateway.service
```

---

### Langkah 5: Kustomisasi Workspace Kyu (Asisten Anda)
Logika kepribadian, gaya bicara, dan data inventori disimpan pada direktori `/home/parkee/.openclaw/workspace/` yang terdiri dari berkas-berkas berikut:

* **`IDENTITY.md`**: 
  Mengatur identitas bot dengan nama **Kyu**, berkarakter *casual* dan cerdas. Kolom `- **Emoji:**` dikosongkan agar tidak memicu ikon perisai (`🛡️`) di setiap awal chat.
* **`USER.md`**:
  Mengenalkan Anda sebagai **Mas Rifaldi**, seorang *Support Engineer* di PARKEE sekaligus penggiat fitness/gym.
* **`SOUL.md`**:
  Mengatur gaya komunikasi Kyu agar **santai, asik, tidak kaku, humoris**, serta merespon langsung *to-the-point* dengan menggunakan campuran bahasa Indonesia santai dan istilah teknis Inggris (*Tech-Indonesian*).
* **`TOOLS.md`**:
  Menyimpan referensi IP lokal, alamat dashboard port 9Router/OpenClaw, dan detail penanganan restart service.
* **`AGENTS.md` (Pedoman Operasional & Fitness)**:
  * **SOP PARKEE**: Panduan menyusun draf RCA terstruktur dan pengingat keras bahwa **dilarang melakukan direct data patching** pada DB production (semua wajib melalui Ansible `97_patch_function.yml`).
  * **Troubleshooting Cepat**: Dokumentasi penanganan cepat masalah Kafka (`LEADER_NOT_AVAILABLE`) dan replikasi PostgreSQL (*repmgr*).
  * **Gym & Fitness**: Panduan asisten untuk melakukan estimasi kalori/makro nutrisi dari foto makanan/minuman, serta penyusunan pola latihan gym (*workout splits*).

---

## ⚡ Perintah Operasional Harian (Cheat Sheet)

### 1. Monitoring Log secara Real-time
* **Log OpenClaw (WhatsApp & Agent)**:
  ```bash
  journalctl --user -u openclaw-gateway.service -f
  ```
* **Log 9Router (Routing API)**:
  ```bash
  pm2 logs 9router
  ```

### 2. Manajemen Layanan (Restart/Stop/Start)
* **OpenClaw**:
  ```bash
  systemctl --user restart openclaw-gateway.service
  ```
* **9Router**:
  ```bash
  pm2 restart 9router
  ```

### 3. Edit Manual Kepribadian / Aturan Kyu
Semua file di bawah ini bisa diedit secara visual dari dashboard di `http://localhost:18789/agents` atau langsung dari SSH:
```bash
nano /home/parkee/.openclaw/workspace/SOUL.md    # Gaya bicara
nano /home/parkee/.openclaw/workspace/AGENTS.md  # SOP Kerja & Gym
nano /home/parkee/.openclaw/workspace/USER.md    # Detail profil user
```
