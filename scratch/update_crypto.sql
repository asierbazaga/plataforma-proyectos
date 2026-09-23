CREATE TABLE IF NOT EXISTS public.crypto_assets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    coin_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC(18, 8) NOT NULL,
    buy_price NUMERIC(18, 8) NOT NULL,
    buy_currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crypto_assets DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.crypto_assets TO anon, authenticated, service_role;

-- Añadir al Realtime de Supabase (Opcional, pero recomendado en tu app)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.crypto_assets;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
