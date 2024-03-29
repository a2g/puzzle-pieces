import { Command } from './Command'
import { Happen } from './Happen'
import { Happenings } from './Happenings'
import { IBoxReadOnlyWithFileMethods } from './IBoxReadOnlyWithFileMethods'
import { Solution } from './Solution'
import { SolverViaRootPiece } from './SolverViaRootPiece'
import { SpecialTypes } from './SpecialTypes'
import { VisibleThingsMap } from './VisibleThingsMap'

export class Piece {
  public id: number

  public boxToMerge: IBoxReadOnlyWithFileMethods | null

  public type: string

  public output: string

  public spielOutput: string

  public inputs: Array<Piece | null>

  public inputHints: string[]

  public parent: Piece | null // this is not needed for leaf finding - but *is* needed for command finding.

  public reuseCount: number // pieces are allowed to used many times in a puzzle solving network - this enables that

  public characterRestrictions: string[]

  public happenings: Happenings | null

  public command: Command | null

  public inputSpiels: string[]

  private talkPath: any // only valid for TALK

  constructor (
    id: number,
    boxToMerge: IBoxReadOnlyWithFileMethods | null,
    output: string,
    type = 'undefined',
    reuseCount = 1, // put it here so all the tests don't need to specify it.
    command: Command | null = null,
    happenings: Happenings | null = null,
    restrictions: Array<{ character: string }> | null | undefined = null, // put it here so all the tests don't need to specify it.
    inputA = 'undefined',
    inputB = 'undefined',
    inputC = 'undefined',
    inputD = 'undefined',
    inputE = 'undefined',
    inputF = 'undefined' // no statics in typescript, so this seemed preferable than global let Null = 'Null'
  ) {
    this.id = id
    this.boxToMerge = boxToMerge
    this.parent = null
    this.reuseCount = reuseCount
    this.output = output
    this.spielOutput = `${output}`
    this.type = type
    this.command = command
    this.happenings = happenings
    this.characterRestrictions = []
    this.talkPath = ''
    if (typeof restrictions !== 'undefined' && restrictions !== null) {
      for (const restriction of restrictions) {
        this.characterRestrictions.push(restriction.character)
      }
    }
    this.inputs = []
    this.inputHints = []
    this.inputSpiels = []
    if (inputA !== 'undefined' && inputA !== undefined && inputA.length > 0) {
      this.inputSpiels.push(inputA)
      this.inputHints.push(inputA)
      this.inputs.push(null)
    }
    if (inputB !== 'undefined' && inputB !== undefined && inputB.length > 0) {
      this.inputSpiels.push(inputB)
      this.inputHints.push(inputB)
      this.inputs.push(null)
    }
    if (inputC !== 'undefined' && inputC !== undefined && inputC.length > 0) {
      this.inputSpiels.push(inputC)
      this.inputHints.push(inputC)
      this.inputs.push(null)
    }
    if (inputD !== 'undefined' && inputD !== undefined && inputD.length > 0) {
      this.inputSpiels.push(inputD)
      this.inputHints.push(inputD)
      this.inputs.push(null)
    }
    if (inputE !== 'undefined' && inputE !== undefined && inputE.length > 0) {
      this.inputSpiels.push(inputE)
      this.inputHints.push(inputE)
      this.inputs.push(null)
    }
    if (inputF !== 'undefined' && inputF !== undefined && inputF.length > 0) {
      this.inputSpiels.push(inputF)
      this.inputHints.push(inputF)
      this.inputs.push(null)
    }
  }

  public SetCount (count: number): void {
    this.reuseCount = count
  }

  public ClonePieceAndEntireTree (): Piece {
    const clone = new Piece(0, null, this.output, '')
    clone.id = this.id
    clone.type = this.type
    clone.reuseCount = this.reuseCount
    clone.output = this.output
    clone.boxToMerge = this.boxToMerge
    clone.talkPath = this.talkPath

    // the hints
    for (const inputHint of this.inputHints) {
      clone.inputHints.push(inputHint)
    }

    // the display hints
    for (const inputHint of this.inputSpiels) {
      clone.inputSpiels.push(inputHint)
    }

    // the pieces
    for (const input of this.inputs) {
      if (input != null) {
        const child = input.ClonePieceAndEntireTree()
        child.SetParent(clone)
        clone.inputs.push(child)
      } else {
        clone.inputs.push(null)
      }
    }

    for (const restriction of this.characterRestrictions) {
      clone.characterRestrictions.push(restriction)
    }

    return clone
  }

  AddChildAndSetParent (child: Piece): void {
    this.inputs.push(child)
    this.inputHints.push(child.output)
    this.inputSpiels.push(child.output)
    child.SetParent(this)
  }

  public FindAnyPieceMatchingIdRecursively (id: number): Piece | null {
    if (this.id === id) {
      return this
    }
    for (const input of this.inputs) {
      const result =
        input != null ? input.FindAnyPieceMatchingIdRecursively(id) : null
      if (result != null) {
        return result
      }
    }
    return null
  }

  public ReturnTheFirstNullInputHint (): string {
    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i]
      if (input === null) {
        return this.inputHints[i]
      }
      const result = input.ReturnTheFirstNullInputHint()
      if (result.length > 0) {
        return result
      }
    }
    return ''
  }

  public StubOutInputK (k: number, type: SpecialTypes): void {
    const objectToObtain = this.inputHints[k]
    //  update the display string - for easier browsing!
    this.inputSpiels[k] = `${objectToObtain} (${type})`
    const newLeaf = new Piece(0, null, objectToObtain, type)
    newLeaf.parent = this
    this.inputs[k] = newLeaf
  }

  public ProcessUntilCloning (
    solution: Solution,
    solutions: SolverViaRootPiece,
    path: string
  ): boolean {
    const newPath = `${path}${this.output}/`

    // this is the point we used to set it as completed
    // solution.MarkPieceAsCompleted(this)

    if (this.InternalLoopOfProcessUntilCloning(solution, solutions)) {
      return true
    }

    // now to process each of those pieces that have been filled out
    for (const inputPiece of this.inputs) {
      if (inputPiece != null) {
        if (inputPiece.type === SpecialTypes.VerifiedLeaf) {
          continue
        } // this means its already been searched for in the map, without success.
        const hasACloneJustBeenCreated = inputPiece.ProcessUntilCloning(
          solution,
          solutions,
          newPath
        )
        if (hasACloneJustBeenCreated) {
          return true
        }
      } else {
        // this case used to indicate something wrong with InternalLoopOfProcessUntilCloning
        // because in the old days a solution just had one tree in it that was traversed in order
        // With the multi-tree setup, the order can jump from one tree to another
        // to another, so the order isn't clear. So instead we iterate multiple times
        // to solve it.
        //
        // In the old days it said process until cloning. But it really meant
        // process until cloning or finished - and we used some metric to determine
        // whether the traversing was complete - if it wasn't, then we knew it was
        // cloned.
        //
        // With this way, I think we need to choose something else....
        // assert(inputPiece && 'Input piece=' + inputPiece + ' <-If this fails there is something wrong with InternalLoopOfProcessUntilCloning')
        // console.warn('Input piece= null <-If this fails there is something wrong with InternalLoopOfProcessUntilCloning')
      }
    }

    return false
  }

  public SetParent (parent: Piece | null): void {
    this.parent = parent
  }

  public GetParent (): Piece | null {
    return this.parent
  }

  public getRestrictions (): string[] {
    return this.characterRestrictions
  }

  public GetOutput (): string {
    return this.output
  }

  public UpdateVisibleWithOutcomes (visiblePieces: VisibleThingsMap): void {
    if (this.happenings != null) {
      for (const happening of this.happenings.array) {
        switch (happening.type) {
          case Happen.GoalIsSet:
          case Happen.InvAppears:
          case Happen.PropAppears:
            visiblePieces.Set(happening.itemA, new Set<string>())
            break
          case Happen.InvGoes:
          case Happen.PropGoes:
          default:
            visiblePieces.Delete(happening.itemA)
            break
        }
      }
    }
  }

  private InternalLoopOfProcessUntilCloning (
    solution: Solution,
    solutions: SolverViaRootPiece
  ): boolean {
    for (let k = 0; k < this.inputs.length; k += 1) {
      // Without this following line, any clones will attempt to re-clone themselves
      // and Solution.ProcessUntilCompletion will continue forever
      if (this.inputs[k] != null) {
        continue
      }

      // we check our starting set first!
      // 1. Starting set - we check our starting set first!
      // otherwise Toggle pieces will toggle until the count is zero.
      const importHintToFind = this.inputHints[k]
      if (solution.GetStartingThings().Has(importHintToFind)) {
        this.StubOutInputK(k, SpecialTypes.ExistsFromBeginning)
        continue
      }

      // 2. Goal - matches a single goal in the goal root map
      // then we just set and forget, allowing that goal
      // be completed via the natural process
      if (solution.GetRootMap().Has(importHintToFind)) {
        const matchingRootPieces = solution
          .GetRootMap()
          .GetRootPieceArrayByName(importHintToFind)
        if (matchingRootPieces.length === 1) {
          // is it a goal? (since goal map always contains all goals)
          // solution.MarkGoalsAsContainingNullsAndMergeIfNeeded()// this is optional...
          const isSolved = matchingRootPieces[0].IsSolved()

          if (isSolved) {
            this.StubOutInputK(k, SpecialTypes.CompletedElsewhere)
          }
          continue
        }

        // 3. Matches multiple goals in goalrootmap
        if (matchingRootPieces.length > 0) {
          for (let i = matchingRootPieces.length - 1; i >= 0; i -= 1) {
            const thisMatchingRootPiece = matchingRootPieces[i]

            // Clone - if needed!
            const newClonedSolution = solution.Clone()

            // go through all other matching root piece,s  and delete their matching root
            // piece from this solutions root piece
            for (const matchingRootPiece of newClonedSolution
              .GetRootMap()
              .GetRootPieceArrayByName(importHintToFind)) {
              if (matchingRootPiece !== thisMatchingRootPiece) {
                newClonedSolution
                  .GetRootMap()
                  .RemovePieceById(matchingRootPiece.piece.id)
              }
            }
            solutions.GetSolutions().push(newClonedSolution)
          }
          // since we've added multiple
          solutions.RemoveSolution(solution)

          // we could stub out here, but even if we don't it will occur next iteration
          return true // since cloning occured
        }
      }

      // 4. PLain old pieces
      // This is where we get all the pieces that fit
      // and if there is more than one, then we clone
      const setOfMatchingPieces = solution
        .GetPile()
        .GetPiecesThatOutputString(importHintToFind)
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

          // This is the earliest possible point we can remove the
          // matching piece: i.e. after the cloning has occurred
          theSolution.GetPile().RemovePiece(theMatchingPiece)

          // this is only here to make the unit tests make sense
          // something like to fix a bug where cloning doesn't mark piece as complete
          // theSolution.MarkPieceAsCompleted(theSolution.GetWinGoal())
          // ^^ this might need to recursively ask for parent, since there are no
          // many root pieces

          if (isCloneBeingUsed) {
            let lastBranchingPoint = ''
            for (const input of this.inputHints) {
              lastBranchingPoint += input + ' '
            }

            lastBranchingPoint += ' ' + this.GetOutput()

            theSolution.setReasonForBranching(lastBranchingPoint)
            solutions.GetSolutions().push(theSolution)
          }

          // rediscover the current piece in theSolution - again because we might be cloned
          const thePiece = theSolution.FindAnyPieceMatchingIdRecursively(this.id)

          if (thePiece != null) {
            theMatchingPiece.parent = thePiece
            thePiece.inputs[k] = theMatchingPiece

            // all pieces are incomplete when they are *just* added
            theSolution.AddRestrictions(theMatchingPiece.getRestrictions())
          } else {
            console.warn('piece is null - so we are cloning wrong')
          }
        }

        const hasACloneJustBeenCreated = matchingPieces.length > 1
        if (hasACloneJustBeenCreated) {
          return true
        } // yes is incomplete
      }
    }
    return false
  }

  SetTalkPath (talkPath: string): void {
    this.talkPath = talkPath
  }

  GetTalkPath (): string {
    return this.talkPath
  }
}
