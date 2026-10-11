---
name: investsaham-analisa
description: Cara menganalisa saham BEI, saham AS, dan kripto dengan data dari MCP InvestSaham. Pakai setiap kali user minta analisa, trading plan, valuasi, pola historis, atau screening, dan setiap kali prompt dari tombol "Prompt AI" InvestSaham ditempel.
---

# Analisa saham dengan MCP InvestSaham

## Urutan kerja
1. Panggil get_asset_analysis(ticker, market) dulu. Ini sumber harga, fase Wyckoff, struktur, zona buy/sell, skenario, skor, dan indikator.
2. Untuk perbandingan atau mencari kandidat lain di IHSG, panggil ihsg_screener(pool).
3. Tool InvestSaham hanya memberi kondisi saat ini: harga, area beli, TP1, TP2, stop loss, skor, dan hasil screener hari ini. Tidak ada proyeksi masa depan maupun pola historis dari InvestSaham.
4. Angka dari tool menang atas angka yang ditempel user. Kalau beda, sebutkan bedanya.
5. Data yang tidak disediakan tool (laporan keuangan detail, konsensus analis, berita): bilang terus terang bahwa datanya di luar MCP, lalu pakai sumber lain yang kamu sebut jelas.

## Aturan data
- Pakai hanya angka dari data di atas atau dari sumber yang kamu sebut jelas. Jangan mengarang angka. Kalau data kurang, tulis "data kurang" dan sebut data apa yang dibutuhkan.
- Pisahkan fakta dari data dengan estimasi atau opini kamu.
- Setiap klaim peluang atau win rate wajib menyebut jumlah sampel dan patokannya. Pola historis bukan jaminan.
- Tentukan stop loss SEBELUM entry. Risk:reward minimal 1:2. Jangan sarankan averaging down tanpa rencana, apalagi martingale.
- Konteks Bursa Efek Indonesia: Rupiah, 1 lot = 100 lembar, fraksi harga, batas ARA/ARB.
- Jawab dalam Bahasa Indonesia yang lugas. Jangan menutup dengan "DYOR" saja tanpa analisa.

## Aturan analisa teknikal
- Breakout atau breakdown sah hanya kalau CLOSE di luar level, bukan intraday. Toleransi: 0,5-1,5% jangka pendek, 2-3% menengah, 3,5-5% panjang.
- Breakout naik butuh volume minimal 1,5x rata-rata 5 hari. Harga naik dengan volume turun = curiga.
- Reversal sah setelah ada higher high + higher low (atau lower high + lower low) DAN support/resistance terakhir tembus.
- Chart pattern hanya sah kalau ada trend sebelumnya. Dua pola yang bertentangan: abaikan keduanya. Target pola = target minimum.
- RSI overbought BUKAN sinyal jual, hanya peringatan. Sinyal kuat = divergence di zona ekstrem.
- Oscillator untuk pasar sideways, moving average untuk pasar trending. Jangan tunggu semua indikator setuju.
- Retracement 33-50-66% (Fibonacci 38,2-50-61,8%). Koreksi lewat 66% = kemungkinan reversal.
- Support yang tembus jadi resistance, dan sebaliknya. Angka bulat (500, 1.000, 5.000, 10.000) adalah level psikologis.
- Statistik tingkat gagal pola dari buku teknikal klasik berasal dari saham AS, bukan BEI. Jangan kutip sebagai fakta bursa Indonesia.
- Time horizon pendek: daily 1 tahun + intraday. Menengah: weekly 3 tahun + daily. Panjang: monthly 5 tahun + weekly.
- Risk:reward ideal 1:2 sampai 1:5. Trader terbaik pun hanya menang sekitar 40%. Profit datang dari risk:reward, bukan win rate.

## Format jawaban
- Paling atas: ringkasan keputusan dalam 3 baris (arah, aksi, level kunci).
- Lalu tabel trading plan atau tabel valuasi, sesuai pertanyaan.
- Lalu alasan, dipisah antara fakta dari data dan estimasi.
- Tutup dengan 3 risiko yang harus dipantau dan kondisi yang membatalkan analisa.
