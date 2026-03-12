#!/bin/bash

API_URL="http://localhost:5000/api/v1"
EMAIL="testuser@example.com"
PASSWORD="Password123"

echo "--- 🏥 Centralized Clinic Token System - Clinic Test Suite ---"

# 0. Login to get token
echo "[0] Logging in..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")

if ! echo "$LOGIN_RES" | jq -e '.success' > /dev/null; then
  # Try with New Password if previous test left it changed
  LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\", \"password\":\"NewPassword123\"}")
fi

ACCESS_TOKEN=$(echo "$LOGIN_RES" | jq -r '.data.tokens.accessToken')

if [ "$ACCESS_TOKEN" == "null" ]; then
  echo "❌ Login failed. Ensure Auth tests ran first."
  exit 1
fi

# 1. Create Clinic
echo -e "\n[1] Testing Create Clinic..."
CREATE_RES=$(curl -s -X POST "$API_URL/clinics" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"City Health Clinic\",
    \"address\": \"123 Medical Ave\",
    \"city\": \"Surat\",
    \"state\": \"Gujarat\",
    \"country\": \"India\",
    \"phone\": \"9876543210\",
    \"email\": \"contact@cityhealth.com\"
  }")

CLINIC_ID=$(echo "$CREATE_RES" | jq -r '.data.id')

if [ "$CLINIC_ID" != "null" ]; then
  echo "✅ Clinic Created: $CLINIC_ID"
else
  echo "❌ Create Clinic Failed: $CREATE_RES"
  exit 1
fi

# 2. Get Clinics List (with city filter)
echo -e "\n[2] Testing List Clinics (City: Surat)..."
LIST_RES=$(curl -s -X GET "$API_URL/clinics?city=Surat" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$LIST_RES" | jq -e '.data | length > 0' > /dev/null; then
  echo "✅ List Clinics Successful"
else
  echo "❌ List Clinics Failed"
fi

# 3. Get Clinic Details
echo -e "\n[3] Testing Get Clinic Details..."
DETAILS_RES=$(curl -s -X GET "$API_URL/clinics/$CLINIC_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$DETAILS_RES" | jq -e ".data.id == \"$CLINIC_ID\"" > /dev/null; then
  echo "✅ Get Clinic Details Successful"
else
  echo "❌ Get Clinic Details Failed"
fi

# 4. Update Clinic
echo -e "\n[4] Testing Update Clinic..."
UPDATE_RES=$(curl -s -X PATCH "$API_URL/clinics/$CLINIC_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"City Super Health Clinic\"}")

if echo "$UPDATE_RES" | jq -r '.data.name' | grep -q "Super"; then
  echo "✅ Update Clinic Successful"
else
  echo "❌ Update Clinic Failed"
fi

# 5. Invite Staff
echo -e "\n[5] Testing Invite Staff (Doctor)..."
INVITE_RES=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/invite" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"doctor1@example.com\", \"role\": \"DOCTOR\"}")

if echo "$INVITE_RES" | jq -e '.success' > /dev/null; then
  echo "✅ Invite Staff Successful"
else
  echo "❌ Invite Staff Failed: $INVITE_RES"
fi

# 6. List Members
echo -e "\n[6] Testing List Clinic Members..."
MEMBERS_RES=$(curl -s -X GET "$API_URL/clinics/$CLINIC_ID/members" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$MEMBERS_RES" | jq -e '.data | length >= 2' > /dev/null; then
  echo "✅ List Members Successful (Found Admin + Doctor)"
else
  echo "❌ List Members Failed"
fi

echo -e "\n--- 🏁 Clinic Test Suite Completed ---"
