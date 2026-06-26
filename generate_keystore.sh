#!/bin/bash
# Generate the keystore file for production signing
# This script will create release-key.jks in the android/app folder

KEYSTORE_PATH="android/app/release-key.jks"
PASSWORD="zone2026"
ALIAS="zone-key"
DNAME="CN=Zone, OU=Agri, O=Kilimanjaro, L=Omdurman, S=Khartoum, C=SD"

if [ -f "$KEYSTORE_PATH" ]; then
    echo "Error: Keystore already exists at $KEYSTORE_PATH"
    exit 1
fi

echo "Generating production keystore..."
keytool -genkey -v -keystore "$KEYSTORE_PATH" \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -alias "$ALIAS" -storepass "$PASSWORD" -keypass "$PASSWORD" \
        -dname "$DNAME"

echo "------------------------------------------------"
echo "✅ SUCCESS: Keystore generated at $KEYSTORE_PATH"
echo "⚠️ IMPORTANT: Keep this file safe. DO NOT DELETE IT."
echo "------------------------------------------------"
