import { AsyncLocalStorage } from "async_hooks";
const storage = new AsyncLocalStorage();

export default storage;
