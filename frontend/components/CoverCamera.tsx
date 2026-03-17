import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onCapture: (uri: string) => void;
  onCancel: () => void;
};

export default function CoverCamera({ onCapture, onCancel }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>
            Grant camera permission
          </Text>
        </Pressable>

        <Pressable style={styles.permissionCancelButton} onPress={onCancel}>
          <Text style={styles.permissionCancelText}>Cancel</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || !isCameraReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
    } catch (error) {
      console.log("Failed to take photo:", error);
    }
  };

  const usePhoto = () => {
    if (photoUri) {
      onCapture(photoUri);
    }
  };

  const retakePhoto = () => {
    setPhotoUri(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.preview} />

          <Pressable style={styles.backButton} onPress={onCancel}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>

          <View style={styles.previewActions}>
            <Pressable style={styles.secondaryButton} onPress={retakePhoto}>
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </Pressable>

            <Pressable style={styles.primaryButton} onPress={usePhoto}>
              <Text style={styles.primaryButtonText}>Use photo</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            onCameraReady={() => setIsCameraReady(true)}
          />

          <Pressable style={styles.backButton} onPress={onCancel}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>

          <View style={styles.overlay}>
            <Pressable
              style={[
                styles.captureButton,
                !isCameraReady && styles.captureButtonDisabled,
              ]}
              onPress={takePhoto}
              disabled={!isCameraReady}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  captureButton: {
    width: 75,
    height: 75,
    borderRadius: 75,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "#ddd",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 999,
    zIndex: 10,
  },
  previewActions: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    minWidth: 120,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    minWidth: 120,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  permissionButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  permissionCancelText: {
    color: "#333",
    fontSize: 16,
  },
});
