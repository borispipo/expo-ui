import * as SQLite from 'expo-sqlite/next';
import {isDev} from "$cplatform";
import {getName} from "$capp/config.utils";
import {sanitizeFileName,isNonNullString,isObj,defaultObj} from "$cutils";
import {sanitizeKey as cSanitizeKey,handleGetValue,handleSetValue} from "$csession/utils";
import * as FileSystem from 'expo-file-system';

export const SESSION_TABLE = "SESSION";

const debug = (...args)=>{
    if(!isDev()) return;
    return console.log(...args);
}

export class SQLiteSession {
    constructor () {
      this.hasInit = false
      this.db = null
      this.data = new Map();
    }
    getDBName(){
        let appName = getName();
        const suffix = "sqlite-sessname";
        if(isNonNullString(appName)){
            appName = sanitizeFileName(appName.replaceAll("\\","/").replaceAll("\\","")).replace(/\s+/g, "").trim();
            return `${appName}-${suffix}`;
        }
        return `${suffix}`;
    }
    
    sanitizeKey (key) {
      if(!isNonNullString(key)) return "";
      return sanitizeFileName(cSanitizeKey(key)).replace(/\s+/g, "").trim();
    }
    async init () {
      if (!this.db || !this.hasInit) {
        if(!this.openingPromise){
            const dbName = this.getDBName();
            debug(`Opening sqlite database ${dbName} for session storage`);
            this.openingPromise = new Promise((resolve,reject)=>{
                return SQLite.openDatabaseAsync(dbName).then((db)=>{
                  return db.execAsync(`CREATE TABLE IF NOT EXISTS ${SESSION_TABLE} (id INTEGER PRIMARY KEY NOT NULL, key TEXT, value TEXT);`).then((d)=>{
                      this.db = db;
                      this.hasInit = true;
                      return this.getAll().then((()=>{
                        resolve(db);
                      }));
                  })
                }).catch((e)=>{
                  debug(e," error when initializing sqlite session");
                  reject(e);
                }).finally(()=>{
                    delete this.openingPromise;
                });;
            });
        }
        return this.openingPromise;
      }
      return Promise.resolve(true);
    }
    get(key){
      key = this.sanitizeKey(key);
      if(!key) return undefined;
      return defaultObj(this.data.get(key)).value;
    }
    async getAsync (key,callback) {
      key = this.sanitizeKey(key);
      if(!key) return undefined;
      await this.init()
      const resp = await this.db.getFirstAsync(`SELECT value FROM ${SESSION_TABLE} WHERE key = ? `,key)
      if (!resp) {
        if(typeof callback =='function'){
          callback(undefined);
        }
        return undefined;
      }
      const r = handleGetValue(resp?.value);
      if(typeof callback =='function'){
        callback(r);
      }
      return r;
    }
  
    async set (key,value) {
      key = this.sanitizeKey(key);
      if (!key) return undefined;
      const toUpdate  = {...defaultObj(this.data.get(key)),value};
      this.data.set(key,toUpdate);
      const isUpdate = "id" in toUpdate &&  !!String(toUpdate.id) || false;
      value = handleSetValue(value,true);
      try {
        await this.init();
        const params = {$key: key,$value:value};
        if(isUpdate){
          params.$id = toUpdate.id;
        }
        const statement = await this.db.prepareAsync(isUpdate ? `UPDATE ${SESSION_TABLE} SET value = $value WHERE id = $id` : `INSERT INTO ${SESSION_TABLE}(key,value) VALUES ($key,$value)`);
        try {
          const result = await statement.executeAsync(params)
          if(!isUpdate && result.lastInsertRowId){
              toUpdate.id = result.lastInsertRowId;
              this.data.set(key,toUpdate);
          }
        } finally {
          await statement.finalizeAsync();
        }
      } catch(e){
        debug(e," error on inserting session data");
      } 
      return;
    }
    async remove (key) {
      key = this.sanitizeKey(key);
      if (!key) return false;
      this.data.delete(key);
      await this.init();
      debug(`removing session: ${key}`)
      return await this.db.runAsync(SQL`DELETE FROM sessions WHERE key = ?`,key);
    }
    async getAll () {
      if(!this.hasInit || !this.db) return {};
      const data = await this.db.getAllAsync(`SELECT * FROM ${SESSION_TABLE}`);
      debug("getting all sql session");
      this.data.clear();
      return data.map(({key,id,value})=>{
        value = handleGetValue(value);
        this.data.set(key,{id,value});
      });
    }
    async length () {
      await this.init()
      const data = await this.db.getFirstAsync(`SELECT count(*) as total FROM ${SESSION_TABLE}`)
      return data.total
    }
  
    async clearAll () {
      await this.init()
      debug(`Clearing all sessions`)
      this.data.clear();
      return await this.db.runAsync(`DELETE FROM ${SESSION_TABLE}`);
    }
  }
  
export function initSQLite (){
  return new Promise((resolve,reject)=>{
      const createD = ()=>{
          return FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite').then(resolve).catch(e=>{
              resolve(null);
          });
      };
      FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite').then((info)=>{
      if(!info?.exists){
        return createD();
      }
      resolve(info);   
      return info;
    }).catch(createD);
  })
}

const sqliteSession = new SQLiteSession();
sqliteSession.init();
initSQLite();

export default sqliteSession;