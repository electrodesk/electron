import { ApplicationReadDTO, GetPropertyCommand } from "@electrodesk/types/application";
import { container } from "tsyringe";
import { command } from "../../../../core/decorators";
import { AbstractTask } from "../../../../core/queue";
import { ApplicationRepository } from "../../domain/repository/Application.repository";
import { ApplicationInvalidPropertyKeyException, ApplicationNotFoundException, InvalidProcessIdException } from "../../exceptions";

/**
 * Command to resolve properties from running app
 */
@command({
  path: 'application:get-property',
  queue: 'application'
})
export class ApplicationGetPropertyCommand extends AbstractTask {

  private applicationRegistry = container.resolve(ApplicationRepository)

  private allowedProperties: (keyof ApplicationReadDTO)[] = [
    'data',
    'name',
    'osProcessId',
    'uuid'
  ]

  constructor(
    private readonly param: GetPropertyCommand,
    private osProcessId: number
  ) {
    super()
  }

  execute(): void {
    if (typeof this.osProcessId !== 'number') {
      throw new InvalidProcessIdException()
    }

    const property = this.param.property

    if (!this.isApplicationProperty(property)) {
      throw new ApplicationInvalidPropertyKeyException(property)
    }

    const application = this.applicationRegistry.findByProcessId(this.osProcessId)
    if (!application) {
      throw new ApplicationNotFoundException()
    }

    super.complete(application[property])
  }

  /**
   * type guard to ensure we handle an application property we can access
   */
  private isApplicationProperty(needle: string): needle is keyof ApplicationReadDTO {
    return this.allowedProperties.some((property) => needle === property)
  }
}
