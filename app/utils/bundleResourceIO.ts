// app/utils/bundleResourceIO.ts
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

export async function bundleResourceIO(modelJSON: any, weightsManifest: any) {
  const modelArtifacts = Object.assign({}, modelJSON);
  modelArtifacts.weightSpecs = modelJSON.weightsManifest[0].weights;

  const weightData = new ArrayBuffer(0);

  // Load weights
  if (Platform.OS === "ios" || Platform.OS === "android") {
    const weightPaths = weightsManifest.map(
      (manifest: any) => manifest.paths[0]
    );

    for (const path of weightPaths) {
      const uri = FileSystem.documentDirectory + path;
      const { exists } = await FileSystem.getInfoAsync(uri);

      if (!exists) {
        throw new Error(`Weight file ${path} does not exist`);
      }

      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const buffer = Buffer.from(fileContent, "base64");
      const tempBuffer = new ArrayBuffer(weightData.byteLength + buffer.length);
      new Uint8Array(tempBuffer).set(new Uint8Array(weightData), 0);
      new Uint8Array(tempBuffer).set(
        new Uint8Array(buffer),
        weightData.byteLength
      );
      weightData = tempBuffer;
    }
  }

  modelArtifacts.weightData = weightData;

  return modelArtifacts;
}
