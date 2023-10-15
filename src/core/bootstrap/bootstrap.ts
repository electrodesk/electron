import { Observable, concatMap, from, isObservable, lastValueFrom, map, take } from "rxjs"
import { container } from "tsyringe"
import { ConfigService } from "../services"
import { environmentVariablesInitializerFactory } from "./environment-variables-initializer.factory"

/**
 * injection token for electron initializer, will called 1 time one start
 */
export const ELECTRON_INITIALIZER = Symbol('Electron Initializer')

/**
 * register .env file loader in ELECTRON_INITIALIZER to load
 * .env file into config
 */
container.register(ELECTRON_INITIALIZER, {
  useFactory: () => environmentVariablesInitializerFactory(
    container.resolve(ConfigService) // maybe this should be core
  )
})

/**
 * @description electron bootstrap, reads out injection tokens for ELECTRON_INITIALIZER and runs them in order
 */
export async function bootstrap(): Promise<void> {
  if (!container.isRegistered(ELECTRON_INITIALIZER)) {
    return Promise.resolve()
  }

  const bootstrap$ = from(container.resolveAll<() => void | Promise<void> | Observable<void>>(ELECTRON_INITIALIZER))
    .pipe(
      concatMap((initializer) => {
        let retVal = initializer()
        if (!isObservable(retVal)) {
          retVal = from(Promise.resolve(retVal))
        }

        return retVal.pipe(take(1))
      }),
      map(() => void 0)
    )

  return lastValueFrom(bootstrap$, { defaultValue: void 0 })
}
