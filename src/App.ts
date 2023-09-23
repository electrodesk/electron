// load modules
import "reflect-metadata";

//#region import libraries
import "./libs/application";
import "./libs/system";
//#endregion

import { app, BrowserWindow } from "electron";
import { Main } from "./main";

Main.main(app, BrowserWindow)
