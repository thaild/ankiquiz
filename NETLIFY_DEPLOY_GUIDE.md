# Netlify Auto-Deploy & Cache Management

## 🚀 Tự động Deploy khi có thay đổi file `index.json`

### Cấu hình đã thiết lập:

1. **Netlify Configuration (`netlify.toml`)**:
   - ✅ Không cache file `index.json` (luôn load fresh data)
   - ✅ Tự động deploy khi có thay đổi
   - ✅ Cache static assets khác

2. **Build Scripts**:
   - ✅ `npm run build` - Generate index files + build
   - ✅ `npm run clear-cache` - Clear Netlify cache
   - ✅ `npm run generate-indexes` - Generate index files only

3. **GitHub Actions**:
   - ✅ Tự động deploy khi push changes vào `public/data/**`
   - ✅ Generate index files trước khi deploy
   - ✅ Clear cache và deploy fresh

## 📋 Cách sử dụng:

### 1. Thay đổi file data:

```bash
# Thêm/sửa/xóa file .js trong thư mục exam
# Ví dụ: public/data/pma/mock_test/mock_test20.js

# Commit và push
git add .
git commit -m "Add new mock test 20"
git push origin main
```

### 2. Manual deploy (nếu cần):

```bash
# Generate index files
npm run generate-indexes

# Build và deploy
npm run build

# Clear cache (nếu cần)
npm run clear-cache
```

### 3. Kiểm tra deployment:

- GitHub Actions sẽ tự động chạy
- Netlify sẽ deploy với fresh data
- File `index.json` sẽ được load mới (không cache)

## 🔧 Cấu hình Netlify:

### Environment Variables cần thiết:

```bash
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id
```

### Headers được set:

- `index.json` files: `no-cache, no-store, must-revalidate`
- Static assets: `max-age=31536000, immutable`
- HTML files: `max-age=0, must-revalidate`

## 🎯 Kết quả:

✅ **Tự động deploy** khi có thay đổi data  
✅ **Không cache** file `index.json`  
✅ **Fresh data** mỗi lần load  
✅ **Performance** tốt cho static assets  
✅ **Zero maintenance** - hoạt động tự động

## 🚨 Troubleshooting:

### Nếu cache không clear:

```bash
# Force clear cache
npm run clear-cache

# Hoặc manual clear trên Netlify dashboard
# Site settings > Build & deploy > Post processing > Clear cache
```

### Nếu không auto-deploy:

- Kiểm tra GitHub Actions logs
- Đảm bảo có `NETLIFY_AUTH_TOKEN` và `NETLIFY_SITE_ID`
- Kiểm tra file paths trong GitHub Actions

### Nếu index.json không update:

- Kiểm tra script `generate-indexes`
- Đảm bảo file .js có trong thư mục exam
- Chạy manual: `npm run generate-indexes`
