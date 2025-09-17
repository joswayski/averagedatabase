#!/bin/bash

API_KEY="341675"

echo "Storing animal vectors..."

# Store cat vector
curl -s -X POST http://localhost:8080/vectors \
  -H "x-averagedb-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"vector\": $(cat cat_vector.json),
    \"metadata\": {
      \"text\": \"cats are cute fluffy pets that love to sleep and purr\",
      \"category\": \"animals\"
    }
  }" | jq '.message'

# Store dog vector  
curl -s -X POST http://localhost:8080/vectors \
  -H "x-averagedb-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"vector\": $(cat dog_vector.json),
    \"metadata\": {
      \"text\": \"dogs are loyal companion animals that love to play fetch and bark\",
      \"category\": \"animals\"
    }
  }" | jq '.message'

# Store bird vector
curl -s -X POST http://localhost:8080/vectors \
  -H "x-averagedb-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"vector\": $(cat bird_vector.json),
    \"metadata\": {
      \"text\": \"birds are beautiful flying animals with feathers and wings\",
      \"category\": \"animals\"
    }
  }" | jq '.message'

echo "Storing food vectors..."

# Store pizza vector
curl -s -X POST http://localhost:8080/vectors \
  -H "x-averagedb-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"vector\": $(cat pizza_vector.json),
    \"metadata\": {
      \"text\": \"pizza is delicious Italian food with cheese and tomato sauce\",
      \"category\": \"food\"
    }
  }" | jq '.message'

# Store burger vector
curl -s -X POST http://localhost:8080/vectors \
  -H "x-averagedb-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"vector\": $(cat burger_vector.json),
    \"metadata\": {
      \"text\": \"burgers are tasty grilled meat sandwiches with lettuce and pickles\",
      \"category\": \"food\"
    }
  }" | jq '.message'

# Store cake vector
curl -s -X POST http://localhost:8080/vectors \
  -H "x-averagedb-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"vector\": $(cat cake_vector.json),
    \"metadata\": {
      \"text\": \"chocolate cake is sweet dessert food that makes people happy\",
      \"category\": \"food\"
    }
  }" | jq '.message'

echo "All vectors stored!"
