export default {
   get join(){
      return function(...parts){
        const sep='/';
        return parts.filter(p=>p && typeof p=='string').join(sep).replace(new RegExp(sep+'{1,}', 'g'), sep)
      }
   }
}