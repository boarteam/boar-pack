import { Token } from "../entities/token.entity";
import { Action, AppAbility, IPolicyHandler } from "../../casl";

export class ManageTokensPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, Token);
  }
}
