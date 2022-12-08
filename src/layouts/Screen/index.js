import Screen from "./Screen";
import ScreenWithoutAuthContainer from "./ScreenWithoutAuthContainer";
import FormData from "./FormData";
import List from "./FormData/List";


Screen.FormData = FormData;
Screen.List = List;

export default Screen;
export {default as TableData} from "./TableData";
export {FormData,List,ScreenWithoutAuthContainer};