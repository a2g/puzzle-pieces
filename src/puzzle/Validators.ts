import { Validator } from './Validator'
import { Solutions } from './Solutions'

/**
 * Does only a few things:
 * 1. A simple collection of Solutions
 * 2. Methods that call the same thing on all solutions
 * 3. Generating solution names - which is why it needs mapOfStartingThings...
 */
export class Validators {
  private readonly validators: Validator[]

  constructor (solutions: Solutions) {
    this.validators = []
    for (const solution of solutions.GetSolutions()) {
      const validator = new Validator(
        solution.GetSolvingPath(),
        solutions.GetStarter(),
        solution.GetRootMap(),
        solutions.GetStarter().GetMapOfAllStartingThings())
      this.validators.push(validator)
    }
  }

  public GetValidators (): Validator[] {
    return this.validators
  }

  public MatchLeavesAndRemoveFromGoalMap (): void {
    for (const validator of this.validators) {
      if (validator.IsUnsolved()) {
        validator.MatchLeavesAndRemoveFromGoalMap()
      }
    }
  }

  public UpdateGoalSolvedStatusesAndMergeIfNeeded (): void {
    for (const validator of this.validators) {
      if (validator.IsUnsolved()) {
        validator.UpdateGoalSolvedStatusesAndMergeIfNeeded()
      }
    }
  }
}
