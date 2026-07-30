REVOKE EXECUTE ON FUNCTION public.match_chunks(vector, int) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.match_chunks(vector, int) TO service_role;