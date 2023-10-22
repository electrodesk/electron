import {
  ApplicationDispatchEvent,
  ApplicationReadDTO,
} from "@electrodesk/types/application";
import { filter, take } from "rxjs/operators";
import { singleton } from "tsyringe";
import {
  ApplicationState,
  type ApplicationModel,
} from "../../types/Application.properties";
import { EventController } from "../../../../core/controller/Event.controller";

@singleton()
export class ApplicationRepository {
  private readonly applications: Map<string, ApplicationModel> = new Map();

  constructor(private readonly eventController: EventController) {}

  add(application: ApplicationModel): void {
    application
      .stateChange()
      .pipe(
        filter((state) => state === ApplicationState.CLOSED),
        take(1)
      )
      .subscribe(() => this.applicationClosed(application));

    this.applications.set(application.uuid, application);
  }

  /**
   * find application by property
   */
  findBy<
    TField extends keyof ApplicationReadDTO,
    TNeedle extends ApplicationReadDTO[TField]
  >(field: TField, needle: TNeedle): ApplicationModel | undefined {
    for (const [, application] of this.applications) {
      if (needle === application[field]) {
        return application;
      }
    }
  }

  findById(id: string): ApplicationModel | undefined {
    for (const [, application] of this.applications) {
      if (id === application.uuid) {
        return application;
      }
    }
  }

  findByProcessId(processId: number): ApplicationModel | undefined {
    for (const application of this.applications.values()) {
      if (application.osProcessId === processId) {
        return application;
      }
    }
  }

  list(): IterableIterator<ApplicationModel> {
    return this.applications.values();
  }

  /**
   * application has been closed, remove from registry
   * and fire event application has been closed
   */
  private applicationClosed(application: ApplicationModel): void {
    this.applications.delete(application.uuid);
    const closeEvent: ApplicationDispatchEvent = {
      name: "application:dispatch",
      payload: {
        event: "application:closed",
        broadcast: true,
        data: {
          id: application.uuid,
          application: application.name,
        },
      },
    };
    this.eventController.dispatchEvent(closeEvent);
  }
}
