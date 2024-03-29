import { SingleFile } from '../../../src/puzzle/SingleFile'
import { expect, describe, test } from '@jest/globals'
import { PileOfPieces } from '../../../src/puzzle/PileOfPieces'
import { join } from 'path'

describe('SingleBigSwitch', () => {
  test('SingleBigSwitch', async () => {
    console.log(__dirname)
    const file = new SingleFile(
      join(__dirname, '/../../../practice-world/'),
      'x03_access_thru_fireplace.jsonc'
    )
    const pile = new PileOfPieces(null)
    await file.copyAllPiecesToContainer(pile)
    const size = pile.Size()
    expect(size).toBe(3)
    // expect(happenings).not.toEqual(null);
    // if (happenings != null) {
    //  expect(1).not.toEqual(happenings.array.length);
    // }
  })
})
