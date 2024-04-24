import { EcnConnectSchema } from "../entities/ecn-connect-schema.entity";
import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export class ManageEcnConnectSchemaPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, EcnConnectSchema);
  }
}

