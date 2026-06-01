# 🔧 Setup Quick Start - Manajemen Link Video

## ⚡ 3 Langkah Mudah untuk Mengaktifkan Sistem

### **Langkah 1: Update App.tsx - Tambah Import**

Buka file `src/App.tsx` dan tambahkan dua import baru di bagian atas:

```typescript
// Setelah import yang sudah ada
import { AdminLinksPage } from './pages/AdminLinksPage';
import { autoCleanupService } from './services/autoCleanupService';
```

**Posisi Seharusnya:**
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { VideoPage } from './pages/VideoPage';
import { AdminLinksPage } from './pages/AdminLinksPage';  // ← TAMBAH INI
import { autoCleanupService } from './services/autoCleanupService';  // ← TAMBAH INI
import { Play } from 'lucide-react';
```

---

### **Langkah 2: Update App.tsx - Tambah Route**

Di dalam `<Routes>`, tambahkan route baru untuk admin panel:

```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/page/:pageNumber" element={<HomePage />} />
  <Route path="/video/:id" element={<VideoPage />} />
  <Route path="/admin/links" element={<AdminLinksPage />} />  {/* ← TAMBAH INI */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

### **Langkah 3 (OPTIONAL): Setup Auto-Cleanup**

Jika Anda ingin sistem secara otomatis membersihkan link rusak di background, tambahkan `useEffect`:

```typescript
import { useEffect } from 'react';  // ← TAMBAH INI di import React

export default function App() {
  // ← TAMBAH BLOK INI
  useEffect(() => {
    // Setup auto-cleanup setiap 60 menit
    // Ganti 60 dengan nilai lain (dalam menit) jika perlu
    const stopCleanup = autoCleanupService.startAutoCleanupInterval(60);
    
    // Cleanup saat component unmount
    return () => stopCleanup();
  }, []);

  return (
    <Router>
      {/* ... rest of code ... */}
    </Router>
  );
}
```

---

## 🎯 Hasil Akhir

Setelah 3 langkah di atas, file `App.tsx` akan terlihat seperti ini:

```typescript
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { VideoPage } from './pages/VideoPage';
import { AdminLinksPage } from './pages/AdminLinksPage';
import { autoCleanupService } from './services/autoCleanupService';
import { Play } from 'lucide-react';

export default function App() {
  useEffect(() => {
    const stopCleanup = autoCleanupService.startAutoCleanupInterval(60);
    return () => stopCleanup();
  }, []);

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#141414', color: '#e5e5e5', fontFamily: 'Inter, sans-serif' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/page/:pageNumber" element={<HomePage />} />
            <Route path="/video/:id" element={<VideoPage />} />
            <Route path="/admin/links" element={<AdminLinksPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer dan seterusnya... */}
      </div>
    </Router>
  );
}
```

---

## 🚀 Testing

Setelah setup selesai:

1. **Buka admin panel:**
   ```
   http://localhost:5173/admin/links
   ```

2. **Test tombol "Cek Semua Link"**
   - Tunggu proses selesai
   - Lihat link mana yang valid/rusak

3. **Test edit link:**
   - Klik ✏️ pada video
   - Ubah URL
   - Klik Simpan

4. **Test hapus:**
   - Klik 🗑️ pada video
   - Konfirmasi penghapusan

5. **Test batch delete:**
   - Klik "Cek Semua Link"
   - Klik "Hapus Link Rusak (X)"
   - Semua video dengan link rusak akan terhapus otomatis

---

## 📊 Memahami Sistem

### **3 Komponen Utama:**

1. **Link Validator** (`linkValidator.ts`)
   - Cek apakah link bisa diakses
   - Cache hasil untuk efisiensi
   - Digunakan oleh admin panel dan auto-cleanup

2. **Video Link Manager** (`VideoLinkManager.tsx`)
   - UI dashboard untuk manage links
   - Edit, hapus, lihat status link
   - Akses di `/admin/links`

3. **Auto Cleanup Service** (`autoCleanupService.ts`)
   - Jalankan di background secara berkala
   - Otomatis hapus link rusak
   - Buat log dan backup otomatis

---

## 💡 Workflow Rekomendasi

### **Untuk Maintenance Harian:**
```
1. Buka http://localhost:5173/admin/links
2. Klik "Cek Semua Link"
3. Lihat berapa banyak yang valid
4. Klik "Hapus Link Rusak (X)" jika ada yang rusak
5. Lakukan perbaikan jika diperlukan
```

### **Untuk Automation (Jalankan Otomatis):**
```
1. Setup sudah otomatis di App.tsx
2. Sistem akan berjalan setiap 60 menit di background
3. Lihat log cleanup di localStorage:
   localStorage.getItem('auto_cleanup_log')
4. Tidak perlu intervensi manual
```

### **Untuk Backup & Recovery:**
```
// Lihat backup terakhir
JSON.parse(localStorage.getItem('videos_data_backup'))

// Restore jika diperlukan
const backup = JSON.parse(localStorage.getItem('videos_data_backup'));
localStorage.setItem('videos_data', JSON.stringify(backup));
location.reload();
```

---

## ✅ Checklist Setup

- [ ] Sudah menambah `AdminLinksPage` import
- [ ] Sudah menambah `autoCleanupService` import
- [ ] Sudah menambah route `/admin/links`
- [ ] Sudah menambah `useEffect` untuk auto-cleanup (optional)
- [ ] Sudah test akses `/admin/links`
- [ ] Sudah test tombol "Cek Semua Link"
- [ ] Sudah test edit dan hapus

---

## 🎓 Informasi Tambahan

### **LocalStorage Keys yang Digunakan:**
- `link_validation_cache` - Cache hasil check link
- `videos_data` - Data video yang sudah diedit
- `auto_cleanup_log` - Log cleanup terakhir
- `videos_data_backup` - Backup sebelum cleanup

### **Environment:**
- Tidak perlu backend server
- Semua berjalan di client-side
- Data tersimpan di localStorage dan videos.json

### **Browser Support:**
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- IE: ❌ Tidak didukung (gunakan fetch API)

---

## 📞 Need Help?

Jika ada masalah saat setup:

1. **Buka DevTools** (F12) → Console untuk melihat error
2. **Cek path file** - pastikan semua file sudah ada
3. **Clear cache** - jalankan `localStorage.clear()` di console
4. **Refresh page** - `Ctrl+Shift+R` atau `Cmd+Shift+R`

**Selamat! Sistem manajemen link Anda sudah siap! 🎉**
