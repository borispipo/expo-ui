import { isNonNullString } from '$cutils';
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

export const deleteFile = (filePath,...options)=>{
  if(!isNonNullString(filePath)){
    return Promise.reject({message:`Impossible de supprimer le fichier de chemin invalide!! veuillez spécifier une chaine de caractère comme chemin de fichier à supprimer`,filePath})
  }
  return FileSystem.deleteAsync(filePath,...options);
}

export {deleteFile as delete};