import FormData from "./FormData";
import Dialog from "./Dialog";
import Provider from "./DialogProvider";

FormData.Dialog = Dialog;

export {Provider as DialogProvider};

export {Dialog};

export {FormData};

export default FormData;

FormData.DialogProvider = Provider;

export * from "./utils";