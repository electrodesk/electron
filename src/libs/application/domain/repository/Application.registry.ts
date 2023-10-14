
import { ApplicationEntity } from '@electrodesk/types/application';
import { PathLike, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { from, lastValueFrom, map, take, tap, timeout } from 'rxjs';
import { singleton } from 'tsyringe';
import { ConfigService } from '../../../../core/services';
import { ApplicationNotInRegistryException } from '../../exceptions';
import { RegistryFileNotFoundException } from '../../exceptions/src/RegistryFileNotFound.Exception';

/**
 * @description
 * Service to resolve all available applications from registry, these position of
 * repository is defined inside the .env file
 * 
 * @example
 * *.env file*
 * 
 * ```bash
 * # load applications from can be file or url
 * APPLICATIONS_REPOSITORY=http://localhost:3000
 * # APPLICATIONS_REPOSITORY=~/work/mayapps/applications.json
 * ```
 * ---
 * @example
 * *get available apps*
 * 
 * ```ts
 * [@]command({
 *   command: 'appliaction:list'
 * })
 * class MyCommandController {
 *    constructor(private readonly applicationRegistry: ApplicationRegistry) {}
 * 
 *    // do not async await otherwise error is not catched
 *    execute() {
 *      this.applicationRegistry.list()
 *        .then((applications: ApplicationEntity[]) => super.complete(applications))
 *        .catch((error) => super.error(error))
 *    }
 * }
 * ```
 */
@singleton()
export class ApplicationRegistry {

  /**
   * @description registry to cache applications
   */
  private applications: ApplicationEntity[] | null = null;

  constructor(private readonly configService: ConfigService) { }

  async find(name: ApplicationEntity['name']): Promise<ApplicationEntity> {
    const list = await this.list()
    const application = list.find((appliaction) => appliaction.name === name)

    if (!application) {
      throw new ApplicationNotInRegistryException(name)
    }
    return application
  }

  /**
   * @description get all available applications
   */
  async list(): Promise<ApplicationEntity[]> {
    const repositoryPath = this.configService.getValue('APPLICATIONS_REPOSITORY')
    if (typeof repositoryPath !== 'string') {
      throw new Error('not found');
    }

    if (this.applications === null) {
      this.applications = await this.loadApplictionsFromRegistry(repositoryPath)
    }
    return this.applications;
  }

  /**
   * @description load files from registry
   */
  private loadApplictionsFromRegistry(path: string): Promise<ApplicationEntity[]> {
    return this.isFile(path) ? this.loadFromFile(path) : this.loadFromUrl(path)
  }

  /**
   * @description load from file
   */
  private isFile(path: string): boolean {
    if (this.isUrl(path)) {
      return false
    }

    // make absolute path if it is not
    if (!existsSync(path)) {
      throw new RegistryFileNotFoundException(`File for system registry was not found on given path: ${path}. Please check .env file for correct path and file exists.`)
    }

    return true
  }

  private isUrl(path: string): boolean {
    return !!/^(https?|file|ftp)/.exec(path)
  }

  /**
   * @description load existing applications from given url
   */
  private async loadFromUrl(path: string): Promise<ApplicationEntity[]> {
    const fetch$ = from(fetch(path)).pipe(
      timeout(30 * 1000),
      tap((response) => console.log(response)),
      map((response) => response.json()),
      take(1)
    )
    return lastValueFrom(fetch$);
  }

  /**
   * @description load existing applications from file
   */
  private async loadFromFile(path: PathLike): Promise<ApplicationEntity[]> {
    const data = await readFile(path, 'utf-8')
    const content: Record<'applications', ApplicationEntity[]> = JSON.parse(data)
    return content.applications
  }
}
