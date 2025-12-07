# Format JSON untuk Animasi EDUBOX

Dokumentasi format JSON yang digunakan dalam sistem animasi EDUBOX.

## 1. Format Konfigurasi Animasi

File: `src/app/data/animations.json`

Format untuk menyimpan konfigurasi semua animasi yang tersedia.

```json
{
  "animations": [
    {
      "id": "diagonal-bounce",
      "name": "Diagonal Bounce",
      "duration": "2:00",
      "frameRate": 150,
      "animNumber": 1,
      "description": "Deskripsi animasi"
    }
  ],
  "matrixSize": {
    "rows": 6,
    "columns": 6,
    "totalLeds": 36
  }
}
```

## 2. Format Frame Data

File: `src/app/data/animation-frames-example.json`

Format untuk menyimpan data frame per frame dari animasi.

```json
{
  "animationId": "diagonal-bounce",
  "animationName": "Diagonal Bounce",
  "frames": [
    {
      "frameIndex": 0,
      "matrix": [
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    }
  ]
}
```

**Catatan:**
- `matrix` adalah array 2D dengan ukuran 6x6 (36 LED)
- `1` = LED ON (menyala)
- `0` = LED OFF (mati)
- Setiap frame merepresentasikan satu frame dalam animasi

## 3. Format Firebase Database Structure

File: `src/app/data/firebase-structure.json`

Format struktur data yang disimpan di Firebase Realtime Database.

### Struktur Dasar:
```json
{
  "ledMatrix": {
    "animation": 0,
    "shiftVersion": 1,
    "currentAnimation": {
      "animNumber": 0,
      "animationId": "",
      "animationName": "",
      "isPlaying": false,
      "startedAt": 0,
      "userId": ""
    },
    "customPattern": {
      "enabled": false,
      "frames": []
    }
  }
}
```

**Penjelasan:**
- `animation`: Nomor animasi untuk kontrol device (0-14)
- `currentAnimation`: Status lengkap animasi yang sedang diputar (untuk tracking)
  - `animNumber`: Nomor animasi
  - `animationId`: ID animasi (misalnya "diagonal-bounce")
  - `animationName`: Nama animasi (misalnya "Diagonal Bounce")
  - `isPlaying`: Status apakah animasi sedang diputar (true/false)
  - `startedAt`: Timestamp kapan animasi mulai diputar
  - `userId`: ID user yang memutar animasi

### Nilai Animation:
- `0` = Stop / Matikan semua animasi
- `1` = Diagonal Bounce
- `2` = Box Rotate
- `3` = Wave
- `4` = Heartbeat
- `5` = Checker
- `6` = Spiral
- `7` = Rain
- `8` = Cross
- `9` = Border Chase
- `10` = Blink All
- `11` = Custom Pattern (menggunakan data dari `customPattern`)
- `12` = LED Test Mode
- `13` = Row Test Mode
- `14` = Column Test Mode

### Contoh Mengatur Animasi:
**Untuk Device (kontrol):**
```json
{
  "ledMatrix": {
    "animation": 1
  }
}
```

**Status Tracking (otomatis dibuat saat animasi diputar):**
```json
{
  "ledMatrix": {
    "currentAnimation": {
      "animNumber": 1,
      "animationId": "diagonal-bounce",
      "animationName": "Diagonal Bounce",
      "isPlaying": true,
      "startedAt": 1703123456789,
      "userId": "anonymous-user-123"
    }
  }
}
```

### Contoh Custom Pattern:
```json
{
  "ledMatrix": {
    "animation": 11,
    "customPattern": {
      "enabled": true,
      "frames": [
        {
          "frameIndex": 0,
          "matrix": [
            [1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1]
          ]
        }
      ]
    }
  }
}
```

## 4. API Endpoints Firebase

### Set Animation
- **Path**: `/ledMatrix/animation`
- **Method**: SET
- **Value Type**: Integer
- **Range**: 0-14

### Set Shift Version
- **Path**: `/ledMatrix/shiftVersion`
- **Method**: SET
- **Value Type**: Integer
- **Range**: 1-4

### Set Custom Pattern
- **Path**: `/ledMatrix/customPattern`
- **Method**: SET
- **Value Type**: Object

## 5. Penggunaan dalam Code

### TypeScript Interface:
```typescript
export interface AnimationPattern {
  id: string;
  name: string;
  duration: string;
  frameRate: number;
  animNumber: number;
  generateFrame: (frameIndex: number) => boolean[];
}

export interface AnimationFrame {
  frameIndex: number;
  matrix: number[][]; // 6x6 array, 1 = ON, 0 = OFF
}
```

### Mengirim ke Firebase:
```typescript
// Menggunakan LedControlService
await this.ledControlService.setAnimation(1); // Play Diagonal Bounce
await this.ledControlService.stopAnimation(); // Stop (sets to 0)
```

## 6. Catatan Penting

1. **Matrix Layout**: Matrix menggunakan format row-major order
   - Row pertama: `[0][0]` sampai `[0][5]`
   - Row terakhir: `[5][0]` sampai `[5][5]`

2. **Frame Rate**: Dinyatakan dalam milliseconds (ms)
   - 150ms = ~6.67 FPS
   - 100ms = 10 FPS
   - 500ms = 2 FPS

3. **Custom Pattern**: Hanya aktif jika `animation = 11` dan `customPattern.enabled = true`

4. **Validation**: Sistem validasi kode diperlukan sebelum user bisa play animasi
   - Default code: `EDUBOX2024`
   - Status validasi disimpan di localStorage
