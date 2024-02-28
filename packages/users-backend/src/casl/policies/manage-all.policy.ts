import { IPolicyHandler } from '../policies.guard';
import { AppAbility } from '../casl-ability.factory';
import { Action } from '../action.enum';

export class ManageAllPolicy implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, 'all');
  }
}
