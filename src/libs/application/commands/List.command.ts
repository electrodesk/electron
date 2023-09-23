import { ApplicationEntity } from "@electrodesk/types/application";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { PathLike } from "node:original-fs";
import { container } from "tsyringe";
import { command } from "../../../core/decorators";
import { AbstractTask } from "../../../core/queue";
import { ConfigService } from "../../../core/services";

/**
 * loads all available applications from application repository. The path should be defined
 * inside .env file as APPLICATIONS_REPOSITORY and is loaded from .env file
 */
@command({
  path: 'application:list'
})
export class ApplicationListCommand extends AbstractTask {
  private readonly configService = container.resolve(ConfigService);

  execute(): void {
    const repositoryPath = this.configService.getValue('APPLICATIONS_REPOSITORY')

    if (typeof repositoryPath !== 'string') {
      return
    }

    let fileStream: Promise<ApplicationEntity[]>
    if (this.isFile(repositoryPath)) {
      fileStream = this.loadFromFile(repositoryPath)
    } else {
      fileStream = this.loadFromUrl(repositoryPath)
    }

    fileStream.then((applications) => {
      super.complete(applications)
    })
  }

  // wenn es eine Datei ist
  private isFile(path: string): boolean {
    if (this.isUrl(path)) {
      return false
    }

    // make absolute path if it is not
    if (!existsSync(path)) {
      return false
    }

    return true
  }

  private isUrl(path: string): boolean {
    return path.match(/^(https?|file|ftp)/)?.length === 0
  }

  /**
   * @description load existing applications from file
   */
  private async loadFromUrl(path: string): Promise<ApplicationEntity[]> {
    const response = await fetch(path)
    return response.json() as Promise<ApplicationEntity[]>
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
