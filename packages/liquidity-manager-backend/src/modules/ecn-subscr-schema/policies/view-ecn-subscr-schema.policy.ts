import { IPolicyHandler } from "../../../casl/policies.guard";
import { AppAbility } from "../../../casl/casl-ability.factory";
import { Action } from "../../../casl/action.enum";
import { EcnSubscrSchema } from "../entities/ecn-subscr-schema.entity";

export class ViewEcnSubscrSchemaPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, EcnSubscrSchema);
  }
}

