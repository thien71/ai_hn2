ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_type text,
  ADD COLUMN IF NOT EXISTS content_hash text,
  ADD COLUMN IF NOT EXISTS page_count integer,
  ADD COLUMN IF NOT EXISTS needs_ocr boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS documents_content_hash_key ON public.documents (content_hash) WHERE content_hash IS NOT NULL;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS page_from integer,
  ADD COLUMN IF NOT EXISTS page_to integer,
  ADD COLUMN IF NOT EXISTS heading text,
  ADD COLUMN IF NOT EXISTS word_count integer;

DROP FUNCTION IF EXISTS public.match_chunks(vector, integer);
DROP FUNCTION IF EXISTS public.match_chunks(text, integer);

CREATE OR REPLACE FUNCTION public.match_chunks(query_embedding vector(1536), match_count integer DEFAULT 8)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  title text,
  file_name text,
  heading text,
  page_from integer,
  page_to integer,
  content text,
  similarity double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT c.id,
         c.document_id,
         d.title,
         COALESCE(d.file_name, d.title) AS file_name,
         c.heading,
         c.page_from,
         c.page_to,
         c.content,
         1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks c
  JOIN public.documents d ON d.id = c.document_id
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;