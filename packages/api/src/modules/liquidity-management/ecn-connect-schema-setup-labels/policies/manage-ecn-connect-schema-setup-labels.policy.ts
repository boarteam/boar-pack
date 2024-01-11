import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { EcnConnectSchemaSetupLabel } from "../entities/ecn-connect-schema-setup-label.entity";

export class ManageEcnConnectSchemaSetupLabelsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, EcnConnectSchemaSetupLabel);
  }
}

