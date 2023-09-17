// load modules
import "reflect-metadata";

//#region import libraries
import "./libs/application";
import "./libs/system";
//#endregion

import { app, BrowserWindow } from "electron";
import { container } from "tsyringe";
import { ELECTRON_INITIALIZER } from "./core";
import { Main } from "./main";
import { ConfigService } from "./support";
import { environmentVariablesInitializerFactory } from "./support/src/environment-variables-initializer.factory";

//#region register initializeres
container.register(ELECTRON_INITIALIZER, {
  useFactory: () => environmentVariablesInitializerFactory(
    container.resolve(ConfigService)
  )
})
//#endregion register initializers

Main.main(app, BrowserWindow)
