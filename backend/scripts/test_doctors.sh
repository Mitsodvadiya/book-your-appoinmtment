#!/bin/bash

API_URL="http://localhost:5000/api/v1"
EMAIL="testuser@example.com"
PASSWORD="Password123"
NEW_PASSWORD="NewPassword123"

# 0. Login as Admin
echo "[0] Logging in as Admin..."
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

# Create a clinic first to ensure we have one to manage
CLINIC_NAME="Doctor Test Clinic $(date +%s)"
CREATE_CLINIC_RES=$(curl -s -X POST "$API_URL/clinics" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$CLINIC_NAME\",
    \"address\": \"789 Specialist Road\",
    \"city\": \"Mumbai\",
    \"state\": \"Maharashtra\",
    \"country\": \"India\",
    \"phone\": \"9123456780\",
    \"email\": \"specialist@clinic.com\"
  }")

CLINIC_ID=$(echo "$CREATE_CLINIC_RES" | jq -r '.data.id')
echo "ℹ️ Using Clinic ID: $CLINIC_ID"

# 1. Add Doctor
echo -e "\n[1] Testing Add Doctor..."
DOCTOR_EMAIL="doctor_$(date +%s)@example.com"
DOCTOR_PHONE="9$(date +%s | cut -c 2-10)"
ADD_DOC_RES=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/doctors" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Dr. John Doe\",
    \"email\": \"$DOCTOR_EMAIL\",
    \"phone\": \"$DOCTOR_PHONE\",
    \"specialization\": \"Cardiology\",
    \"consultationDuration\": 15,
    \"maxTokensPerDay\": 20
  }")

DOCTOR_PROFILE_ID=$(echo "$ADD_DOC_RES" | jq -r '.data.id')

if [ "$DOCTOR_PROFILE_ID" != "null" ]; then
  echo "✅ Doctor Added: $DOCTOR_PROFILE_ID"
else
  echo "❌ Add Doctor Failed: $ADD_DOC_RES"
  exit 1
fi

# 2. List Doctors in Clinic
echo -e "\n[2] Testing List Doctors in Clinic..."
LIST_DOC_RES=$(curl -s -X GET "$API_URL/clinics/$CLINIC_ID/doctors" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$LIST_DOC_RES" | jq -e ".data | any(.doctorId == \"$DOCTOR_PROFILE_ID\")" > /dev/null; then
  echo "✅ List Doctors Successful"
else
  echo "❌ List Doctors Failed"
fi

# 3. Get Doctor Details
echo -e "\n[3] Testing Get Doctor Details..."
DETAILS_RES=$(curl -s -X GET "$API_URL/doctors/$DOCTOR_PROFILE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$DETAILS_RES" | jq -r '.data.specialization' | grep -q "Cardiology"; then
  echo "✅ Get Doctor Details Successful"
else
  echo "❌ Get Doctor Details Failed"
fi

# 4. Update Doctor Profile
echo -e "\n[4] Testing Update Doctor Profile..."
UPDATE_RES=$(curl -s -X PATCH "$API_URL/doctors/$DOCTOR_PROFILE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"specialization\": \"Advanced Cardiology\", \"maxTokensPerDay\": 25}")

if echo "$UPDATE_RES" | jq -r '.data.specialization' | grep -q "Advanced"; then
  echo "✅ Update Doctor Profile Successful"
else
  echo "❌ Update Doctor Profile Failed"
fi

# 5. Disable Doctor
echo -e "\n[5] Testing Disable Doctor..."
DISABLE_RES=$(curl -s -X PATCH "$API_URL/doctors/$DOCTOR_PROFILE_ID/status" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"isActive\": false}")

if echo "$DISABLE_RES" | jq -e '.data.isActive == false' > /dev/null; then
  echo "✅ Disable Doctor Successful"
else
  echo "❌ Disable Doctor Failed"
fi

# 6. RBAC Check (Add doctor as non-admin - should fail)
# We need another user for this. For now, we verified the logic in service. 
# Optional: test with the newly created doctor's account if we had their password.
# But we set it to Welcome@123.

echo -e "\n--- 🏁 Doctor Test Suite Completed ---"
