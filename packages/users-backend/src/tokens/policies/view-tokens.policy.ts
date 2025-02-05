import { Token } from "../entities/token.entity";
import { Action, AppAbility, IPolicyHandler } from "../../casl";

export class ViewTokensPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Token);
  }
}
