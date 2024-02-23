import promptSync from 'prompt-sync'
import { FormatText } from '../puzzle/FormatText'
import { SolverViaRootPiece } from '../puzzle/SolverViaRootPiece'
import { NavigatePieceRecursive } from './NavigatePieceRecursive'
import { TrimNonIntegratedRootPieces } from '../puzzle/TrimNonIntegratedRootPieces'
import { AddBrackets } from '../puzzle/AddBrackets'
const prompt = promptSync({})

export function ChooseDigIntoGoals2 (solver: SolverViaRootPiece): void {
  console.warn(' ')

  for (; ;) {
    solver.MarkGoalsAsCompletedAndMergeIfNeeded()
    const numberOfSolutions: number = solver.NumberOfSolutions()
    console.warn('Dig in to goals')
    console.warn('===============')
    console.warn(`Number of solutions in solver = ${numberOfSolutions}`)

    solver.GenerateSolutionNamesAndPush()
    console.warn('Pick solution')
    console.warn('================')
    console.warn(`Number of solutions = ${numberOfSolutions}`)
    if (solver.GetSolutions().length > 1) {
      console.warn('    0. All solutions')
    }
    for (let i = 0; i < solver.GetSolutions().length; i++) {
      const solution = solver.GetSolutions()[i]
      let numberOfUnsolveds = 0
      for (const goalArray of solution.GetRootMap().GetValues()) {
        for (const goal of goalArray) {
          numberOfUnsolveds += goal.IsSolved() ? 0 : 1
        }
      }
      const reason = solution.getReasonForBranching()
      const name = FormatText(solution.GetDisplayNamesConcatenated())
      //  "1. XXXXXX"   <- this is the format we list the solutions
      console.warn(`    ${i + 1}. ${name} number of unsolved goals=${numberOfUnsolveds}  reason= ${reason}`)
    }

    // allow user to choose item
    const firstInput = prompt(
      'Choose an ingredient of one of the solutions or (b)ack, (r)e-run: '
    ).toLowerCase()

    if (firstInput === null || firstInput === 'b') {
      return
    }

    if (firstInput === 'r') {
      solver.SolvePartiallyUntilCloning()
      continue
    } else {
      let incomplete = 0
      const theNumber = Number(firstInput)
      if (theNumber < 1 || theNumber > solver.GetSolutions().length) {
        continue
      }
      for (; ;) {
        const solution = solver.GetSolutions()[theNumber - 1]
        // list all leaves, of all solutions in order
        TrimNonIntegratedRootPieces(solution)

        const text = FormatText(solution.GetDisplayNamesConcatenated())
        const NAME_NOT_DETERMINABLE = 'name_not_determinable'
        // HACKY!
        const label =
          text.length > 8
            ? text
            : NAME_NOT_DETERMINABLE

        console.warn(`A. ${label} ${solution.getReasonForBranching()}`)
        let listItemNumber = 0
        for (const rootGoals of solution.GetRootMap().GetValues()) {
          for (const rootGoal of rootGoals) {
            listItemNumber++

            // display list item
            const { output } = rootGoal.piece
            let inputs = ''
            for (const inputSpiel of rootGoal.piece.inputSpiels) {
              inputs += `${FormatText(inputSpiel)},`
            }
            console.warn(
              `    ${listItemNumber}. ${FormatText(output)} ${AddBrackets(inputs)} (status=${rootGoal.IsSolved() ? 'Solved' : 'Unsolved'})`
            )
            incomplete += rootGoal.IsSolved() ? 0 : 1
          }
        }

        console.warn(`Number of goals incomplete ${incomplete}/${listItemNumber}`)

        // allow user to choose item
        const input = prompt(
          'Choose goal to dig down on or (b)ack, (r)e-run: '
        ).toLowerCase()
        if (input === null || input === 'b') {
          return
        }
        if (input === 'r') {
          solver.SolvePartiallyUntilCloning()
          continue
        } else {
          // show map entry for chosen item
          const theNumber = Number(input)
          if (theNumber > 0 && theNumber <= listItemNumber) {
            const solutions = solver.GetSolutions()
            for (let i = 0; i < solutions.length; i++) {
              const rootMap = solutions[i].GetRootMap()
              const goals = rootMap.GetValues()
              for (const array of goals) {
                for (const goal of array) {
                  i++
                  if (i === theNumber) {
                    NavigatePieceRecursive(goal.piece, rootMap, solution)
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
