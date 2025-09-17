## Blazingly Fast

## Vector Database Support 🚀

AvgDB now features enterprise-grade vector support for all your AI/ML/RAG/buzzword needs!

### Store Vectors
`POST /vectors`

Store your high-dimensional vectors in our quantum-powered multidimensional hyperspace (it's just RAM).

```json
{
  "vector": [0.1, 0.2, 0.3, 0.4],
  "metadata": {
    "description": "My totally important vector",
    "category": "embeddings"
  }
}
```

**Features:**
- Up to 10,000 dimensions (our servers aren't quantum computers... yet)
- Validates against NaN and infinity (we're professionals)
- Metadata support for all your organizational needs

### Search Vectors
`POST /vectors/search`

Find similar vectors using our proprietary cosine similarity algorithm (it's just basic math but "proprietary" sounds better).

```json
{
  "query_vector": [0.1, 0.2, 0.3, 0.4],
  "top_k": 5
}
```

**Returns:**
- Similarity scores (higher = more similar)
- Original vectors and metadata
- Results sorted by relevance (we know what we're doing)

**Perfect for:**
- RAG applications
- Semantic search
- Finding that one vector you stored yesterday
- Impressing your AI team with "vector database capabilities"

### Generate Embeddings (NEW! 🔥)
`POST /embeddings`

Don't have vectors? No problem! Our proprietary embedding models will convert your text into enterprise-grade vectors using cutting-edge algorithms!

```json
{
  "text": "I love cats and they are fluffy",
  "model": "avgdb-semantic-v1"
}
```

**Available Models:**
- `avgdb-semantic-v1` - Our GPT-killer contextual understanding engine (actually finds similar concepts!)
- `avgdb-frequency-v1` - Advanced character frequency semantic mapping (surprisingly effective)
- `avgdb-hash-v1` - Deterministic character-based vector generation (consistent but basic)

**Response:**
```json
{
  "message": "Text successfully processed by our AvgDB Semantic Intelligence v1.0...",
  "embedding": [0.123, -0.456, 0.789, ...],
  "dimensions": 128,
  "model_used": "avgdb-semantic-v1"
}
```

**Complete RAG Workflow Example:**
```bash
# 1. Generate embedding for your knowledge
curl -X POST "/embeddings" -d '{"text": "Paris is the capital of France"}'

# 2. Store the vector (copy embedding from step 1)
curl -X POST "/vectors" -d '{"vector": [0.1, 0.2, ...], "metadata": {"text": "Paris is the capital of France"}}'

# 3. Generate embedding for user question
curl -X POST "/embeddings" -d '{"text": "What is the capital of France?"}'

# 4. Search with question embedding
curl -X POST "/vectors/search" -d '{"query_vector": [0.1, 0.2, ...], "top_k": 5}'
```

**Why our embeddings work:**
- Semantic understanding (actually groups similar concepts)
- Deterministic (same text = same vector)
- Fast (no API calls to OpenAI needed)
- Satirical (but surprisingly functional)
