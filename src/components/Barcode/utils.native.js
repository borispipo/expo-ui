export function generate(){
    return Promise.reject({
        message : `La fonction de génération des codes barre n'est pas supportée sur cette plateforme`
    })
}