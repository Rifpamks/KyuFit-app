# Panduan Tahapan Setup WhatsApp Bot di GCP VPS (Always Free)

Dokumen ini berisi panduan teknis langkah demi langkah untuk membuat Virtual Machine (VM) gratis di Google Cloud Platform (GCP) dan mengonfigurasi WhatsApp Bot (9Router + OpenClaw).

---

## 🛠️ Langkah 1: Membuat VM Instance Gratis di GCP Console

1. **Akses GCP Console**:
   Buka [Google Cloud Console](https://console.cloud.google.com/) dan pastikan project Anda terpilih (misalnya: `bubbly-team-409214`).
2. **Buka Compute Engine**:
   Navigasikan ke **Menu Utama (Bar Kiri) -> Compute Engine -> VM instances**.
3. **Buat VM Baru**:
   Klik tombol **Create Instance** di bagian atas halaman.
4. **Konfigurasi Spesifikasi VM (Wajib Mengikuti Aturan Free Tier)**:
   * **Name**: `wa-bot-server` (atau bebas).
   * **Region**: Pilih salah satu dari tiga region ini:
     * `us-central1` (Iowa)
     * `us-west1` (Oregon)
     * `us-east1` (South Carolina)
   * **Machine configuration**:
     * Series: **E2**
     * Machine type: **e2-micro** (2 vCPU, 1 GB RAM).
   * **Boot Disk**: Klik tombol **Change**.
     * Operating System: **Ubuntu**
     * Version: **Ubuntu 22.04 LTS** atau **Ubuntu 24.04 LTS**
     * Boot disk type: **Standard persistent disk** *(Sangat penting! Jangan pilih Balanced atau SSD)*.
     * Size: **30 GB**.
     * Klik **Select**.
   * **Firewall**:
     * Centang **Allow HTTP traffic** dan **Allow HTTPS traffic**.
5. **Jalankan VM**:
   Klik tombol **Create** di bagian paling bawah. Tunggu beberapa menit hingga VM selesai dibuat dan mendapatkan **External IP** (IP Publik).

---

## 💻 Langkah 2: Menghubungkan ke VM via SSH & Instalasi Dependency

1. **Koneksi SSH**:
   Pada baris VM `wa-bot-server` di GCP Console, klik tombol **SSH** di kolom *Connect*. Sebuah jendela terminal berbasis web akan terbuka.
2. **Perbarui Package Manager**:
   Di dalam terminal VM, jalankan:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl build-essential git
   ```
3. **Instal Node.js (v22 LTS)**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
4. **Instal Docker**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```
   *Setelah perintah Docker selesai, ketik `exit` untuk keluar dari sesi SSH, lalu klik **SSH** kembali di GCP Console agar hak akses grup Docker Anda aktif.*

---

## 🔄 Langkah 3: Menjalankan 9Router di VM

9Router akan dipasang menggunakan Docker agar konfigurasinya terisolasi dan mudah dikelola.

1. **Jalankan Container 9Router**:
   ```bash
   docker run -d \
     -p 20128:20128 \
     -v "$HOME/.9router:/app/data" \
     -e DATA_DIR=/app/data \
     --name 9router \
     --restart unless-stopped \
     decolua/9router:latest
   ```
2. **Periksa Status Container**:
   ```bash
   docker ps
   ```
   Pastikan container `9router` berstatus *Up*.

---

## 🔒 Langkah 4: Mengakses Dashboard 9Router via SSH Tunnel

Guna menghindari pembukaan port `20128` ke internet publik, Anda disarankan menggunakan SSH Tunneling dari laptop/PC lokal Anda.

1. **Buka Terminal di Laptop Lokal Anda** (bukan di browser GCP).
2. **Hubungkan SSH dengan Port Forwarding**:
   ```bash
   ssh -L 20128:localhost:20128 <username>@<IP-PUBLIK-VM-GCP>
   ```
   *(Ganti `<username>` dengan username SSH GCP Anda dan `<IP-PUBLIK-VM-GCP>` dengan IP eksternal VM).*
3. **Buka Browser di Laptop Anda**:
   Akses **`http://localhost:20128`**.
4. **Konfigurasi API Key**:
   * Masuk ke tab **Providers** di menu dashboard.
   * Pilih **Google Gemini**.
   * Tempel API Key Google AI Studio Anda:
     `<YOUR_GEMINI_API_KEY>`
   * Klik **Save**.

---

## 🦅 Langkah 5: Instalasi OpenClaw & Pairing WhatsApp

Kembali ke terminal SSH VM GCP Anda untuk mengonfigurasi OpenClaw.

1. **Instal OpenClaw secara Global**:
   ```bash
   sudo npm install -g openclaw@latest --unsafe-perm
   ```
2. **Jalankan Onboarding**:
   ```bash
   openclaw onboard
   ```
   * Ikuti wizard di layar.
   * Saat ditanya tentang API provider/endpoint, arahkan ke 9Router lokal di VM:
     * **API URL**: `http://localhost:20128/v1`
     * **API Key**: `9router`
     * **Model**: Pilih model Gemini yang didaftarkan di 9Router (misal: `gemini-2.5-flash`).
3. **Hubungkan ke WhatsApp**:
   ```bash
   openclaw channels add --channel whatsapp
   ```
4. **Scan QR Code**:
   * Terminal SSH akan merender QR Code dalam format karakter teks (ANSI QR).
   * Buka aplikasi WhatsApp di HP Anda -> **Perangkat Tertaut (Linked Devices)** -> **Tautkan Perangkat**.
   * Arahkan kamera HP ke terminal SSH Anda untuk memindai QR Code teks tersebut.

---

## 🚀 Langkah 6: Menjalankan Bot di Background 24/7

Agar bot tetap aktif setelah jendela SSH ditutup:

1. **Instal PM2 (Process Manager)**:
   ```bash
   sudo npm install -g pm2
   ```
2. **Jalankan OpenClaw melalui PM2**:
   ```bash
   pm2 start openclaw --name "whatsapp-bot" -- start
   ```
3. **Konfigurasi Auto-Start saat VM Reboot**:
   ```bash
   pm2 startup
   ```
   *(Salin dan jalankan perintah `sudo env PATH=...` yang dihasilkan oleh output perintah di atas).*
   ```bash
   pm2 save
   ```

Sekarang bot WhatsApp Anda aktif berjalan penuh waktu secara gratis di GCP!
