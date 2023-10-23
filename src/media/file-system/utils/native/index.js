import * as FileSystem from 'expo-file-system';
export * from "expo-file-system";

export const Directories = {
  get DOCUMENTS(){
    return FileSystem.documentDirectory;
  },
  get CACHE(){
    return FileSystem.cacheDirectory;
  }
}

export {FileSystem};