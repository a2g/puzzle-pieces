import { Mix } from '../../../src/puzzle/Mix';
import { MixedObjectsAndVerb } from '../../../src/puzzle/MixedObjectsAndVerb';
import { SingleFile } from '../../../src/puzzle/SingleFile';
import { expect, describe, test } from '@jest/globals';
import { PileOfPieces } from '../../../src/puzzle/PileOfPieces';

describe('SingleBigSwitch', () => {
  test('TestFirst', async () => {
    const combo = new MixedObjectsAndVerb(
      Mix.SingleVsProp,
      'Grab',
      'prop_loose_brick'
    );
    const isReturnHappenings = false;
    const file = new SingleFile('/../../../testsYup/', 'Test1First.jsonc');
    const happenings = await file.bigSwitch(combo, isReturnHappenings, null);

    expect(happenings).not.toEqual(null);
    if (happenings != null) {
      expect(1).not.toEqual(happenings.array.length);
    }
  });

  test('SingleBigSwitch', async () => {
    console.log(__dirname);
    const combo = new MixedObjectsAndVerb(
      Mix.SingleVsProp,
      'Grab',
      'prop_loose_brick'
    );
    const isGoalRetrieval = true;
    const file = new SingleFile(
      __dirname + '/../../../practice-world/',
      '03_access_thru_fireplace_goal.jsonc'
    );
    const pile = new PileOfPieces(null);
    await file.bigSwitch(combo, isGoalRetrieval, pile);
    const size = pile.Size();
    expect(size).toBe(3);
    //expect(happenings).not.toEqual(null);
    //if (happenings != null) {
    //  expect(1).not.toEqual(happenings.array.length);
    //}
  });
});
