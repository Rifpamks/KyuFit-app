# Review & Gap Analysis: Dashboard KyuFit (Current State) vs Spec "Login, Riwayat Tanggal & Gym Harian"

> [!NOTE]
> Dokumen ini adalah hasil review terhadap tampilan dashboard KyuFit yang saat ini berjalan di `localhost:3000` (v1.0 Live), dibandingkan dengan spesifikasi fitur baru yang direncanakan (Login, Date Navigation, Gym/Workout Tracking). Tujuannya untuk menjadi acuan diskusi sebelum eksekusi coding dimulai.

**Tanggal Review:** 9 Juli 2026
**Versi Dashboard yang Direview:** v1.0 Live (Connected to Supabase)

---

## 1. Ringkasan Eksekutif

Dashboard KyuFit saat ini sudah solid dari sisi **visual design** dan **fitur dasar** (catat makanan, lihat makro, tracking berat badan). Namun, dashboard ini masih berada pada scope **Spec v1.0 (Fitur Eksis)** dan belum mengimplementasikan scope **Spec Login, Riwayat Tanggal & Gym Harian**.

Ada **6 gap fitur besar** yang perlu dikerjakan agar dashboard sesuai dengan spec terbaru, dengan **Login/Auth** dan **Date Navigation** sebagai blocker prioritas tertinggi.

---

## 2. Status Kesesuaian per Poin Spec

### 2.1 Alur & Pengalaman Pengguna (User Flow)

| Item Spec | Status di Dashboard Saat Ini | Keterangan |
|---|---|---|
| Redirect ke `/login` jika belum autentikasi | ❌ Belum ada | Dashboard langsung tampil tanpa gate |
| Form login (email & password) | ❌ Belum ada | Tidak ditemukan halaman `/login` |
| `POST /api/auth/login` + set session cookie | ❌ Belum ada | Belum ada endpoint auth |
| Redirect ke `/dashboard` setelah login sukses | ❌ Belum ada | Route saat ini hanya `/` (root langsung dashboard) |
| Klik navigasi tanggal → fetch `/api/logs?date=` & `/api/workout?date=` | ❌ Belum ada | Tidak ada UI navigasi tanggal sama sekali |

**Kesimpulan:** Seluruh user flow di spec ini (auth gate + date-based fetching) **belum terimplementasi**.

---

### 2.2 Skema Database (Prisma ORM)

| Item Spec | Status | Keterangan |
|---|---|---|
| Kolom `passwordHash` di tabel `User` | ❓ Tidak terverifikasi dari UI | Perlu cek langsung `schema.prisma` |
| Tabel baru `WorkoutLog` (`activityName`, `durationMinutes`, `caloriesBurned`, `timestamp`) | ❌ Belum terlihat di dashboard | Tidak ada widget/data terkait gym log |

**Catatan:** Poin ini butuh verifikasi langsung ke file `schema.prisma`, karena tidak bisa dipastikan hanya dari tampilan UI. Direkomendasikan cek isi skema sebelum mulai coding agar tidak dobel migrasi.

---

### 2.3 API Endpoints Baru

| Endpoint | Status | Keterangan |
|---|---|---|
| `POST /api/auth/login` | ❌ Belum ada | — |
| `POST /api/auth/logout` | ❌ Belum ada | — |
| `GET /api/auth/me` | ❌ Belum ada | — |
| `GET /api/logs?date=YYYY-MM-DD` | ⚠️ Kemungkinan hanya ada versi "hari ini" (`/api/logs/daily`) | Perlu ditambah parameter `date` |
| `POST /api/workout/add` | ❌ Belum ada | — |
| `GET /api/workout?date=YYYY-MM-DD` | ❌ Belum ada | — |

**Kesimpulan:** Dari 6 endpoint yang dispesifikasikan, **0 yang sudah pasti terlihat aktif** di dashboard saat ini (fitur logs tanggal-spesifik butuh verifikasi kode langsung).

---

### 2.4 Desain & Fitur Web Dashboard

| Item Spec | Status di Screenshot | Keterangan |
|---|---|---|
| Halaman Login — dark mode, glow orbs, glassmorphism | ❌ Belum ada | — |
| Date Navigation Bar (7 hari terakhir, mis. "Mon 6", "Tue 7") | ❌ Belum ada | Dashboard hanya menampilkan data "Hari Ini" tanpa opsi ganti tanggal |
| Rumus Neraca Energi: `Sisa = Target - Intake + Exhaust` | ⚠️ Sebagian | Ring saat ini hanya hitung `Target - Intake` (21% logged, 1399 kCal left). Komponen **Exhaust belum masuk formula** |
| Intake vs Exhaust Ring (dual progress) | ❌ Belum ada | Hanya ada 1 ring untuk Intake saja |
| Riwayat List Makanan (per tanggal terpilih) | ⚠️ Sebagian | Ada "Log Makanan Hari Ini" tapi terkunci ke hari ini saja, belum bisa pilih tanggal lain |
| Riwayat List Gym (per tanggal terpilih) | ❌ Belum ada | Tidak ada section gym/workout sama sekali |
| Timbangan Berat Badan (per tanggal terpilih) | ⚠️ Sebagian | Ada card "Berat Badan Terbaru" + grafik tren, tapi bukan spesifik ke tanggal yang dipilih dari nav bar (karena nav bar-nya sendiri belum ada) |

---

## 3. Detail Temuan dari Screenshot Dashboard Saat Ini

Berikut breakdown widget yang **sudah ada dan berjalan** di `localhost:3000`:

1. **Header** — Judul "KyuFit AI Tracker", badge "v1.0 Live" & "Connected to Supabase", info WhatsApp User & Goal (Cut 1779 kcal)
2. **Card Pencapaian Kalori** — Ring 21% logged, 380 kcal terkonsumsi, 1399 kcal sisa hari ini
3. **Card Rasio Nutrisi Makro** — 3 progress bar: Protein (49g/98g), Carbs (28g/237g), Fats (5g/49g)
4. **Card Berat Badan Terbaru** — 69.8 kg + input field untuk update timbangan
5. **Form Catat Makanan Baru** — Input Nama Makanan, Kalori, Protein, Carbs, Lemak
6. **Log Makanan Hari Ini** — List 2 item (Dada Ayam Bakar 150g, Nasi Putih 100g) dengan detail makro per item
7. **Chart Progress Berat Badan** — Line chart 30 hari terakhir (Recharts), menampilkan tren turun dari ±70.8 kg ke 69.8 kg

**Tidak ditemukan di screenshot:**
- Halaman/komponen login
- Navigasi tanggal
- Widget/form gym & workout
- Indikator calorie exhaust
- Neraca energi gabungan intake-exhaust

---

## 4. Gap Analysis Matrix (Prioritas)

| # | Fitur | Ada di Spec? | Ada di Dashboard? | Gap | Prioritas |
|---|---|:---:|:---:|---|:---:|
| 1 | Login & Session Auth | ✅ | ❌ | Full build | 🔴 Tinggi |
| 2 | Date Navigation Bar (7 hari) | ✅ | ❌ | Full build | 🔴 Tinggi |
| 3 | Tabel & Form WorkoutLog (Gym) | ✅ | ❌ | Full build | 🔴 Tinggi |
| 4 | API `/api/workout/*` | ✅ | ❌ | Full build | 🔴 Tinggi |
| 5 | API `/api/logs?date=` (filter tanggal) | ✅ | ⚠️ Parsial | Tambah parameter `date` | 🟠 Sedang |
| 6 | Neraca Energi (Intake vs Exhaust Ring) | ✅ | ⚠️ Parsial (hanya Intake) | Tambah kalkulasi Exhaust & redesign ring | 🟠 Sedang |
| 7 | Riwayat List Gym per tanggal | ✅ | ❌ | Full build (bergantung pada #3, #4) | 🟠 Sedang |
| 8 | Kolom `passwordHash` di schema | ✅ | ❓ Perlu cek langsung | Verifikasi/migrasi jika belum ada | 🟠 Sedang |
| 9 | UI Polish (loading state, transisi, dsb) | — | ⚠️ Belum dievaluasi | Nice-to-have setelah fitur inti selesai | 🟢 Rendah |

---

## 5. Rekomendasi Urutan Eksekusi

Berdasarkan ketergantungan antar fitur (dependency), urutan yang disarankan:

1. **Login & Auth Middleware** — blocker keamanan, harus jadi gerbang pertama sebelum fitur lain dianggap "selesai" untuk production
2. **Schema Update** — tambah `passwordHash` di `User`, tambah tabel `WorkoutLog`, migrasi Prisma
3. **API Workout** — `POST /api/workout/add`, `GET /api/workout?date=`
4. **API Logs by Date** — update `GET /api/logs` agar terima parameter `date`
5. **Date Navigation Bar (UI)** — komponen 7 hari, trigger fetch ulang logs & workout
6. **Workout Form & Riwayat List Gym (UI)**
7. **Redesain Ring Kalori → Neraca Energi (Intake vs Exhaust)**
8. **UI Polish** — loading state, transisi antar tanggal, empty state

---

## 6. Pertanyaan Terbuka untuk Klarifikasi Sebelum Mulai Coding

- [ ] Apakah `passwordHash` & tabel `WorkoutLog` sudah ada di `schema.prisma` saat ini, atau perlu migrasi dari nol?
- [ ] Endpoint `/api/logs/daily` yang lama (dari Spec v1.0) apakah akan **digantikan** oleh `/api/logs?date=`, atau keduanya tetap dipertahankan?
- [ ] Untuk session/auth, preferensi implementasi: JWT + httpOnly cookie manual, atau library seperti NextAuth.js?
- [ ] Untuk Date Navigation Bar, apakah range-nya tetap fix "7 hari terakhir" atau perlu bisa navigasi bebas (calendar picker) ke tanggal manapun?

---

## 7. Lampiran: Perbandingan Cepat (Spec v1.0 vs Spec Login/Gym vs Kondisi Aktual)

| Kategori | Spec v1.0 (Eksis) | Spec Baru (Login/Gym) | Kondisi Aktual Dashboard |
|---|---|---|---|
| Auth | Tidak dibahas | Wajib (login gate) | Tidak ada auth |
| Data Tanggal | Hanya "hari ini" | Bisa pilih 7 hari terakhir | Hanya "hari ini" |
| Kalori | Intake only | Intake vs Exhaust | Intake only |
| Gym/Workout | Tidak ada | Tabel `WorkoutLog` + API + UI | Tidak ada |
| Weight Tracking | Ada (30 hari chart) | Per tanggal terpilih | Ada, tapi belum terhubung ke date nav |