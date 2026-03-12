#!/bin/bash

API_URL="http://localhost:5000/api/v1"
EMAIL="testuser@example.com"
PASSWORD="Password123"

echo "--- 🏥 Centralized Clinic Token System - Stress & Conflict Test ---"

# 0. Login
echo "[0] Logging in..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")

if ! echo "$LOGIN_RES" | jq -e '.success' > /dev/null; then
  LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\", \"password\":\"NewPassword123\"}")
fi
ACCESS_TOKEN=$(echo "$LOGIN_RES" | jq -r '.data.tokens.accessToken')

# Setup Clinic
CLINIC_ID=$(curl -s -X POST "$API_URL/clinics" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Conflict Test Clinic\",
    \"address\": \"Conflict Ave\",
    \"city\": \"Conflict City\",
    \"state\": \"ST\",
    \"country\": \"IN\",
    \"phone\": \"9999999999\",
    \"email\": \"conflict@clinic.com\"
  }" | jq -r '.data.id')

# Setup 2 Doctors
create_doc() {
  local name=$1
  local email=$2
  curl -s -X POST "$API_URL/clinics/$CLINIC_ID/doctors" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"email\": \"$email\",
      \"phone\": \"9$(date +%s | cut -c 2-10)$RANDOM\",
      \"specialization\": \"General\",
      \"consultationDuration\": 10,
      \"maxTokensPerDay\": 50
    }" | jq -r '.data.id'
}

DOC1_ID=$(create_doc "Doctor Alpha" "alpha_$(date +%s)@doc.com")
DOC2_ID=$(create_doc "Doctor Beta" "beta_$(date +%s)@doc.com")

# Setup Patient
PATIENT_ID=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/patients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Patient Stress\",
    \"phone\": \"7$(date +%s | cut -c 2-10)\",
    \"gender\": \"FEMALE\"
  }" | jq -r '.data.id')

echo "ℹ️ Setup: Doc1=$DOC1_ID, Doc2=$DOC2_ID, Patient=$PATIENT_ID"

# 1. Isolation Test: Book tokens for both
echo -e "\n[1] Testing Isolation..."
T1_D1=$(curl -s -X POST "$API_URL/tokens" -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"clinicId\":\"$CLINIC_ID\",\"doctorId\":\"$DOC1_ID\",\"patientId\":\"$PATIENT_ID\",\"tokenType\":\"WALKIN\"}" | jq -r '.data.tokenNumber')
T1_D2=$(curl -s -X POST "$API_URL/tokens" -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"clinicId\":\"$CLINIC_ID\",\"doctorId\":\"$DOC2_ID\",\"patientId\":\"$PATIENT_ID\",\"tokenType\":\"WALKIN\"}" | jq -r '.data.tokenNumber')

if [ "$T1_D1" == "1" ] && [ "$T1_D2" == "1" ]; then
  echo "✅ Both doctors started their own sequence from 1."
else
  echo "❌ Isolation failed: Doc1=$T1_D1, Doc2=$T1_D2"
fi

# 2. Queue Progress Isolation
echo -e "\n[2] Testing Queue Progress Isolation..."
curl -s -X POST "$API_URL/tokens/next" -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"doctorId\":\"$DOC1_ID\"}" > /dev/null
D1_CURRENT=$(curl -s -X GET "$API_URL/doctors/$DOC1_ID/current-token" -H "Authorization: Bearer $ACCESS_TOKEN" | jq -r '.data.tokenNumber')
D2_CURRENT=$(curl -s -X GET "$API_URL/doctors/$DOC2_ID/current-token" -H "Authorization: Bearer $ACCESS_TOKEN" | jq -r '.data')

if [ "$D1_CURRENT" == "1" ] && [ "$D2_CURRENT" == "null" ]; then
  echo "✅ Calling Next for Doc1 did NOT affect Doc2's empty progress."
else
  echo "❌ Progress isolation failed: Doc1 Current=$D1_CURRENT, Doc2 Current=$D2_CURRENT"
fi

# 3. Concurrent Booking Simulation (Sequential in shell but checking logic)
echo -e "\n[3] Testing Sequence Integrity (Sequential Stress)..."
for i in {2..11}; do
  NUM=$(curl -s -X POST "$API_URL/tokens" -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"clinicId\":\"$CLINIC_ID\",\"doctorId\":\"$DOC2_ID\",\"patientId\":\"$PATIENT_ID\",\"tokenType\":\"WALKIN\"}" | jq -r '.data.tokenNumber')
  if [ "$NUM" != "$i" ]; then
    echo "❌ Sequence broken at token $i: Got $NUM"
    exit 1
  fi
done
echo "✅ Sequence maintained for Doctor Beta up to token 11."

# 4. Wait Time Logic Verification
echo -e "\n[4] Verifying Wait Time Logic..."
# Doc2: Current=null (None in progress), Next Booked=11.
# Formula: (Booked - Current) * Duration = (11 - 0) * 10 = 110?
# Wait, if current is null, currentNumber is 0. 
TOKEN12_RES=$(curl -s -X POST "$API_URL/tokens" -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" -d "{\"clinicId\":\"$CLINIC_ID\",\"doctorId\":\"$DOC2_ID\",\"patientId\":\"$PATIENT_ID\",\"tokenType\":\"WALKIN\"}")
WAIT12=$(echo "$TOKEN12_RES" | jq -r '.data.estimatedWaitMinutes')

if [ "$WAIT12" == "120" ]; then
  echo "✅ Wait time for token 12 with 0 served = 12 * 10 = 120 mins."
else
  echo "❌ Wait time mismatch: Got $WAIT12 (Expected 120)"
fi

echo -e "\n--- 🏁 Stress & Conflict Test Completed ---"
