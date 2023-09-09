import Realm from "realm";

export default Realm;

export * from "realm";

export class Model extends Realm.Object{
    constructor(props){
        super(props);
    }
    static fields;
    static tableName;//Table name.
    static name;
}