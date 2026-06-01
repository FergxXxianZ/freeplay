# 📋 Panduan Manajemen Link Video

## 🎯 Fitur Utama

Sistem manajemen link video yang telah saya buat memiliki 3 komponen utama:

### 1. **Link Validator Service** (`linkValidator.ts`)
Untuk memeriksa apakah link video masih bisa diakses atau tidak.

**Fitur:**
- ✓ Cek akses link individual
- ✓ Cek multiple link sekaligus dengan timeout 5 detik
- ✓ Cache hasil validasi (default 60 menit)
- ✓ Simpan/ambil cache dari localStorage

**Contoh Penggunaan:**
```typescript
import { linkValidator } from '../services/linkValidator';

// Cek satu link
const result = await linkValidator.checkLinkAccess('https://cdn2.videy.co/eNukFzWp1.mp4');
console.log(result.isValid); // true/false

// Cek multiple link
const results = await linkValidator.checkMultipleLinks([url1, url2, url3]);

// Simpan cache
linkValidator.saveLinkCheckCache(results);

// Ambil cache (jika ada dan belum expired)
const cached = linkValidator.getLinkCheckCache(60); // 60 menit

// Dapatkan hanya link yang invalid
const invalid = linkValidator.getInvalidLinks(results);
```

---

### 2. **Video Link Manager Component** (`VideoLinkManager.tsx`)
Dashboard interaktif untuk mengelola semua link video.

**Fitur:**
- 📊 Menampilkan statistik (Total, Valid, Rusak, Kesehatan%)
- ✏️ Edit link video secara langsung
- 🗑️ Hapus video individual atau batch (semua link rusak)
- 🔍 Filter berdasarkan status (Semua/Valid/Rusak)
- ⚡ Cek semua link dengan satu klik
- 💾 Export data sebagai JSON file
- 🎨 UI modern dengan Framer Motion animation

**Cara Akses:**
Tambahkan route ke App.tsx:
```typescript
import { AdminLinksPage } from './pages/AdminLinksPage';

// Dalam router
<Route path="/admin/links" element={<AdminLinksPage />} />
```

Lalu akses: `http://localhost:5173/admin/links`

**Tombol-tombol:**
| Tombol | Fungsi |
|--------|--------|
| Cek Semua Link | Memeriksa status semua link (memakan waktu) |
| Hapus Link Rusak | Otomatis hapus semua video dengan link rusak |
| Export JSON | Download data video sebagai file JSON |
| Edit (✏️) | Edit URL video |
| Hapus (🗑️) | Hapus video individual |

---

### 3. **Auto Cleanup Service** (`autoCleanupService.ts`)
Service untuk otomatis mendeteksi dan hapus link yang rusak.

**Fitur:**
- 🤖 Auto-remove video dengan link rusak
- ⏰ Jalankan di background secara berkala
- 📝 Log setiap cleanup yang dilakukan
- 💾 Backup otomatis sebelum cleanup
- 🔄 Restore dari backup jika diperlukan
- 📊 Generate laporan validasi detail

**Contoh Penggunaan:**

#### A. Cek dan bersihkan manual
```typescript
import { autoCleanupService } from '../services/autoCleanupService';
import videoData from '../data/videos.json';

const result = await autoCleanupService.autoRemoveBrokenLinks(videoData as any, 60);
console.log(`Removed: ${result.removed.length} videos`);
console.log(`Remaining: ${result.remaining.length} videos`);
```

#### B. Setup auto-cleanup background (jalankan di App component)
```typescript
useEffect(() => {
  // Jalankan cleanup setiap 60 menit
  const stopCleanup = autoCleanupService.startAutoCleanupInterval(60);
  
  return () => stopCleanup(); // Stop saat component unmount
}, []);
```

#### C. Lihat log cleanup
```typescript
const log = autoCleanupService.getCleanupLog();
console.log(`Last cleanup: ${log.timestamp}`);
console.log(`Removed ${log.removed} videos`);
```

#### D. Restore backup
```typescript
const backup = autoCleanupService.restoreFromBackup();
if (backup) {
  localStorage.setItem('videos_data', JSON.stringify(backup));
  window.location.reload();
}
```

#### E. Generate laporan
```typescript
const report = await autoCleanupService.validateAndReport(videoData as any);
console.log(`Health: ${report.summary.healthPercentage}%`);
console.log(`Invalid videos:`, report.invalidVideos);
```

---

## 🚀 Implementasi di Aplikasi

### Step 1: Update App.tsx
```typescript
import { AdminLinksPage } from './pages/AdminLinksPage';
import { autoCleanupService } from './services/autoCleanupService';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Setup auto-cleanup setiap 60 menit
    const stopCleanup = autoCleanupService.startAutoCleanupInterval(60);
    return () => stopCleanup();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route yang sudah ada */}
        <Route path="/" element={<HomePage />} />
        <Route path="/video/:id" element={<VideoPage />} />
        
        {/* Route baru untuk admin */}
        <Route path="/admin/links" element={<AdminLinksPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 2: Update Navbar untuk akses admin (Optional)
```typescript
// Di Navbar.tsx, tambahkan link ke admin panel
<Link to="/admin/links" className="...">
  ⚙️ Kelola Link
</Link>
```

---

## 💡 Use Cases / Skenario Penggunaan

### 1. **Link Video Error / Tidak Bisa Diplay**
```
1. Buka /admin/links
2. Klik "Cek Semua Link"
3. Tunggu proses selesai
4. Lihat video mana yang berstatus "Rusak"
5. Edit link ke URL yang benar ATAU hapus videonya
6. Simpan perubahan
```

### 2. **Hapus Semua Video dengan Link Rusak Sekaligus**
```
1. Buka /admin/links
2. Klik "Cek Semua Link"
3. Tunggu selesai
4. Klik "Hapus Link Rusak (X)" (X = jumlah yang rusak)
5. Konfirmasi
6. Data secara otomatis tersimpan
```

### 3. **Export Data untuk Backup**
```
1. Buka /admin/links
2. Klik "Export JSON"
3. File `videos_YYYY-MM-DD.json` akan download
4. Simpan sebagai backup
```

### 4. **Otomatis Bersihkan Link Rusak di Background**
```
// Di App.tsx, uncomment line ini:
const stopCleanup = autoCleanupService.startAutoCleanupInterval(60);

// Setiap 60 menit, aplikasi akan:
// - Cek semua link
// - Hapus yang rusak
// - Buat log dan backup
// - Simpan ke localStorage
```

### 5. **Monitoring & Reporting**
```typescript
// Jalankan di console browser:
const report = await autoCleanupService.validateAndReport(videos);
console.table(report.summary);
// Output:
// {
//   total: 100,
//   valid: 95,
//   invalid: 5,
//   healthPercentage: 95
// }
```

---

## 📂 Data & Storage

### LocalStorage Keys:
| Key | Fungsi | Contoh |
|-----|--------|--------|
| `link_validation_cache` | Cache hasil validasi link | `{timestamp, results[]}` |
| `videos_data` | Data video yang sudah diedit | Backup data videos.json |
| `auto_cleanup_log` | Log auto-cleanup terakhir | `{timestamp, removed, removed_videos}` |
| `videos_data_backup` | Backup sebelum cleanup | Full videos data |

### Cara Akses Data di Console:
```javascript
// Lihat semua videos
JSON.parse(localStorage.getItem('videos_data'))

// Lihat validation cache
JSON.parse(localStorage.getItem('link_validation_cache'))

// Lihat cleanup log
JSON.parse(localStorage.getItem('auto_cleanup_log'))

// Clear cache jika perlu
localStorage.removeItem('link_validation_cache')
```

---

## ⚙️ Konfigurasi

### Timeout Link Check
Di `linkValidator.ts`, baris 12:
```typescript
const timeoutId = setTimeout(() => controller.abort(), 5000); // Ubah 5000 ke nilai lain (ms)
```

### Interval Auto-Cleanup
Di App.tsx:
```typescript
autoCleanupService.startAutoCleanupInterval(60); // Ubah 60 ke nilai lain (menit)
```

### Cache Duration
```typescript
linkValidator.getLinkCheckCache(60); // 60 menit, ubah sesuai kebutuhan
```

---

## 🐛 Troubleshooting

### Q: Cek link selalu timeout?
**A:** 
- Periksa koneksi internet
- Naikkan timeout di `linkValidator.ts`
- Server CDN mungkin lagi down

### Q: Perubahan link tidak tersimpan?
**A:**
- Pastikan Anda klik "Simpan" saat edit
- Cek console apakah ada error
- localStorage mungkin penuh, clear cache lama

### Q: Auto-cleanup tidak jalan?
**A:**
- Pastikan `startAutoCleanupInterval()` dipanggil di App.tsx
- Buka DevTools → Console untuk lihat log
- Refresh page

### Q: Ingin restore data yang terhapus?
**A:**
```javascript
// Di console browser:
const backup = JSON.parse(localStorage.getItem('videos_data_backup'));
localStorage.setItem('videos_data', JSON.stringify(backup));
location.reload();
```

---

## 📊 Perbandingan Metode Manajemen

| Metode | Setup | Kemudahan | Otomatis | Real-time |
|--------|-------|----------|----------|-----------|
| Dashboard Admin (UI) | Medium | Sangat Mudah ⭐⭐⭐ | ❌ | ✅ |
| Auto-Cleanup Service | Easy | Mudah | ✅ | ✅ |
| Manual Code | Hard | Sulit | ❌ | ❌ |
| **Kombinasi Keduanya** | **Easy** | **Mudah** | **✅** | **✅** |

**Rekomendasi:** Gunakan kombinasi:
1. Dashboard untuk monitoring dan edit manual
2. Auto-cleanup service untuk maintenance otomatis di background

---

## 📝 Next Steps

1. ✅ Update App.tsx dengan route `/admin/links`
2. ✅ Test dashboard di browser
3. ✅ Setup auto-cleanup jika ingin otomatis
4. ✅ Backup videos.json secara berkala
5. ✅ Monitor kesehatan link secara rutin

Selesai! Anda sekarang memiliki sistem manajemen link yang lengkap dan mudah digunakan. 🎉
