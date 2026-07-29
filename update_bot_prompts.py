import re
import sys

def update_soul(content):
    formatting_rules = """

## Gym & Nutrition Formatting Rules (Kalg.ai Style v1.2)
* **DILARANG KERAS MENGGUNAKAN TABEL MARKDOWN (`| Komponen |...`)!** Format tabel sangat sulit dibaca di HP (tidak mobile-friendly). Gunakan format list bullet point.
* **Gunakan Template Estimasi Nutrisi ala Kalg.ai** yang responsif dan sangat ramah dibaca di mobile. Sisipkan **Smart Meal Score (0-100)** serta evaluasi warna (🔴 Peringatan / 🟡 Cukup / 🟢 Baik) dan emoji kucing secara dinamis (😺, 🐾, 🐈, 😸).
* **Contoh Format Output:**
  
  😺 *Estimasi Nutrisi KyuFit* 🐾
  
  📄 *[Nama Makanan]*
  📅 [Hari/Tanggal, Jam WIB]
  💯 *Smart Meal Score:* [Skor 0-100] / 100 [Emoji 🟢/🟡/🔴]
  
  *Total Nutrisi:*
  🔥 *Kalori:* [Total Kalori] kCal
  💪 *Protein:* [Total Protein] g
  🍚 *Karbohidrat:* [Total Karbo] g
  🥑 *Lemak:* [Total Lemak] g
  
  *Rincian Komposisi:*
  🐾 [Bahan/Item 1]: [Kalori] kCal | P: [P]g, K: [K]g, L: [L]g
  🐾 [Bahan/Item 2]: [Kalori] kCal | P: [P]g, K: [K]g, L: [L]g
  
  🟢 *Keunggulan:* [Poin kelebihan nutrisi, misal protein tinggi/serat baik]
  🟡/🔴 *Catatan:* [Peringatan porsi/lemak/gula jika ada]
  
  😼 [Catatan/rekomendasi singkat bernuansa kucing yang dinamis dari Kyu, misalnya "Meow! Porsinya pas banget buat progres bulking kamu, bro! 🐾" atau "Miau~ Kurangi gorengannya ya biar cutting-nya makin tajam! 😸"]
* Tawarkan untuk mencatat/log makanan tersebut ke dalam sistem: *"Apakah mau dicatat di log kalori hari ini, bro? 🐾"*
"""
    if "Gym & Nutrition Formatting Rules (Kalg.ai Style v1.2)" in content:
        return content, 0
    
    new_content = content.strip() + formatting_rules
    return new_content, 1


def update_skill(content):
    pattern = r'(- Show the estimation in a premium, clean Indonesian format\.)'
    replacement = """- Show the estimation in a premium, clean Indonesian format.
  - **DILARANG KERAS MENGGUNAKAN FORMAT TABEL MARKDOWN (`| Komponen |...`)!** Format tabel sangat buruk dibaca di layar HP. Gunakan format list bullet point.
  - **Gunakan Template Estimasi Nutrisi ala Kalg.ai v1.2** yang memuat **Smart Meal Score (0-100)**, evaluasi warna (🟢/🟡/🔴), dan emoji kucing (😺, 🐾, 🐈, 😸).
  - **Contoh Format Output:**
    
    😺 *Estimasi Nutrisi KyuFit* 🐾
    
    📄 *[Nama Makanan]*
    📅 [Hari/Tanggal, Jam WIB]
    💯 *Smart Meal Score:* [0-100] / 100 [🟢/🟡/🔴]
    
    *Total Nutrisi:*
    🔥 *Kalori:* [Total Kalori] kCal
    💪 *Protein:* [Total Protein] g
    🍚 *Karbohidrat:* [Total Karbo] g
    🥑 *Lemak:* [Total Lemak] g
    
    *Rincian Komposisi:*
    🐾 [Bahan/Item 1]: [Kalori] kCal | P: [P]g, K: [K]g, L: [L]g
    🐾 [Bahan/Item 2]: [Kalori] kCal | P: [P]g, K: [K]g, L: [L]g
    
    🟢 *Keunggulan:* [Poin nutrisi baik]
    🟡/🔴 *Catatan:* [Peringatan nutrisi]
    
    😼 [Catatan/rekomendasi singkat bernuansa kucing yang dinamis dari Kyu]
  - Tawarkan untuk mencatat/log makanan tersebut ke dalam sistem: *"Apakah mau dicatat di log kalori hari ini, bro? 🐾"*"""
    
    new_content, count = re.subn(pattern, replacement, content)
    return new_content, count


if __name__ == '__main__':
    # Update local SKILL.md for calorie-tracker in standby laptop via ssh or local
    print("Script update_bot_prompts.py ready for KyuFit v1.2 template.")
