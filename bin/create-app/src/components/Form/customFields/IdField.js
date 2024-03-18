import IdField from "$ecomponents/Form/Fields/IdField";

export default class IdFieldComponent extends IdField {
  constructor(props) {
    super(props);
  }
  isValidRuleDynamic() {
    return true;
  }
  
  /*****
    Le composant de type id, permet de générer un id pour chaque champ de ce type qui est en mode disabled en cas de modification de la donnée. 
    L'id générée peut être le résultat d'un appel d'api distante et doit être soit un nombre soit une chaine de caractère non null. 
    normalement les champs de type id sont unique dans une table data, la fonction suivante a pour but une fois, en cas d'ajout d'un novuel élémnent de la table data 
    et lorsque l'évènement onBlur est appelé sur le champ de type id, d'appeler une fonction distante afin de générer une valeur de l'id pour la valeur à enregistrer en bd; 
    @param {function} callback, la fonction de rappel à appeler une fois l'id récupérer. doit passer en paramètre de la dite fonction, l'id récupérée en bd. L'id récupérée en bd doit être unique et ne dois jamais été assigné à un autre élément de la table data
  */
  fetchNewIdRemotely(callback){
    return super.fetchNewIdRemotely(callback);
  }
  isTextField() {
    return true;
  }
}

IdFieldComponent.propTypes = {
  ...Object.assign({},IdField.propTypes)
};
