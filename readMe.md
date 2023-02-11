## Installation des dépendences, packages de dévéloppement

```javascript
npm i --D @babel/plugin-proposal-export-namespace-from @babel/preset-react babel-plugin-inline-dotenv babel-plugin-module-resolver babel-plugin-transform-inline-environment-variables @expo/metro-config @expo/webpack-config
```

## **#ELECTRON**

## Pré-requis : Installer le package electron en global :  `npm i -g electron`

### **Commandes electron : expo-ui electron cli**

### `expo-ui [build|start] [compile] [build] [url=local-url] [platform=[win32|darwin|linux|mas]] [arch=x64|x86] [out=outpout dir]`

1.  \[build|start|package\], le script à exécuter : build|start
2.  \[compile\], si l'application sera compilé, via la commande expo export:web; valide lorsque aucune url n'est spécifiée
3.  \[build\]\], si l'exécutable sera crée pour la plateforme \[platform\], valide uniquement pour le script \<\<build>>
4.  \[url=local-url\], l'url à ouvrir via l'application electron (exemple : http://localhost:19006/), valide uniquement pour le script \<\<start>>;
5.  \[platform\], la plateforme vers laquelle on souhaite exporter l'exécutable electron, vailde uniquement pour le script \<\<build>>
6.  \[arch\], l'architecture de l'exécutable à exporter, valide uniquement pour le script \<\<build>>
7.  \[out\], le repertoire destitation, valide pour les scripts \[build et package\]

## **Générer le fichier binaire**

1.  installer le package electron-packager : `npm install --save-dev electron-packager`
