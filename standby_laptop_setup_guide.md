# Panduan Lengkap Setup WhatsApp Bot di Laptop Standby (Local LAN)

Dokumen ini berisi panduan langkah-demi-langkah dari awal untuk menjalankan **9Router** dan **OpenClaw** pada laptop standby Anda (`10.70.63.89`) agar bot WhatsApp berjalan lancar dan responsif menggunakan spesifikasi hardware lokal (8 CPU, 7.5GB RAM) yang jauh lebih cepat daripada VPS gratisan.

---

## ⚙️ Detail Arsitektur Lokal
* **Laptop IP**: `10.70.63.89` (Dapat diakses langsung oleh perangkat di jaringan LAN / ZeroTier Anda).
* **9Router Gateway**: Port `20128` (`http://10.70.63.89:20128`).
* **OpenClaw Dashboard**: Port `18789` (`http://10.70.63.89:18789`).

---

## 🚀 Langkah 1: Jalankan 9Router di Docker

9Router sudah terpasang di laptop standby Anda. Untuk memastikan kontainer berjalan bersih dengan konfigurasi baru:

1. **Masuk ke Laptop Standby via SSH**:
   ```bash
   ssh parkee@10.70.63.89
   ```

2. **Jalankan Ulang Kontainer 9Router**:
   Hapus kontainer lama dan jalankan kontainer baru dengan port forward yang tepat:
   ```bash
   # Hapus container lama jika ada
   sudo docker stop 9router || true
   sudo docker rm 9router || true

   # Jalankan kontainer baru
   sudo docker run -d \
     -p 20128:20128 \
     -v "$HOME/.9router:/app/data" \
     -e DATA_DIR=/app/data \
     --name 9router \
     --restart unless-stopped \
     decolua/9router:latest
   ```

3. **Periksa Status Kontainer**:
   ```bash
   sudo docker ps
   ```
   *Pastikan statusnya **Up**.*

---

## 🔑 Langkah 2: Konfigurasi Provider di Dashboard 9Router

Karena laptop standby berada di jaringan ZeroTier yang sama dengan laptop kerja Anda, Anda bisa langsung mengakses dashboard-nya dari browser laptop kerja Anda tanpa menggunakan SSH Tunnel!

1. Buka browser di laptop Anda dan akses:
   ```text
   
   ```
2. Jika diminta login, gunakan kredensial berikut:
   * **Username**: `rifaldi@parkee.app`
   * **Password**: `parkee@1234`
3. Masuk ke menu **Providers** -> pilih **Google Gemini** (atau **Google AI Studio**).
4. Masukkan API Key baru yang baru Anda generate:
   ```text
   `<YOUR_GEMINI_API_KEY>`
   ```
5. Simpan (**Save**) dan lakukan **Test Connection** untuk memastikan koneksinya hijau / sukses.

---

## 🦅 Langkah 3: Setup OpenClaw via Onboarding Wizard

Untuk menghindari error format konfigurasi JSON secara manual, gunakan **Onboarding Wizard** bawaan OpenClaw agar file konfigurasi dibuat secara otomatis dengan skema yang valid.

1. Di terminal SSH laptop standby (`10.70.63.89`), jalankan perintah onboarding:
   ```bash
   openclaw onboard
   ```
2. Wizard interaktif akan memandu Anda. Masukkan pilihan berikut saat ditanya:
   * **API Provider**: Pilih `OpenAI-compatible` atau `Custom`.
   * **API Endpoint (Base URL)**: `http://localhost:20128/v1` (karena 9Router jalan di laptop yang sama).
   * **API Key**: `9router` (atau isi bebas/dikosongkan karena 9Router lokal tidak mewajibkan auth token).
   * **Default Model**: Masukkan model Gemini yang Anda gunakan (contoh: `gemini-2.5-flash`).
   * **Gateway Token**: Masukkan token default Anda untuk login dashboard OpenClaw:
     ```text
     1d3a795f897d6a840bf8e968ae197d2ce195cc78d487e34f
     ```

3. **Validasi Konfigurasi**:
   Setelah wizard selesai, pastikan konfigurasi sudah valid dengan perintah:
   ```bash
   openclaw config validate
   ```
   *Pastikan keluar output: `Config valid: ~/.openclaw/openclaw.json`.*

4. **Izinkan Akses Jaringan Lokal**:
   Agar OpenClaw dapat menghubungi 9Router di `localhost`, izinkan policy SSRF jaringan privat:
   ```bash
   openclaw config set browser.ssrfPolicy.dangerouslyAllowPrivateNetwork true
   ```

---

## 📱 Langkah 4: Tautkan Nomor WhatsApp Anda

1. Jalankan perintah login channel WhatsApp di terminal laptop standby Anda:
   ```bash
   openclaw channels add --channel whatsapp
   ```
2. Mulai sesi pairing:
   ```bash
   openclaw channels login --channel whatsapp
   ```
3. Terminal akan menampilkan **QR Code** dalam bentuk teks ANSI.
4. Buka aplikasi **WhatsApp Business** di handphone Anda, masuk ke **Perangkat Tertaut (Linked Devices)** -> **Tautkan Perangkat**, lalu arahkan kamera HP untuk memindai QR Code di layar terminal tersebut.

---

## 🚀 Langkah 5: Jalankan OpenClaw Gateway di Background

Agar bot WhatsApp tetap menyala 24/7 dan tidak mati ketika jendela terminal SSH ditutup, jalankan gateway sebagai background service.

### Metode A: Menggunakan Systemd Service (Sangat Direkomendasikan)
1. Aktifkan service OpenClaw bawaan:
   ```bash
   openclaw gateway start
   ```
2. Periksa status jalannya service:
   ```bash
   openclaw gateway status
   ```

### Metode B: Menggunakan PM2
Jika Anda lebih terbiasa menggunakan PM2 untuk monitoring proses Node.js:
1. Pasang PM2 secara global:
   ```bash
   sudo npm install -g pm2
   ```
2. Jalankan OpenClaw Gateway lewat PM2:
   ```bash
   pm2 start openclaw --name "whatsapp-bot" -- start
   ```
3. Buat agar PM2 otomatis menyala saat laptop standby di-restart:
   ```bash
   pm2 startup
   # Jalankan perintah sudo env PATH=... yang dikeluarkan dari output di atas
   pm2 save
   ```

---

## 📊 Langkah 6: Monitoring & Tes Bot

Setelah semua selesai dikonfigurasi:
1. Akses dashboard OpenClaw Control Anda langsung melalui browser laptop kerja Anda:
   ```text
   http://10.70.63.89:18789
   ```
2. Masukkan token login: `1d3a795f897d6a840bf8e968ae197d2ce195cc78d487e34f`
3. Coba kirim pesan chat tes melalui dashboard untuk memastikan bot WhatsApp merespon dengan benar menggunakan AI dari 9Router!
