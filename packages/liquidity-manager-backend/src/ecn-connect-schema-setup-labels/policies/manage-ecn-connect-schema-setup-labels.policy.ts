import { EcnConnectSchemaSetupLabel } from "../entities/ecn-connect-schema-setup-label.entity";
import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export class ManageEcnConnectSchemaSetupLabelsPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, EcnConnectSchemaSetupLabel);
  }
}

