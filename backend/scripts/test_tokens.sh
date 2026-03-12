#!/bin/bash

API_URL="http://localhost:5000/api/v1"
EMAIL="testuser@example.com"
PASSWORD="Password123"

echo "--- 🏥 Centralized Clinic Token System - Token Queue Test Suite ---"

# 0. Login as Admin/Doctor
echo "[0] Logging in..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")

if ! echo "$LOGIN_RES" | jq -e '.success' > /dev/null; then
  # Try with New Password
  LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\", \"password\":\"NewPassword123\"}")
fi

ACCESS_TOKEN=$(echo "$LOGIN_RES" | jq -r '.data.tokens.accessToken')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login Failed: $LOGIN_RES"
  exit 1
fi

# Create Clinic and Doctor to test queue
CLINIC_NAME="Token Test Clinic $(date +s)"
CREATE_CLINIC_RES=$(curl -s -X POST "$API_URL/clinics" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$CLINIC_NAME\",
    \"address\": \"101 Queue Street\",
    \"city\": \"Pune\",
    \"state\": \"Maharashtra\",
    \"country\": \"India\",
    \"phone\": \"9123456789\",
    \"email\": \"queue@clinic.com\"
  }")

CLINIC_ID=$(echo "$CREATE_CLINIC_RES" | jq -r '.data.id')

# Add Doctor to clinic
DOCTOR_EMAIL="token_doc_$(date +%s)@example.com"
ADD_DOC_RES=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/doctors" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Dr. Queue Master\",
    \"email\": \"$DOCTOR_EMAIL\",
    \"phone\": \"9$(date +%s | cut -c 2-10)\",
    \"specialization\": \"General Medicine\",
    \"consultationDuration\": 10,
    \"maxTokensPerDay\": 50
  }")

DOCTOR_ID=$(echo "$ADD_DOC_RES" | jq -r '.data.id')

# Create a Patient in the clinic
PATIENT_PHONE="8$(date +%s | cut -c 2-10)"
CREATE_PATIENT_RES=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/patients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Patient Zero\",
    \"phone\": \"$PATIENT_PHONE\",
    \"gender\": \"MALE\"
  }")

PATIENT_ID=$(echo "$CREATE_PATIENT_RES" | jq -r '.data.id')

echo "ℹ️ Setup Complete. Clinic: $CLINIC_ID, Doctor: $DOCTOR_ID, Patient: $PATIENT_ID"

# 1. Generate First Token (Should be 1)
echo -e "\n[1] Generating Token 1..."
TOKEN1_RES=$(curl -s -X POST "$API_URL/tokens" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"clinicId\": \"$CLINIC_ID\",
    \"doctorId\": \"$DOCTOR_ID\",
    \"patientId\": \"$PATIENT_ID\",
    \"tokenType\": \"WALKIN\"
  }")

TOKEN1_NUM=$(echo "$TOKEN1_RES" | jq -r '.data.tokenNumber')
TOKEN1_ID=$(echo "$TOKEN1_RES" | jq -r '.data.id')
EST_WAIT1=$(echo "$TOKEN1_RES" | jq -r '.data.estimatedWaitMinutes')

if [ "$TOKEN1_NUM" == "1" ]; then
  echo "✅ Token 1 Generated. Wait Time: $EST_WAIT1 min"
else
  echo "❌ Token 1 Failed: $TOKEN1_RES"
  exit 1
fi

# 2. Generate Second Token (Should be 2)
echo -e "\n[2] Generating Token 2..."
TOKEN2_RES=$(curl -s -X POST "$API_URL/tokens" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"clinicId\": \"$CLINIC_ID\",
    \"doctorId\": \"$DOCTOR_ID\",
    \"patientId\": \"$PATIENT_ID\",
    \"tokenType\": \"ONLINE\"
  }")

TOKEN2_NUM=$(echo "$TOKEN2_RES" | jq -r '.data.tokenNumber')
EST_WAIT2=$(echo "$TOKEN2_RES" | jq -r '.data.estimatedWaitMinutes')

if [ "$TOKEN2_NUM" == "2" ]; then
  echo "✅ Token 2 Generated. Wait Time: $EST_WAIT2 min"
else
  echo "❌ Token 2 Failed: $TOKEN2_RES"
fi

# 3. Get Queue List
echo -e "\n[3] Fetching Queue List..."
QUEUE_RES=$(curl -s -X GET "$API_URL/doctors/$DOCTOR_ID/queue" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$QUEUE_RES" | jq -e '.data | length == 2' > /dev/null; then
  echo "✅ Queue List matches (Count: 2)"
else
  echo "❌ Queue List mismatch: $QUEUE_RES"
fi

# 4. Call Next Token (Token 1 should become IN_PROGRESS)
echo -e "\n[4] Calling Next Token..."
CALL_NEXT_RES=$(curl -s -X POST "$API_URL/tokens/next" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"doctorId\": \"$DOCTOR_ID\"}")

CURRENT_NUM=$(echo "$CALL_NEXT_RES" | jq -r '.data.tokenNumber')

if [ "$CURRENT_NUM" == "1" ]; then
  echo "✅ Token 1 is now IN_PROGRESS"
else
  echo "❌ Call Next Failed: $CALL_NEXT_RES"
fi

# 5. Check Current Token
echo -e "\n[5] Testing Get Current Token..."
CURRENT_TOKEN_RES=$(curl -s -X GET "$API_URL/doctors/$DOCTOR_ID/current-token" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$CURRENT_TOKEN_RES" | jq -e ".data.tokenNumber == $CURRENT_NUM" > /dev/null; then
  echo "✅ Current Token matches: $CURRENT_NUM"
else
  echo "❌ Current Token mismatch: $CURRENT_TOKEN_RES"
fi

# 6. Skip Token 2
echo -e "\n[6] Skipping Token 2..."
TOKEN2_ID=$(echo "$TOKEN2_RES" | jq -r '.data.id')
SKIP_RES=$(curl -s -X PATCH "$API_URL/tokens/$TOKEN2_ID/skip" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$SKIP_RES" | jq -e '.data.status == "SKIPPED"' > /dev/null; then
  echo "✅ Token 2 Skipped"
else
  echo "❌ Skip Failed: $SKIP_RES"
fi

echo -e "\n--- 🏁 Token Queue Test Suite Completed ---"
