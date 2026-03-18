import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

type ISBNScannerProps = {
  onScanned: (isbn: string) => void;
  onCancel: () => void;
};

export default function ISBNScanner({ onScanned, onCancel }: ISBNScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
        <View style={styles.spacer} />
        <Button title="Cancel" onPress={onCancel} />
      </View>
    );
  }

  const handleScan = (data: string) => {
    if (scanned) return;

    setScanned(true);
    const cleanISBN = data.replace(/[^0-9Xx]/g, "");
    console.log("SCANNED ISBN:", cleanISBN);
    setTimeout(() => {
      onScanned(cleanISBN);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => handleScan(data)
        }
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Scan book barcode</Text>

        {scanned && (
          <Button
            title="Scan Again"
            onPress={() => setScanned(false)}
          />
        )}

        <View style={styles.spacer} />
        <Button title="Cancel" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  message: {
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
    gap: 12,
  },
  overlayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  spacer: {
    height: 12,
  },
});
