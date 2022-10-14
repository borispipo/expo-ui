/**** les  paramètres statiques de configuration de l'application*/
const appId = 'com.ftc.apps.xpose.ftc';
module.exports = {
    name : "XPOSE-FTC",//le nom de l'application,
    description : "Administrez vos client distant",
    version : "1.0.0",
    /*** l'environnement d déploiement de l'apps 
     *  production | development | test
    */
    env : "development",
    realeaseDateStr : "1er Juin 2021",
    releaseDate : "2020-05-23",
    devMail : "saliteapp@gmail.com",
    devWebsite : "http://fto-consulting.com/salite-config/",
    //copyRight : "Boris F, Dir Info FirsTo Consulting@Jan 2020",
    copyRight : "firsto consulting@Jan 2020",
    author : 'firsto consulting',
    id : appId,//l'unique id de l'application,
    appId,
    /****la version de l'api next côté serveur actuellement déployée */
    apiVersion : "1.0", 
}
