import { Observable, catchError, concatMap, from, isObservable, lastValueFrom, map, of, take, timeout } from "rxjs"
import { container } from "tsyringe"
import { ELECTRON_INITIALIZER } from "../../core/index"

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

        return retVal.pipe(
          timeout(30 * 1000),
          catchError(() => of(`timed out`)),
          take(1),
        )
      }),
      map(() => void 0)
    )

  return lastValueFrom(bootstrap$, { defaultValue: void 0 })
}
