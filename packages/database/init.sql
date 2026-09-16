-- Enable spatial extensions and vector support
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Vector extension for hybrid RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;
