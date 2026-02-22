#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🧹 Cleaning DB..."
curl -X DELETE $BASE_URL/ingest

echo -e "\n\n📝 1. Creating New Incident (v1)..."
RES=$(curl -s -X POST $BASE_URL/ingest -H "Content-Type: application/json" -d '{
    "message": "Connection Timeout on DB-01",
    "serviceName": "PaymentService",
    "environment": "prod",
    "stackTrace": "System.TimeoutException...",
    "metadata": { "user": "test" }
}')
echo $RES
ID=$(echo $RES | jq -r .incidentId)
echo "   ID=$ID"

echo -e "\n\n📝 2. Updating Active Incident (v1 increment)..."
curl -s -X POST $BASE_URL/ingest -H "Content-Type: application/json" -d '{
    "message": "Connection Timeout on DB-01",
    "serviceName": "PaymentService",
    "environment": "prod",
    "stackTrace": "System.TimeoutException...",
    "metadata": { "user": "test2" }
}'

echo -e "\n\n📝 3. Simulating Resolution (Mark as FIXED)..."
curl -s -X POST $BASE_URL/ingest/$ID/status -H "Content-Type: application/json" -d '{
    "status": "FIXED"
}'
echo "   Marked $ID as FIXED"

echo -e "\n\n📝 4. Triggering Regression (New Log with same signature)..."
RES2=$(curl -s -X POST $BASE_URL/ingest -H "Content-Type: application/json" -d '{
    "message": "Connection Timeout on DB-01",
    "serviceName": "PaymentService",
    "environment": "prod",
    "stackTrace": "System.TimeoutException...",
    "metadata": { "user": "test3", "comment": "Regression!" }
}')
echo $RES2
ID2=$(echo $RES2 | jq -r .incidentId)

if [ "$ID" == "$ID2" ]; then
    echo "❌ FAIL: Expected new ID for regression, got same ID."
else
    echo "✅ PASS: New ID created for Regression ($ID2)."
fi

echo -e "\n\n🔍 Listing Incidents..."
curl -s $BASE_URL/ingest | jq .
