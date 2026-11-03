# Roadmap

## Nâng cấp hệ thống tra cứu: Google Sites + Google Drive (yêu cầu của Thiện, 03/11/2026)
- [x] Khảo sát site nguồn https://sites.google.com/view/dliuschib (~30 trang con, link Drive folder/file công khai)
- [x] Kết nối Google Drive (connector gateway, secret GOOGLE_DRIVE_API_KEY)
- [x] Migration DB: cột nguồn Drive trên `documents`, bảng `site_links`, `sync_runs`, chỉ mục pg_trgm
- [ ] `drive.server.ts` — gọi Drive API qua gateway: list thư mục đệ quy, export Google Docs, tải file
- [ ] `sites-crawler.server.ts` — quét Google Sites, phân loại link, lưu quan hệ trang → tài liệu
- [ ] `sync.server.ts` + `sync.functions.ts` — đồng bộ metadata, trạng thái file mới/sửa/xoá, thống kê
- [ ] Route proxy tải file `/api/public/drive-file/[id]` + route cron `/api/public/hooks/sync-scheduled`
- [ ] pg_cron hằng ngày 00:00 giờ VN gọi route cron (metadata only)
- [ ] Trích xuất nội dung phía trình duyệt cho file Drive đang `pending` (PDF/DOCX/TXT/XLSX), Google Docs/Sheets/Slides export trực tiếp trên server
- [ ] Tìm kiếm hybrid trong chat: metadata (tên file, danh mục, loại, ngày) + semantic; ý định "tìm tài liệu" trả danh sách thẻ tài liệu kèm link Drive mở file gốc
- [ ] Giao diện chat: thẻ kết quả tài liệu + nút "Mở tài liệu trên Google Drive"
- [ ] Giao diện Kho tài liệu: thẻ trạng thái nguồn, nút Đồng bộ ngay, bộ lọc danh mục/loại file/ngày, tự nạp nội dung file pending khi mở trang
- [ ] Kiểm thử end-to-end (Playwright): crawl thật, list Drive thật, hỏi đáp cũ vẫn chạy, tìm tài liệu theo tên/gần nghĩa
