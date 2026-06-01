# 💻 Contoh Kode & Use Cases

## 1️⃣ Cek Satu Link Apakah Valid

```typescript
import { linkValidator } from './services/linkValidator';

async function checkOneLink() {
  const url = 'https://cdn2.videy.co/eNukFzWp1.mp4';
  const result = await linkValidator.checkLinkAccess(url);
  
  console.log(`URL: ${result.video_url}`);
  console.log(`Valid: ${result.isValid}`);
  console.log(`Status: ${result.statusCode}`);
  console.log(`Error: ${result.error}`);
  
  if (result.isValid) {
    console.log('✅ Link bisa diakses');
  } else {
    console.log('❌ Link tidak bisa diakses');
  }
}

checkOneLink();
```

**Output:**
```
URL: https://cdn2.videy.co/eNukFzWp1.mp4
Valid: true
Status: 200
Error: undefined
✅ Link bisa diakses
```

---

## 2️⃣ Cek Multiple Links Sekaligus

```typescript
import { linkValidator } from './services/linkValidator';

async function checkAllLinks() {
  const urls = [
    'https://cdn2.videy.co/eNukFzWp1.mp4',
    'https://cdn2.slicedrive.com/0U7TGpzO1.mp4',
    'https://example.com/broken.mp4', // Link rusak
  ];
  
  console.log('🔄 Sedang memeriksa links...');
  const results = await linkValidator.checkMultipleLinks(urls);
  
  results.forEach(result => {
    const status = result.isValid ? '✅' : '❌';
    console.log(`${status} ${result.video_url}`);
  });
  
  // Simpan ke cache
  linkValidator.saveLinkCheckCache(results);
  console.log('💾 Hasil disimpan ke cache');
}

checkAllLinks();
```

**Output:**
```
🔄 Sedang memeriksa links...
✅ https://cdn2.videy.co/eNukFzWp1.mp4
✅ https://cdn2.slicedrive.com/0U7TGpzO1.mp4
❌ https://example.com/broken.mp4
💾 Hasil disimpan ke cache
```

---

## 3️⃣ Dapatkan Link yang Rusak

```typescript
import { linkValidator } from './services/linkValidator';
import videoData from './data/videos.json';
import { Video } from './types';

async function findBrokenLinks() {
  const urls = (videoData as Video[]).map(v => v.video_url);
  const results = await linkValidator.checkMultipleLinks(urls);
  
  const invalidResults = linkValidator.getInvalidLinks(results);
  const videos = videoData as Video[];
  
  const brokenVideos = videos.filter(v =>
    invalidResults.some(r => r.video_url === v.video_url)
  );
  
  console.log(`\n📊 Statistik:`);
  console.log(`Total video: ${videos.length}`);
  console.log(`Link valid: ${results.length - invalidResults.length}`);
  console.log(`Link rusak: ${invalidResults.length}`);
  console.log(`Persentase kesehatan: ${((results.length - invalidResults.length) / results.length * 100).toFixed(1)}%`);
  
  console.log(`\n❌ Video dengan link rusak:`);
  brokenVideos.forEach(v => {
    console.log(`- ${v.title} (ID: ${v.id})`);
  });
}

findBrokenLinks();
```

**Output:**
```
📊 Statistik:
Total video: 50
Link valid: 48
Link rusak: 2
Persentase kesehatan: 96.0%

❌ Video dengan link rusak:
- Skandal Bikin Lemes (ID: eNukFzWp1)
- Full Di Hutan (ID: 2wv1ekzl1)
```

---

## 4️⃣ Otomatis Hapus Video dengan Link Rusak

```typescript
import { autoCleanupService } from './services/autoCleanupService';
import videoData from './data/videos.json';
import { Video } from './types';

async function autoCleanBrokenLinks() {
  console.log('🤖 Memulai auto-cleanup...\n');
  
  const result = await autoCleanupService.autoRemoveBrokenLinks(videoData as Video[], 60);
  
  console.log(`📊 Hasil:`);
  console.log(`Video dihapus: ${result.removed.length}`);
  console.log(`Video tersisa: ${result.remaining.length}`);
  
  if (result.removed.length > 0) {
    console.log(`\n🗑️ Video yang dihapus:`);
    result.removed.forEach(v => {
      console.log(`- ${v.title}`);
    });
    
    // Simpan video yang tersisa
    localStorage.setItem('videos_data', JSON.stringify(result.remaining));
    console.log('\n✅ Data disimpan ke localStorage');
  } else {
    console.log('✅ Tidak ada video yang perlu dihapus');
  }
}

autoCleanBrokenLinks();
```

**Output:**
```
🤖 Memulai auto-cleanup...

📊 Hasil:
Video dihapus: 3
Video tersisa: 47

🗑️ Video yang dihapus:
- Skandal Bikin Lemes
- Full Di Hutan
- Video Rusak Lainnya

✅ Data disimpan ke localStorage
```

---

## 5️⃣ Lihat Hasil Auto-Cleanup Terakhir

```typescript
import { autoCleanupService } from './services/autoCleanupService';

function showCleanupLog() {
  const log = autoCleanupService.getCleanupLog();
  
  if (!log) {
    console.log('Belum ada log cleanup');
    return;
  }
  
  console.log('📋 Log Auto-Cleanup Terakhir:');
  console.log(`⏰ Waktu: ${new Date(log.timestamp).toLocaleString('id-ID')}`);
  console.log(`🗑️ Dihapus: ${log.removed} video`);
  console.log(`📊 Tersisa: ${log.remaining} video`);
  console.log(`\nDetail video yang dihapus:`);
  
  log.removedVideos.forEach(v => {
    console.log(`- ${v.title} (${v.video_url})`);
  });
}

showCleanupLog();
```

**Output:**
```
📋 Log Auto-Cleanup Terakhir:
⏰ Waktu: 1/6/2026, 14:30:45
🗑️ Dihapus: 2 video
📊 Tersisa: 48 video

Detail video yang dihapus:
- Old Video 1 (https://example.com/old1.mp4)
- Old Video 2 (https://example.com/old2.mp4)
```

---

## 6️⃣ Generate Laporan Kesehatan Link

```typescript
import { autoCleanupService } from './services/autoCleanupService';
import videoData from './data/videos.json';
import { Video } from './types';

async function generateHealthReport() {
  console.log('📊 Generating health report...\n');
  
  const report = await autoCleanupService.validateAndReport(videoData as Video[]);
  
  console.log('═══════════════════════════════');
  console.log('📊 LINK HEALTH REPORT');
  console.log('═══════════════════════════════\n');
  
  console.log('Summary:');
  console.log(`  Total Videos: ${report.summary.total}`);
  console.log(`  Valid Links: ${report.summary.valid} ✅`);
  console.log(`  Invalid Links: ${report.summary.invalid} ❌`);
  console.log(`  Health: ${report.summary.healthPercentage}%`);
  
  if (report.invalidVideos.length > 0) {
    console.log(`\n❌ Videos with Broken Links (${report.invalidVideos.length}):`);
    report.invalidVideos.forEach(v => {
      console.log(`  - ${v.title}`);
      console.log(`    URL: ${v.video_url}`);
      console.log(`    Error: ${v.error}\n`);
    });
  }
  
  console.log('\n═══════════════════════════════');
}

generateHealthReport();
```

**Output:**
```
📊 Generating health report...

═══════════════════════════════
📊 LINK HEALTH REPORT
═══════════════════════════════

Summary:
  Total Videos: 50
  Valid Links: 48 ✅
  Invalid Links: 2 ❌
  Health: 96%

❌ Videos with Broken Links (2):
  - Old Video 1
    URL: https://cdn2.videy.co/old1.mp4
    Error: HTTP Error 404

  - Old Video 2
    URL: https://example.com/broken.mp4
    Error: Network timeout
```

---

## 7️⃣ Restore Backup Data

```typescript
import { autoCleanupService } from './services/autoCleanupService';

function restoreBackupData() {
  const backup = autoCleanupService.restoreFromBackup();
  
  if (!backup) {
    console.log('❌ Tidak ada backup ditemukan');
    return;
  }
  
  console.log('📥 Restore dari backup...');
  console.log(`Backup contains ${backup.length} videos`);
  
  // Konfirmasi sebelum restore
  if (confirm(`Restore ${backup.length} videos dari backup? Data sekarang akan ditimpa.`)) {
    localStorage.setItem('videos_data', JSON.stringify(backup));
    console.log('✅ Backup berhasil di-restore');
    console.log('🔄 Silakan refresh halaman...');
    // window.location.reload(); // Uncomment untuk auto-reload
  } else {
    console.log('Restore dibatalkan');
  }
}

restoreBackupData();
```

---

## 8️⃣ Monitoring Mode - Real-time Check

```typescript
import { linkValidator } from './services/linkValidator';
import videoData from './data/videos.json';
import { Video } from './types';

async function monitoringMode() {
  console.log('🔍 Monitoring Mode - Cek setiap 30 detik\n');
  
  const checkInterval = setInterval(async () => {
    const urls = (videoData as Video[]).map(v => v.video_url);
    const results = await linkValidator.checkMultipleLinks(urls);
    
    const invalid = results.filter(r => !r.isValid).length;
    const valid = results.filter(r => r.isValid).length;
    
    console.log(`⏰ ${new Date().toLocaleTimeString()} | ✅ ${valid} | ❌ ${invalid}`);
  }, 30000);
  
  // Stop after 5 minutes
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('\n✅ Monitoring selesai');
  }, 5 * 60 * 1000);
}

// monitoringMode();
```

---

## 9️⃣ Integration di React Component

```typescript
import React, { useEffect, useState } from 'react';
import { linkValidator, LinkCheckResult } from './services/linkValidator';
import { autoCleanupService } from './services/autoCleanupService';

export function LinkHealthComponent() {
  const [health, setHealth] = useState<number>(0);
  const [checking, setChecking] = useState(false);
  
  const checkHealth = async () => {
    setChecking(true);
    
    const report = await autoCleanupService.validateAndReport(
      JSON.parse(localStorage.getItem('videos_data') || '[]')
    );
    
    setHealth(report.summary.healthPercentage);
    setChecking(false);
  };
  
  useEffect(() => {
    checkHealth();
    
    // Auto-check setiap jam
    const interval = setInterval(checkHealth, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h3>Link Health Status</h3>
      <div className={`text-3xl font-bold ${health > 80 ? 'text-green-500' : 'text-red-500'}`}>
        {health}%
      </div>
      <button 
        onClick={checkHealth}
        disabled={checking}
        className="mt-2 px-4 py-2 bg-blue-600 rounded text-white"
      >
        {checking ? 'Checking...' : 'Check Now'}
      </button>
    </div>
  );
}
```

---

## 🔟 Schedule Auto-Cleanup dengan Specific Time

```typescript
import { autoCleanupService } from './services/autoCleanupService';
import videoData from './data/videos.json';
import { Video } from './types';

function scheduleCleanupAtSpecificTime(hour: number, minute: number) {
  const checkSchedule = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    
    // Jika sudah lewat, set untuk besok
    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilExecution = scheduledTime.getTime() - now.getTime();
    
    console.log(`⏰ Cleanup dijadwalkan pada ${scheduledTime.toLocaleTimeString()}`);
    console.log(`⏳ Dalam ${Math.round(timeUntilExecution / 1000 / 60)} menit\n`);
    
    setTimeout(async () => {
      console.log('🤖 Menjalankan scheduled cleanup...');
      const result = await autoCleanupService.autoRemoveBrokenLinks(
        videoData as Video[]
      );
      console.log(`✅ Cleanup selesai. Dihapus: ${result.removed.length} videos`);
      
      // Schedule ulang untuk besok
      checkSchedule();
    }, timeUntilExecution);
  };
  
  checkSchedule();
}

// Jalankan cleanup setiap hari jam 2 pagi
// scheduleCleanupAtSpecificTime(2, 0);
```

---

## Cara Menjalankan Contoh

### **Di Browser Console:**
```javascript
// Copy-paste salah satu fungsi di atas, lalu panggil:
checkAllLinks();
findBrokenLinks();
autoCleanBrokenLinks();
showCleanupLog();
generateHealthReport();
restoreBackupData();
```

### **Di React Component (App.tsx atau komponen lain):**
```typescript
useEffect(() => {
  checkHealth();
}, []);
```

### **Sebagai Background Service:**
```typescript
// Di App.tsx
useEffect(() => {
  const stop = autoCleanupService.startAutoCleanupInterval(60);
  return () => stop();
}, []);
```

---

## 📌 Catatan Penting

- Semua fungsi adalah **async**, gunakan `await` atau `.then()`
- Cache default adalah **60 menit**, ubah sesuai kebutuhan
- Data disimpan di **localStorage**, bukan di server
- **Timeout link check adalah 5 detik**, ubah jika perlu
- Backup otomatis dibuat sebelum cleanup

**Selamat bereksperimen! 🚀**
