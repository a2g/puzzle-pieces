import { Piece } from './Piece'
import { PieceBase } from './PieceBase'
import { RawObjectsAndVerb } from './RawObjectsAndVerb'
import { Solution } from './Solution'
import { Solutions } from './Solutions'
import { Solved } from './Solved'
import { Validated } from './Validated'

/**
 * #### So this is NOT a piece, its just the thing that pieces attach to.
 * BUT it inherits from PieceBase, so it can participate in this hierarchical
 * operation where a piece removes itself from the piece's parent. And since
 * this GoalStub is a pieces parent, it needs to derive form that class.
 *
 * Some parents have multiple children, so the PieceBAse has provision for this
 * but this GoalStub can only ever have a single one. So we have these getters
 * and setters for GetGoalWord, and GetThePiece - that make the code easier to
 * read because they reinforce that this only has one of those.
 *
 * This has solved and validated flags because this thing gets a tree added to it,
 * until it is solved, and additionally if all the pieces can be removed then
 * its validated. So zero pieces could be - initial state, or solved and validated.
 * And half a tree could be solved, and half validated Or have solved. So to make
 * it clear we have these flags.
 *
 * This is also where command steps that pertain to event are kept. Once we have
 * validated an order of goal solving, then the most single minded way to do it
 * would be to do the steps required of goal1, then the steps required of goal2.
 * The solution could be thousands of permutations that adhere to this,
 * but its handy to have a predictable deterministic solution - at least as a
 * starting point, before optimizations.
 */
export class GoalStub extends PieceBase {
  private readonly commandsCompletedInOrder: RawObjectsAndVerb[]
  private solved: Solved = Solved.Not
  private validated: Validated = Validated.Undecided
  private originalPieceCount: number = 0

  constructor (goalWord: string, commandsCompletedInOrder: RawObjectsAndVerb[], solved = Solved.Not) {
    super(goalWord)
    this.solved = solved
    this.inputHints.push(goalWord)
    this.inputs.push(null)

    this.commandsCompletedInOrder = []
    if (commandsCompletedInOrder != null) {
      for (const command of commandsCompletedInOrder) {
        this.commandsCompletedInOrder.push(command)
      }
    }
  }

  public GetThePiece (): Piece | null {
    return this.inputs[0]
  }

  public GetGoalWord (): string {
    return this.inputHints[0]
  }

  public CloneIncludingLeaves (): GoalStub {
    const newGoalStub = new GoalStub(this.inputHints[0], this.commandsCompletedInOrder)
    if (this.inputs[0] != null) {
      newGoalStub.inputs[0] = this.inputs[0].ClonePieceAndEntireTree()
      newGoalStub.inputs[0].parent = newGoalStub
    }
    return newGoalStub
  }

  public SetValidated (validated: Validated): void {
    this.validated = validated
  }

  public SetSolved (solved: Solved): void {
    this.solved = solved
  }

  public IsSolved (): boolean {
    return this.solved !== Solved.Not
  }

  public GetValidated (): Validated {
    return this.validated
  }

  public GetSolved (): Solved {
    return this.solved
  }

  public GetCommandsCompletedInOrder (): RawObjectsAndVerb[] {
    // I would like to return a read only array here.
    // I can't do that, so instead, I will clone.
    // The best way to clone in is using 'map'
    return this.commandsCompletedInOrder.map((x) => x)
  }

  public PushCommand (rawObjectsAndVerb: RawObjectsAndVerb): void {
    this.commandsCompletedInOrder.push(rawObjectsAndVerb)
  }

  public ProcessUntilCloning (solution: Solution, solutions: Solutions, path: string): boolean {
    // if the goalword piece is already found, we recurse
    if (this.inputs[0] != null) {
      return this.inputs[0].ProcessUntilCloning(solution, solutions, path + this.inputHints[0] + '/')
    }
    // else we find the goal word piece

    const setOfMatchingPieces = solution.GetPiecesThatOutputString(this.inputHints[0])

    if (setOfMatchingPieces.size > 0) {
      const matchingPieces = Array.from(setOfMatchingPieces)
      // In our array the currentSolution, is at index zero
      // so we start at the highest index in the list
      // we when we finish the loop, we are with
      for (let i = matchingPieces.length - 1; i >= 0; i--) {
        // need reverse iterator
        const theMatchingPiece = matchingPieces[i]

        // Clone - if needed!
        const isCloneBeingUsed = i > 0
        const theSolution = isCloneBeingUsed ? solution.Clone() : solution

        // remove all the pieces after cloning
        for (const theMatchingPiece of setOfMatchingPieces) {
          theSolution.RemovePiece(theMatchingPiece)
        }

        // this is only here to make the unit tests make sense
        // something like to fix a bug where cloning doesn't mark piece as complete
        // theSolution.MarkPieceAsCompleted(theSolution.GetWinGoal())
        // ^^ this might need to recursively ask for parent, since there are no
        // many root pieces
        if (isCloneBeingUsed) {
          solutions.GetSolutions().push(theSolution)
        }

        // rediscover the current GoalStub in theSolution - again because we might be cloned
        const theGoalStub = theSolution.GetGoalStubMap().GetGoalStubByNameNoThrow(this.inputHints[0])
        console.assert(theGoalStub != null)
        if (theGoalStub != null) {
          if (matchingPieces.length > 1) {
            // }[${i > 0 ? matchingPieces.length - i : 0}]
            const firstInput = theMatchingPiece.inputHints.length > 0 ? theMatchingPiece.inputHints[0] : 'no-hint'
            theSolution.PushSolvingPathSegment(`${firstInput}`)
          }

          theMatchingPiece.parent = theGoalStub
          theGoalStub.inputs[0] = theMatchingPiece

          // all pieces are incomplete when they are *just* added
          theSolution.AddToListOfEssentials(theMatchingPiece.getRestrictions())
        } else {
          console.warn('piece is null - so we are cloning wrong')
          throw new Error('piece is null - so we are cloning wrong')
        }
      }

      const hasACloneJustBeenCreated = matchingPieces.length > 1
      if (hasACloneJustBeenCreated) {
        return true
      } // yes is incomplete
    }
    return false
  }

  IsGoalCleared (): boolean {
    return this.inputs[0] == null
  }

  public GetCountRecursively (): number {
    let count = 0
    if (this.inputs[0] != null) {
      count += this.inputs[0].GetCountRecursively()
    }
    return count
  }

  public CalculateOriginalPieceCount (): void {
    this.originalPieceCount = this.GetCountRecursively()
  }

  public GetOriginalPieceCount (): number {
    return this.originalPieceCount
  }
}