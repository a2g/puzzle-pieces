import { Box } from '../../../src/puzzle/Box';

test('Test GetMapOfAllStartingThings', () => {
  const box = new Box('__tests__/test/puzzle/Test1First.json');
  box.Init();

  const goals = box.GetSetOfStartingGoals();
  const props = box.GetSetOfStartingProps();
  // const invs = box.GetSetOfStartingInvs()
  // assert.strictEqual(collection.length, 1);
  expect(goals.size).toEqual(0);
  expect(props.size).toEqual(9);
});