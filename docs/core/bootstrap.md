# Bootstrap 

In einigen Faellen kann es erwuenscht sein Operationen auszufuehren bevor das Hauptfenster angezeigt wird. Fuer den Fall kann der Token ELECTRON_INITIALIZER genutzt werden um Operationen auszufuehren bevor das MainWindow angezeigt wird. 

## Einfaches Beispiel 

Erstellen eines Bootstrap Methode welcher im Eelectron Bootstrap Prozess genutzt wird. Dafuer muss lediglich fuer den Injection Token **ELECTRON_INTIALIZER** ueber useFactory die Methode bekannt gemacht werden.

Beim starten von Electron laeuft er alle registrierten Funktionen nacheinander durch und fuehrt selbige aus. 

```ts
import { container } from "tsyringe";
import { ELECTRON_INITIALIZER } from "../../../core/bootstrap";

/**
 * 
 */
export function boostrapConfiguration(): void {
  const configService: ConfigService = container.resolve(ConfigService);
  configService.setBaseUrl('http://localhost:;4200')
}

/**
 * register boostrap method for
 */
container.register(ELECTRON_INITIALIZER, {
  useFactory: () => bootstrapConfiguration
});
```

## Factory Funktion

In manchen Faellen kann es sinvoll sein Informationen fuer die Bootstrap Function bereit zu stellen, in dem Falle
kann eine Factory Funktion genutzt werden.

```ts
import { container } from "tsyringe";
import { ELECTRON_INITIALIZER } from "../../../core/bootstrap";

/**
 * Factory um eine Bootstrap Funktion zu erstellen
 */
export function boostrapConfigurationFactory(config: ConfigData): () => void {
  return () => {
    const configService: ConfigService = container.resolve(ConfigService)
    configService.loadConfig(config)
  }
}

/**
 * register boostrap method for
 */
container.register(ELECTRON_INITIALIZER, {
  useFactory: () => bootstrapConfigurationFactory()
});
```

## Mehere Bootstrap Funktionen

Erstellen eines Bootstrap Methode welcher im Eelectron Bootstrap Prozess genutzt wird. Dafuer muss lediglich fuer den Injection Token **ELECTRON_INTIALIZER** ueber useFactory die Methode bekannt gemacht werden.

Beim starten von Electron laeuft er alle registrierten Funktionen nacheinander durch und fuehrt selbige aus. 

```ts
import { container } from "tsyringe";
import { ELECTRON_INITIALIZER } from "../../../core/bootstrap";

function boostrapFunctionOne(): void {
  console.log('boostrap 1')
}

function bootstrapFunctionTwo(): void {
  console.log('boostrap 2')
}

/**
 * register boostrap method for, so both methods will called sync
 * 
 * // yields
 * bootstrap 1
 * bootstrap 2
 */
container.register(ELECTRON_INITIALIZER, { useFactory: () => bootstrapFunctionOne });
container.register(ELECTRON_INITIALIZER, { useFactory: () => bootstrapFunctionTwo })

/**
 * order matters for example, if we switch registering bootstrap functions 
 * 
 * // yields
 * bootstrap 2
 * bootstrap 1
 */
container.register(ELECTRON_INITIALIZER, { useFactory: () => bootstrapFunctionTwo })
container.register(ELECTRON_INITIALIZER, { useFactory: () => bootstrapFunctionOne });
```

## Async Operationen

Wenn asynchrone Operationen ausgefuehrt werden sollen ist es wichtig das entweder eine Promise oder ein Observable zurueck gegeben wird.

```ts
import { container } from "tsyringe";
import { ELECTRON_INITIALIZER } from "../../../core/bootstrap";

function boostrapFunctionOne(): void {
  console.log('boostrap 1')
}

function bootstrapFunctionTwo(): void {
  console.log('boostrap 2')
}

async function asyncBootstrapFunction(): Promise<void> {
  // wait for 3 seconds then emit
  const response$ = timer(3000).pipe(
    take(1),
    finally(() => {
      console.log('async boostrap completed')
    })
  )
  return response$

  // alternate return a Promise
  // return lastValueFrom(response$)
}

/**
 * register for boostrap
 * 
 * // yields
 * bootstrap 1
 * async bootstrap completed
 * bootstrap 2
 */
container.register(ELECTRON_INITIALIZER, { useFactory: () => bootstrapFunctionOne })
container.register(ELECTRON_INITIALIZER, { useFactory: () => asyncBootstrapFunction })
container.register(ELECTRON_INITIALIZER, { useFactory: () => boostrapFunctionTwo })
```
