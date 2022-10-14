import Dialog from "./Dialog";
import notify from "$notify";
import Provider from "./Provider";

export {notify};

export * from "./utils";

export * from "./Dialog";

export {default as Provider} from "./Provider";

Dialog.Provider = Provider;

export * from "./confirm";

export default Dialog;