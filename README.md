# Form Autofiller ID

Extension browser universal (Chrome & Opera) untuk mengisi form web dengan data fake Indonesia yang realistis dan koheren.

## Instalasi Cepat

```bash
npm install
npm run build
```

Lalu di Chrome/Opera, **Load unpacked** dan pilih folder:

```
F:\www\extension-autofiller\extension
```

> **PENTING:** Jangan load folder `extension-autofiller` (root).  
> Load subfolder **`extension`** yang berisi `manifest.json` hasil build.

## Fitur

- Generator profil Indonesia lengkap (nama, email, telepon, NIK, alamat, dll.)
- Data koheren: provinsi, kota, kecamatan, dan kelurahan saling cocok
- Setiap generate menghasilkan data berbeda
- Deteksi field cerdas berdasarkan label, placeholder, autocomplete, dan keyword
- Dukungan input text, textarea, select, radio, dan date
- Popup UI + keyboard shortcut `Alt+Shift+F`

## Chrome

1. Buka `chrome://extensions`
2. Aktifkan **Developer mode**
3. Klik **Load unpacked**
4. Pilih folder `extension` (bukan folder root proyek)

## Opera

1. Buka `opera://extensions`
2. Aktifkan **Developer mode**
3. Klik **Load unpacked**
4. Pilih folder `extension`

## Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Manifest file is missing` | Load folder root proyek | Load folder `extension/` setelah `npm run build` |
| `Invalid script mime type` / `.ts` | Load folder root/salah | Hapus extension lama, load `extension/` |

## Cara Pakai

1. Buka halaman yang memiliki form
2. Klik ikon extension → **Isi Form**
3. Atau shortcut: `Alt+Shift+F`

## Development

```bash
npm run dev
```

Lalu load folder `extension/` (akan di-rebuild otomatis).

## Struktur

- `manifest.config.json` - konfigurasi sumber untuk build
- `src/` - kode TypeScript
- `extension/` - **hasil build, folder ini yang di-load ke browser**
