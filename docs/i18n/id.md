# Clean Your TV — Panduan Pengguna

## Sebelum Instalasi

Panduan ini mencakup instalasi, penggunaan sehari-hari, dan pemulihan. Pilihan bahasa dan aplikasi desktop macOS/Linux disertakan untuk memudahkan proses setup.

Pastikan TV menyala dan komputer berada di jaringan lokal yang sama. Komputer tidak perlu terus menyala setelah proses setup selesai.

- **No-root:** aktifkan LG Developer Mode dan Key Server di TV. Masukkan passphrase yang ditampilkan di layar TV dan setujui permintaan pairing. Developer Mode harus tetap aktif.
- **Root:** memerlukan akses SSH root yang sudah ada. Installer tidak melakukan rooting pada TV Anda.

## Instalasi dan Memilih Bahasa

- **Windows x64:** ekstrak paket konsol dan buka `cytv.exe`.
- **macOS 13+:** ekstrak file zip, pindahkan `cytv.app` ke Applications dan buka.
- **Linux x64:** buka file `.deb` pada paket grafis dan instal.

Atau jalankan CLI melalui terminal:

```sh
chmod +x cytv
./cytv --language id install
```

Di TV, buka **Pengaturan → Bahasa** untuk memilih Bahasa Indonesia.

## Penggunaan Sehari-hari dan Navigasi

- **Arah panah (◀ ▶ ▲ ▼):** Memilih tile aplikasi atau tombol aksi.
- **OK:** Membuka aplikasi yang dipilih.
- **Tahan OK:** Masuk ke mode edit dan geser posisi aplikasi di Home.
- **Back / Kembali:** Navigasi kembali dalam aplikasi.
- **Tahan Back (1.2 detik):** Membuka LG Home bawaan satu kali.
- **Tekan tombol Home 3× dalam 2 detik:** Mengembalikan routing ke LG Home bawaan jika diperlukan.

## Pemeliharaan dan Pemulihan

```sh
./cytv --language id status
./cytv --language id doctor --report
./cytv --language id restore
./cytv --language id uninstall
```
