-- Nguồn Google Drive + trạng thái đồng bộ cho bảng documents hiện có
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS drive_file_id text,
  ADD COLUMN IF NOT EXISTS drive_url text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS folder_path text,
  ADD COLUMN IF NOT EXISTS modified_time timestamptz,
  ADD COLUMN IF NOT EXISTS sync_status text NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS error_message text;

CREATE UNIQUE INDEX IF NOT EXISTS documents_drive_file_id_uidx
  ON public.documents (drive_file_id) WHERE drive_file_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS documents_sync_status_idx ON public.documents (sync_status);
CREATE INDEX IF NOT EXISTS documents_category_idx ON public.documents (category);

-- Chỉ mục metadata: tìm kiếm từ khóa trên tên văn bản / tên file
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS documents_title_trgm_idx ON public.documents USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS documents_file_name_trgm_idx ON public.documents USING gin (file_name gin_trgm_ops);

-- Kết quả thu thập từ Google Sites
CREATE TABLE IF NOT EXISTS public.site_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  page_title text NOT NULL,
  link_type text NOT NULL,
  url text NOT NULL UNIQUE,
  drive_id text,
  discovered_at timestamptz NOT NULL DEFAULT now()
);

-- Lịch sử đồng bộ
CREATE TABLE IF NOT EXISTS public.sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  trigger_type text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'running',
  pages_scanned int NOT NULL DEFAULT 0,
  folders_scanned int NOT NULL DEFAULT 0,
  files_found int NOT NULL DEFAULT 0,
  files_new int NOT NULL DEFAULT 0,
  files_updated int NOT NULL DEFAULT 0,
  files_removed int NOT NULL DEFAULT 0,
  files_error int NOT NULL DEFAULT 0,
  message text
);

GRANT ALL ON public.site_links TO service_role;
GRANT ALL ON public.sync_runs TO service_role;
ALTER TABLE public.site_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;
