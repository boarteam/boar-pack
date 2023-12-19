import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { EcnConnectSchema } from "../entities/ecn-connect-schema.entity";

export class ManageEcnConnectSchemaPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, EcnConnectSchema);
  }
}

