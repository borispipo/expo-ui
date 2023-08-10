module.exports = {
    getDependencyVersion : (obj,packageName)=>{
        if(!obj || typeof obj !=='object' || !obj?.dependencies) return "";
        return obj.dependencies[packageName] || "";
    },
    getDevDependencyVersion : (obj,packageName)=>{
        if(!obj || typeof obj !=='object' || !obj?.devDependencies) return "";
        return obj.devDependencies[packageName] || "";
    }
}