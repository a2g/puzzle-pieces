import { existsSync } from 'fs'
import { Aggregates } from './Aggregates'
import { Box } from './Box'
import { IsPieceOutputtingAGoal } from './IsPieceOutputtingAGoal'
import { Piece } from './Piece'

export function AddPiece (piece: Piece, folder = '', isNoFile = true, box: Box, aggregates: Aggregates): void {
  if (IsPieceOutputtingAGoal(piece)) {
    const goalWord = piece.output
    box.GetSetOfGoalWords().add(goalWord)
    aggregates.setOfGoalWords.add(goalWord)
    // if not file exists for goal name
    // then throw an exception, unless
    //  - xwin
    //  - isNoFile flag ==true
    // this will force addressing whether
    // the problem is due to renaming <-- commonly is!
    // or if it doesn't need one then
    // we force to add isNoFile
    //
    // if we only added a file if it existed
    // then the error would be hidden and
    // would be subtle to discover
    if (goalWord !== 'x_win' && !isNoFile) {
      const file = `${goalWord}.jsonc`
      if (!existsSync(folder + file)) {
        throw new Error(
          `Ensure "isNoFile" needs to be marked for goal ${goalWord} of ${piece.type} in ${goalWord}, because the following file doesn't exist ${folder}`
        )
      }

      let box = aggregates.mapOfBoxes.get(file)
      if (box == null) {
        /* this map not only collects all the boxes */
        /* but prevents two pieces that output same goal from */
        /* processing the same file */
        box = new Box(folder, [file], aggregates)
      }
      piece.boxToMerge = box
    }
  }

  // initialize array, if it hasn't yet been
  if (!box.GetPieces().has(piece.output)) {
    box.GetPieces().set(piece.output, new Set<Piece>())
  }
  box.GetPieces().get(piece.output)?.add(piece)

  // do the same again with aggregates
  if (!aggregates.piecesMapped.has(piece.output)) {
    aggregates.piecesMapped.set(piece.output, new Set<Piece>())
  }
  aggregates.piecesMapped.get(piece.output)?.add(piece)
}
