# Test JSON Files untuk Animasi

Folder ini berisi file JSON untuk testing setiap animasi. File-file ini bisa langsung diupload melalui aplikasi.

## Cara Penggunaan

1. Buka aplikasi EDUBOX
2. Pilih animasi yang ingin dimainkan
3. Klik tombol upload dan pilih file JSON yang sesuai
4. Atau copy-paste isi file JSON ke textarea

## Daftar File

- `diagonal-bounce.json` - Untuk animasi Diagonal Bounce
- `box-rotate.json` - Untuk animasi Box Rotate
- `wave.json` - Untuk animasi Wave
- `heartbeat.json` - Untuk animasi Heartbeat
- `checker.json` - Untuk animasi Checker
- `spiral.json` - Untuk animasi Spiral
- `rain.json` - Untuk animasi Rain
- `cross.json` - Untuk animasi Cross
- `border-chase.json` - Untuk animasi Border Chase
- `blink-all.json` - Untuk animasi Blink All

## Format JSON

Semua file menggunakan format yang sama:
```json
{
  "animation": <number>,
  "type": "<animation-type>",
  "version": "1.0"
}
```

## Testing Invalid Codes

Untuk testing error handling, Anda bisa membuat file dengan format salah atau nomor animasi yang tidak sesuai.
