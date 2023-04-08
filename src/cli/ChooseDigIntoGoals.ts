import promptSync from 'prompt-sync';
import { FormatText } from '../puzzle/FormatText';
import { SolverViaRootPiece } from '../puzzle/SolverViaRootPiece';
import { NavigatePieceRecursive } from './NavigatePieceRecursive';

const prompt = promptSync({});

export function ChooseDigIntoGoals(solver: SolverViaRootPiece): void {
  console.warn(' ');

  for (;;) {
    solver.SolvePartiallyUntilCloning();
    solver.MarkGoalsAsCompletedAndMergeIfNeeded();
    const numberOfSolutions: number = solver.NumberOfSolutions();
    console.warn('Dig in to goals');
    console.warn('===============');
    console.warn(`Number of solutions in solver = ${numberOfSolutions}`);

    // display list
    let incomplete = 0;
    let listItemNumber = 0;
    for (const solution of solver.GetSolutions()) {
      console.warn(FormatText(solution.GetDisplayNamesConcatenated()));
      console.warn(FormatText(solution.GetRootMap().CalculateListOfKeys()));
      for (const item of solution.GetRootMap().GetValues()) {
        listItemNumber++;

        // display list item
        const status: string = item.firstNullInput;
        const { output } = item.piece;
        console.warn(`    ${listItemNumber}. ${output} (${status})`);
        incomplete += status.length > 0 ? 1 : 0;
      }
    }
    console.warn(`Number of goals incomplete ${incomplete}/${listItemNumber}`);

    // allow user to choose item
    const input = prompt(
      'Choose goal to dig down on or (b)ack, (r)e-run: '
    ).toLowerCase();
    if (input === null || input === 'b') {
      return;
    }
    if (input === 'r') {
      continue;
    } else {
      // show map entry for chosen item
      const theNumber = Number(input);
      if (theNumber > 0 && theNumber <= listItemNumber) {
        let i = 0;
        for (const solution of solver.GetSolutions()) {
          const goals = solution.GetRootMap().GetValues();
          for (const goal of goals) {
            i++;
            if (i === theNumber) {
              NavigatePieceRecursive(goal.piece, solution.GetRootMap());
            }
          }
        }
      }
    }
  }
}