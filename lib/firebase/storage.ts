import { getStorage } from "firebase/storage";
import { app } from "./client";

export const storage = app ? getStorage(app) : null;
