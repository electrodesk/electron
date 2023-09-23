import { filter, take } from 'rxjs/operators';
import { singleton } from 'tsyringe';
import { ApplicationState, type ApplicationEntity } from '../../types/Application.properties';

@singleton()
export class ApplicationRepository {

  private readonly applications: Map<string, ApplicationEntity> = new Map();

  add(application: ApplicationEntity): void {
    application.stateChange().pipe(
      filter((state) => state === ApplicationState.CLOSED),
      take(1)
    ).subscribe(() => this.applications.delete(application.uuid))

    this.applications.set(application.uuid, application)
  }

  findById(id: string): ApplicationEntity | undefined {
    for (const [, application] of this.applications) {
      if (id === application.uuid) {
        return application
      }
    }
  }

  findByProcessId(processId: number): ApplicationEntity | undefined {
    for (const application of this.applications.values()) {
      if (application.osProcessId === processId) {
        return application
      }
    }
  }

  list(): IterableIterator<ApplicationEntity> {
    return this.applications.values();
  }
}
