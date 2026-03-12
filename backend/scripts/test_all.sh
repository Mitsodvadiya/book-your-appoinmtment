#!/bin/bash

# Master Test Script for Centralized Clinic Token System

echo "=========================================================="
echo "🚀 STARTING SYSTEM-WIDE API VERIFICATION"
echo "=========================================================="

# Ensure scripts are executable
chmod +x scripts/test_auth.sh
chmod +x scripts/test_clinics.sh
chmod +x scripts/test_doctors.sh

# 1. Run Auth & User Module Tests
echo -e "\n📦 MODULE 1: AUTHENTICATION & USERS"
./scripts/test_auth.sh
AUTH_STATUS=$?

if [ $AUTH_STATUS -ne 0 ]; then
    echo "❌ Auth Module Tests Failed!"
    exit 1
fi

# 2. Run Clinic Management Module Tests
echo -e "\n📦 MODULE 2: CLINIC MANAGEMENT"
./scripts/test_clinics.sh
CLINIC_STATUS=$?

if [ $CLINIC_STATUS -ne 0 ]; then
    echo "❌ Clinic Module Tests Failed!"
    exit 1
fi

# 3. Run Doctor Management Module Tests
echo -e "\n📦 MODULE 3: DOCTOR MANAGEMENT"
./scripts/test_doctors.sh
DOCTOR_STATUS=$?

if [ $DOCTOR_STATUS -ne 0 ]; then
    echo "❌ Doctor Module Tests Failed!"
    exit 1
fi

# 4. Run Token Queue Module Tests
echo -e "\n📦 MODULE 4: TOKEN QUEUE"
chmod +x scripts/test_tokens.sh
./scripts/test_tokens.sh
TOKEN_STATUS=$?

if [ $TOKEN_STATUS -ne 0 ]; then
    echo "❌ Token Queue Module Tests Failed!"
    exit 1
fi

echo -e "\n=========================================================="
echo "✅ ALL MODULES VERIFIED SUCCESSFULLY"
echo "=========================================================="
