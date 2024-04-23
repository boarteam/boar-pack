import { Action, AppAbility, IPolicyHandler } from "@jifeon/boar-pack-users-backend";
import { EcnSubscrSchema } from "../entities/ecn-subscr-schema.entity";

export class ViewEcnSubscrSchemaPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, EcnSubscrSchema);
  }
}

