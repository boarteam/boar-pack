import { EcnConnectSchema } from "../entities/ecn-connect-schema.entity";
import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
export class ViewEcnConnectSchemaPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, EcnConnectSchema);
  }
}

