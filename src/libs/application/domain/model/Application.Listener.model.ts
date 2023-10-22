import { ApplicationReadDTO } from "@electrodesk/types/application";

export class ApplicationListenerModel {
  /**
   * @description alle die sich fuer events der Applikation interessieren 
   * koennen gegebenenfalls mehere sein wenn die App von meheren Apps geoeffnet
   * wird aber wir oeffnen kein neues Fenster sondern nutzen das was bereits
   * existiert.
   */
  private listeners: Set<ApplicationReadDTO['uuid']> = new Set()

  /** 
   * @description register new listener to application events
   */
  register(listenerId: ApplicationReadDTO['uuid']): void {
    if (!this.listeners.has(listenerId)) {
      this.listeners.add(listenerId)
    }
  }

  /**
   * @description remove listener from list
   */
  unregister(listenerId: ApplicationReadDTO['uuid']): void {
    this.listeners.delete(listenerId);
  }

  /**
   * @description get all available listeners from list
   */
  list(): Iterable<ApplicationReadDTO['uuid']> {
    return this.listeners.values();
  }
}
