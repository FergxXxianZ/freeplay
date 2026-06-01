# 🎬 Playback Validation - Fitur Baru

## 📌 Apa yang Berubah?

Sistem sekarang tidak hanya memeriksa apakah **link bisa diakses**, tapi juga memeriksa apakah **video bisa diplay** di browser.

### **Sebelumnya:**
```
Link bisa diakses (HTTP 200) = Valid ✓
Link tidak bisa diakses = Rusak ✗
```

### **Sekarang:**
```
Link bisa diakses + Video bisa diplay = ✓ Bisa Diplay
Link bisa diakses tapi video tidak bisa diplay = ⚠ Tidak Bisa Diplay
Link tidak bisa diakses = ✗ Link Error
```

---

## 🎯 Contoh Kasus Anda

### **Link Problematik**
- URL: `https://cdn.videy.co/FPdVFIps1.mp4`
- Status: Link valid (HTTP OK)
- Tapi: Video tidak bisa diplay di browser
- **Solusi:** Sistem akan mendeteksi ini sebagai "⚠ Tidak Bisa Diplay" dan bisa dihapus otomatis

### **Link Alternatif yang Bekerja**
- URL: `https://freeplays.vercel.app/FPdVFIps1`
- Status: Video bisa diplay
- **Hasil:** Ditandai sebagai "✓ Bisa Diplay"

---

## 🔍 Bagaimana Sistem Bekerja?

### **Step 1: Check Link Access**
```
HEAD Request ke URL
→ Cek status HTTP (200, 404, dll)
```

### **Step 2: Test Video Playback** (NEW)
```
Buat <video> element
→ Set video src ke URL
→ Listen untuk 'loadedmetadata' event
→ Timeout setelah 10 detik
→ Jika bisa load metadata = ✓ Bisa Diplay
→ Jika error = ⚠ Tidak Bisa Diplay
```

### **Step 3: Report Status**
```
✓ Playable = Bisa dimainkan di browser
⚠ Non-playable = Link valid tapi video tidak bisa diplay
✗ Error = Link tidak valid
```

---

## 📊 Status Video - 3 Kategori

### **✓ BISA DIPLAY (Green)**
```
- Link bisa diakses (HTTP OK)
- Video berhasil load di browser
- Video bisa dimainkan
→ KEEP video ini
```

### **⚠ TIDAK BISA DIPLAY (Orange)**
```
- Link bisa diakses (HTTP OK)
- Tapi video error saat load
- Error: MEDIA_ERR_NETWORK, MEDIA_ERR_DECODE, dll
→ HAPUS video ini (tidak berguna)
```

### **✗ LINK ERROR (Red)**
```
- Link tidak bisa diakses
- HTTP error (404, 403, timeout, dll)
→ HAPUS video ini (link mati)
```

---

## 🎮 Cara Menggunakan

### **1. Check Semua Video**
```
1. Buka /admin/links
2. Klik "Cek Semua Link"
3. Tunggu hasil (15-30 detik untuk banyak video)
```

### **2. Lihat Status**
```
Status akan ditampilkan:
- ✓ Bisa Diplay (hijau) = Bagus, keep
- ⚠ Tidak Bisa Diplay (oranye) = Perlu dihapus
- ✗ Link Error (merah) = Perlu dihapus
```

### **3. Filter Berdasarkan Status**
```
Klik tab filter:
- Semua = Semua video
- ✓ Bisa Diplay = Hanya yang bisa dimainkan
- ⚠ Tidak Bisa = Hanya yang error playback
- ✗ Error = Hanya yang link error
```

### **4. Hapus Otomatis**
```
Klik "Hapus Tidak Bisa Diplay (X)"
→ Semua video yang tidak bisa diplay akan dihapus
→ Ada backup jika ingin restore
```

---

## 📈 Dashboard Stats (Baru)

| Stat | Arti |
|------|------|
| **Total Video** | Jumlah semua video |
| **Bisa Diplay** | Video yang bisa dimainkan (✓) |
| **Link Valid** | Link yang bisa diakses (termasuk yang tidak bisa diplay) |
| **Tidak Bisa Diplay** | Video dengan link error (⚠ + ✗) |
| **Kesehatan %** | Persentase "Bisa Diplay" dari total |

---

## 🔧 Technical Details

### **Playback Test Logic**
```javascript
const video = document.createElement('video');
video.crossOrigin = 'anonymous';
video.src = url;

// Success
video.onloadedmetadata = () => {
  // Video metadata berhasil load
  // = Video bisa diplay ✓
}

// Error
video.onerror = () => {
  const error = video.error?.code;
  // 1 = ABORTED
  // 2 = NETWORK (koneksi error)
  // 3 = DECODE (format tidak support)
  // 4 = SRC_NOT_SUPPORTED
  // = Video tidak bisa diplay ⚠
}

// Timeout
setTimeout(() => {
  // Jika tidak ada response dalam 10 detik
  // = Assume tidak bisa diplay ⚠
}, 10000);
```

### **Error Types**
```
MEDIA_ERR_ABORTED     = Playback dibatalkan
MEDIA_ERR_NETWORK     = Network/koneksi error
MEDIA_ERR_DECODE      = Codec/format error
MEDIA_ERR_SRC_NOT_SUPPORTED = Format tidak support
```

---

## 💡 Use Cases

### **Case 1: Video Tidak Bisa Dimainkan**
```
User: "Video ini tidak bisa diplay, link error"
Admin: "Buka dashboard → Klik 'Cek Semua Link'"
Result: Video ditandai "⚠ Tidak Bisa Diplay"
Action: Klik "Hapus Tidak Bisa Diplay" → Dihapus otomatis
```

### **Case 2: Bulk Cleanup Non-Playable Videos**
```
Admin: "Berapa banyak video yang tidak bisa diplay?"
System: "5 video ⚠ + 2 video ✗ error"
Admin: Klik "Hapus Tidak Bisa Diplay (7)"
Result: 7 video dihapus, hanya yang ✓ Bisa Diplay tersisa
```

### **Case 3: Monitor Video Health**
```
Before: 100 video, 95 link valid, 100% working
After check: 100 video, 95 link valid, 88 bisa diplay
Issue: 7 video valid tapi tidak bisa diplay
Action: Hapus 7 video tadi
Result: 93 video tersisa, 100% bisa diplay
```

---

## ⚙️ Configuration

### **Timeout Playback Test**
Di `linkValidator.ts`, ubah timeout untuk test playback:
```typescript
const timeout = setTimeout(() => {
  resolve({ playable: false, error: 'Playback test timeout' });
}, 10000); // Ubah 10000 ke nilai lain (ms)
```

### **Timeout Link Check**
Di `linkValidator.ts`, baris HEAD request timeout:
```typescript
const timeoutId = setTimeout(() => controller.abort(), 5000); // Ubah untuk HEAD request
```

---

## 🐛 Troubleshooting

### **Q: Semua video ditandai "Tidak Bisa Diplay"**
**A:**
- Mungkin browser sandbox security issue
- Coba di browser lain (Chrome, Firefox)
- Check console untuk error details
- Cek CORS headers di server CDN

### **Q: Playback test selalu timeout**
**A:**
- Naikkan timeout value di config
- Check koneksi internet
- Server CDN mungkin down
- Coba test satu video manual di player

### **Q: Link valid tapi video masih tidak bisa diplay**
**A:**
- Format video tidak support (codec issue)
- CORS headers tidak allow playback
- Browser tidak support format video
- Server streaming issue

### **Q: Ingin keep video tapi tidak bisa diplay**
**A:**
1. Edit link ke URL alternatif yang bisa diplay
2. Atau test dulu apakah bisa diplay di browser
3. Jika benar tidak bisa diplay, disarankan hapus

---

## 📊 Report Baru

### **Validation Report**
```typescript
const report = await autoCleanupService.validateAndReport(videos);
console.log(report.summary);
/*
{
  total: 100,           // Total video
  valid: 95,            // Link valid
  playable: 88,         // Bisa diplay ✓ (baru!)
  nonPlayable: 7,       // Tidak bisa diplay ⚠ (baru!)
  invalid: 5,           // Link error ✗
  healthPercentage: 88  // % dari playable
}
*/
```

---

## 🎯 Best Practices

1. **Jalankan Check Berkala**
   ```
   Jalankan "Cek Semua Link" seminggu sekali
   ```

2. **Hapus Non-Playable Segera**
   ```
   Jangan tunggu, hapus langsung video yang ⚠
   Karena tidak berguna untuk user
   ```

3. **Monitor Kesehatan Video**
   ```
   Target: 95%+ video bisa diplay
   Alert: Jika di bawah 90%, ada masalah
   ```

4. **Backup Sebelum Bulk Delete**
   ```
   System otomatis backup sebelum hapus
   Tapi juga save ke external backup
   ```

5. **Test Alternatif URL**
   ```
   Jika link utama tidak bisa diplay:
   - Coba edit ke URL alternatif
   - Atau gunakan different CDN
   - Atau re-encode video
   ```

---

## 📝 Contoh Pesan Error

### **MEDIA_ERR_NETWORK (Playback Error)**
```
Arti: Network/koneksi error saat playback
Penyebab: 
  - Server down/tidak merespons
  - CORS headers tidak allow
  - Bad CDN connection
Solusi: 
  - Check server status
  - Update CDN settings
  - Gunakan CDN berbeda
```

### **MEDIA_ERR_DECODE**
```
Arti: Browser tidak bisa decode format video
Penyebab:
  - Format codec tidak support (HEVC, VP9, dll)
  - Corrupted video file
  - Incomplete video upload
Solusi:
  - Re-encode video ke H.264/VP8
  - Check file integrity
  - Re-upload video
```

### **MEDIA_ERR_SRC_NOT_SUPPORTED**
```
Arti: Format MIME type tidak support
Penyebab:
  - Wrong MIME type header
  - Server misconfiguration
  - Browser tidak support format
Solusi:
  - Check Content-Type header
  - Configure server properly
  - Gunakan format yang lebih compatible
```

---

## 🎉 Summary

**Fitur baru memberikan:**
- ✅ Validasi playback yang akurat
- ✅ Deteksi video non-playable otomatis
- ✅ Laporan kesehatan video lebih detail
- ✅ Auto-cleanup yang lebih intelligent
- ✅ Better user experience

**Hasilnya:**
- 📊 Lebih sedikit video yang tidak bisa diplay
- 🎬 User lebih puas karena semua video bisa dimainkan
- 🛠️ Admin panel lebih informatif
- 🚀 System lebih reliable

---

**Selesai! Sistem Anda sekarang lebih smart dalam detect video yang tidak bisa diplay! 🎥✨**
