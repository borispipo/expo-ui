import * as FileSystem from 'expo-file-system';
export default function initSQLite (){
    const createD = ()=>FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite').catch(e=>{});
    return FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite').then((info)=>{
      if(!info?.exists){
        createD();
      }
    }).catch(createD);
}