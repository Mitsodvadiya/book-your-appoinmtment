#!/bin/bash
set -e

# Configuration
BASE_URL="http://localhost:5000/api/v1"
RANDOM_SUFFIX=$((1000 + RANDOM % 9000))
EMAIL="testgap_$RANDOM_SUFFIX@example.com"
PASSWORD="Password123"

echo "Setup: Registering unique user $EMAIL..."
REGISTER_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Gap Admin\", \"email\":\"$EMAIL\", \"phone\":\"1$(date +%s | cut -c 2-10)\", \"password\":\"$PASSWORD\"}")

echo "Logging in..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RES | jq -r '.data.tokens.accessToken')
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  TOKEN=$(echo $LOGIN_RES | jq -r '.data.accessToken')
fi

if [ "$TOKEN" == "null" ]; then
  echo "Login failed: $LOGIN_RES"
  exit 1
fi

echo "Login successful."

# 1. Setup Data
echo "Creating Clinic..."
RANDOM_PHONE="9$(date +%s | cut -c 2-10)"
CLINIC_RES=$(curl -s -X POST "$BASE_URL/clinics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Audit Clinic $RANDOM_SUFFIX\", \"address\":\"Street 1\", \"city\":\"Metropolis\", \"state\":\"MS\", \"country\":\"IN\", \"phone\":\"$RANDOM_PHONE\", \"email\":\"clinic_$RANDOM_SUFFIX@example.com\"}")
CLINIC_ID=$(echo $CLINIC_RES | jq -r '.data.id')
echo "Clinic ID: $CLINIC_ID"

echo "Adding Doctor..."
DOCTOR_RES=$(curl -s -X POST "$BASE_URL/clinics/$CLINIC_ID/doctors" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Dr Gaps\", \"email\":\"dr_$RANDOM_SUFFIX@example.com\", \"phone\":\"8$(date +%s | cut -c 2-10)\", \"specialization\":\"General\", \"consultationDuration\":10, \"maxTokensPerDay\":20}")
DOCTOR_ID=$(echo $DOCTOR_RES | jq -r '.data.id')
echo "Doctor ID: $DOCTOR_ID"

echo "Creating Patient..."
PATIENT_RES=$(curl -s -X POST "$BASE_URL/clinics/$CLINIC_ID/patients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Audit\", \"phone\":\"7$(date +%s | cut -c 2-10)\", \"gender\":\"MALE\"}")
PATIENT_ID=$(echo $PATIENT_RES | jq -r '.data.id')
echo "Patient ID: $PATIENT_ID"

# 2. Test Schedules
echo "Creating doctor schedule..."
SCHEDULE_RES=$(curl -s -X POST "$BASE_URL/doctors/$DOCTOR_ID/schedules" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"clinicId\":\"$CLINIC_ID\", \"dayOfWeek\":$(date +%u), \"startTime\":\"08:00\", \"endTime\":\"22:00\", \"isActive\":true}")
echo $SCHEDULE_RES | jq .
SCHEDULE_ID=$(echo $SCHEDULE_RES | jq -r '.data.id')

echo "Checking availability..."
AVAIL_RES=$(curl -s -X GET "$BASE_URL/doctors/$DOCTOR_ID/availability" -H "Authorization: Bearer $TOKEN")
echo $AVAIL_RES | jq .

# 3. Test Patients Gaps
echo "Searching for patient 'John'..."
SEARCH_RES=$(curl -s -X GET "$BASE_URL/clinics/$CLINIC_ID/patients/search?q=John" -H "Authorization: Bearer $TOKEN")
echo "Search results count: $(echo $SEARCH_RES | jq '.data | length')"

echo "Updating patient status to inactive..."
STATUS_RES=$(curl -s -X PATCH "$BASE_URL/patients/$PATIENT_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"isActive\":false}")
echo "Status Update: $(echo $STATUS_RES | jq -r '.message')"

# 4. Test Token Gaps
echo "Generating token for patient..."
TOKEN_GEN_RES=$(curl -s -X POST "$BASE_URL/tokens" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"clinicId\":\"$CLINIC_ID\", \"doctorId\":\"$DOCTOR_ID\", \"patientId\":\"$PATIENT_ID\", \"tokenType\":\"WALKIN\"}")
NEW_TOKEN_ID=$(echo $TOKEN_GEN_RES | jq -r '.data.id')

echo "Fetching patient token history..."
PA_TOKENS=$(curl -s -X GET "$BASE_URL/patients/$PATIENT_ID/tokens" -H "Authorization: Bearer $TOKEN")
echo "Token history count: $(echo $PA_TOKENS | jq '.data | length')"

echo "Fetching display data..."
DISPLAY_RES=$(curl -s -X GET "$BASE_URL/display/$CLINIC_ID/$DOCTOR_ID")
echo $DISPLAY_RES | jq .

echo "Verification complete!"
