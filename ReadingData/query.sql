-- Create a table to store your documents
create table handbook_docs (
  id bigserial primary key,
  content text, -- corresponds to the "text chunk"
  embedding vector(4096) -- 4096 is the dimension of our embeddings
);