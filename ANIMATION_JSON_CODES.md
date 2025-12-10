# Kode JSON untuk Semua Animasi - Testing Guide

File ini berisi semua kode JSON yang diperlukan untuk memainkan setiap animasi dalam sistem EDUBOX. Gunakan kode-kode ini untuk testing.

## 📋 Daftar Animasi

### 1. Diagonal Bounce

**JSON Code:**
```json
{"animation":1,"type":"diagonal-bounce","version":"1.0"}
```

**Detail:**
- Animation Number: 1
- Duration: 2:00
- Frame Rate: 150ms

---

### 2. Box Rotate

**JSON Code:**
```json
{"animation":2,"type":"box-rotate","version":"1.0"}
```

**Detail:**
- Animation Number: 2
- Duration: 2:30
- Frame Rate: 200ms

---

### 3. Wave

**JSON Code:**
```json
{"animation":3,"type":"wave","version":"1.0"}
```

**Detail:**
- Animation Number: 3
- Duration: 2:15
- Frame Rate: 150ms

---

### 4. Heartbeat

**JSON Code:**
```json
{"animation":4,"type":"heartbeat","version":"1.0"}
```

**Detail:**
- Animation Number: 4
- Duration: 1:45
- Frame Rate: 300ms

---

### 5. Checker

**JSON Code:**
```json
{"animation":5,"type":"checker","version":"1.0"}
```

**Detail:**
- Animation Number: 5
- Duration: 2:00
- Frame Rate: 250ms

---

### 6. Spiral

**JSON Code:**
```json
{"animation":6,"type":"spiral","version":"1.0"}
```

**Detail:**
- Animation Number: 6
- Duration: 3:00
- Frame Rate: 200ms

---

### 7. Rain

**JSON Code:**
```json
{"animation":7,"type":"rain","version":"1.0"}
```

**Detail:**
- Animation Number: 7
- Duration: 2:30
- Frame Rate: 100ms

---

### 8. Cross

**JSON Code:**
```json
{"animation":8,"type":"cross","version":"1.0"}
```

**Detail:**
- Animation Number: 8
- Duration: 1:30
- Frame Rate: 200ms

---

### 9. Border Chase

**JSON Code:**
```json
{"animation":9,"type":"border-chase","version":"1.0"}
```

**Detail:**
- Animation Number: 9
- Duration: 2:45
- Frame Rate: 150ms

---

### 10. Blink All

**JSON Code:**
```json
{"animation":10,"type":"blink-all","version":"1.0"}
```

**Detail:**
- Animation Number: 10
- Duration: 1:00
- Frame Rate: 500ms

---

## 📁 File JSON untuk Upload Testing

Berikut adalah file JSON yang bisa disimpan dan diupload untuk testing:

### diagonal-bounce.json
```json
{
  "animation": 1,
  "type": "diagonal-bounce",
  "version": "1.0"
}
```

### box-rotate.json
```json
{
  "animation": 2,
  "type": "box-rotate",
  "version": "1.0"
}
```

### wave.json
```json
{
  "animation": 3,
  "type": "wave",
  "version": "1.0"
}
```

### heartbeat.json
```json
{
  "animation": 4,
  "type": "heartbeat",
  "version": "1.0"
}
```

### checker.json
```json
{
  "animation": 5,
  "type": "checker",
  "version": "1.0"
}
```

### spiral.json
```json
{
  "animation": 6,
  "type": "spiral",
  "version": "1.0"
}
```

### rain.json
```json
{
  "animation": 7,
  "type": "rain",
  "version": "1.0"
}
```

### cross.json
```json
{
  "animation": 8,
  "type": "cross",
  "version": "1.0"
}
```

### border-chase.json
```json
{
  "animation": 9,
  "type": "border-chase",
  "version": "1.0"
}
```

### blink-all.json
```json
{
  "animation": 10,
  "type": "blink-all",
  "version": "1.0"
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Valid JSON Code
1. Pilih animasi "Diagonal Bounce"
2. Upload file `diagonal-bounce.json` atau paste JSON code
3. Klik "Validate JSON Code"
4. **Expected:** Validation berhasil, animasi bisa dimainkan

### Scenario 2: Invalid JSON Format
1. Pilih animasi "Wave"
2. Input: `{"animation":3}` (tidak lengkap)
3. Klik "Validate JSON Code"
4. **Expected:** Error "Invalid JSON format"

### Scenario 3: Wrong Animation Code
1. Pilih animasi "Heartbeat"
2. Input JSON code untuk animasi lain: `{"animation":1,"type":"diagonal-bounce","version":"1.0"}`
3. Klik "Validate JSON Code"
4. **Expected:** Error "Invalid code"

### Scenario 4: Valid Code - Reuse
1. Validasi animasi "Checker"
2. Pilih animasi "Checker" lagi
3. **Expected:** Langsung bisa play tanpa input code lagi

### Scenario 5: Different Animation
1. Validasi animasi "Spiral"
2. Pilih animasi "Rain"
3. **Expected:** Modal muncul lagi, perlu input code untuk "Rain"

---

## 📝 Quick Copy-Paste Codes

### Minimal Format (Compact)
```
{"animation":1,"type":"diagonal-bounce","version":"1.0"}
{"animation":2,"type":"box-rotate","version":"1.0"}
{"animation":3,"type":"wave","version":"1.0"}
{"animation":4,"type":"heartbeat","version":"1.0"}
{"animation":5,"type":"checker","version":"1.0"}
{"animation":6,"type":"spiral","version":"1.0"}
{"animation":7,"type":"rain","version":"1.0"}
{"animation":8,"type":"cross","version":"1.0"}
{"animation":9,"type":"border-chase","version":"1.0"}
{"animation":10,"type":"blink-all","version":"1.0"}
```

### Formatted (Pretty Print)
```json
{
  "animation": 1,
  "type": "diagonal-bounce",
  "version": "1.0"
}
```

---

## ⚠️ Catatan Penting

1. **Format JSON**: Kode JSON harus valid dan sesuai dengan format yang ditentukan
2. **Case Sensitive**: Property names case-sensitive (`animation`, `type`, `version`)
3. **Spacing**: Whitespace tidak masalah, akan dinormalisasi saat validasi
4. **Validation**: Setiap animasi perlu validasi terpisah
5. **Storage**: Status validasi disimpan di localStorage per animasi

---

## 🔧 Customization

Jika ingin mengubah kode JSON untuk testing, edit di:
- `src/app/services/animation-pattern.service.ts` - Property `jsonCode` pada setiap pattern
- `src/app/data/animation-codes.json` - File referensi

---

## 📁 Test Files Folder

Folder `test-json-codes/` berisi file JSON individual untuk setiap animasi yang bisa langsung diupload:
- `diagonal-bounce.json`
- `box-rotate.json`
- `wave.json`
- `heartbeat.json`
- `checker.json`
- `spiral.json`
- `rain.json`
- `cross.json`
- `border-chase.json`
- `blink-all.json`

Lihat `test-json-codes/README.md` untuk detail penggunaan.

## 📚 Related Files

- `ANIMATION_JSON_FORMAT.md` - Dokumentasi format JSON lengkap
- `test-json-codes/` - Folder berisi file JSON untuk testing
- `src/app/data/animation-codes.json` - File JSON referensi
- `src/app/services/animation-pattern.service.ts` - Service dengan semua pattern
