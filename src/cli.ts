import promptSync from 'prompt-sync'
import { BigBoxViaSetOfBoxes } from './puzzle/BigBoxViaSetOfBoxes'
import { Box } from './puzzle/Box'
import { SolverViaRootPiece } from './puzzle/SolverViaRootPiece'
import { ChooseDigDeprecated } from './cli/ChooseDigDeprecated'
import { ChooseListOfLeaves } from './cli/ChooseListOfLeaves'
import { ChooseOrderOfCommands } from './cli/ChooseOrderOfCommands'
import { ChooseToFindUnused } from './cli/ChooseToFindUnused'
import { $IStarter, getJsonOfStarters } from './api/getJsonOfStarters'
import { ChooseDigIntoGoals2 } from './cli/ChooseDigIntoGoals2'
import { DumpGainsFromEachTalkInFolder } from './cli/DumpGansFromEachTalkInFolder'
const prompt = promptSync()

function main (): void {
  const starters: $IStarter[] = getJsonOfStarters()

  for (; ;) {
    for (let i = 1; i <= starters.length; i++) {
      const starter = starters[i - 1]
      console.warn(`${i}. ${starter.world} ${starter.area}  ${i}`)
    }

    const indexAsString = prompt(
      'Choose an area to Load (b)ail): '
    ).toLowerCase()
    const index = Number(indexAsString) - 1
    switch (indexAsString) {
      case 'b':
        return
      default:
        if (index >= 0 && index < starters.length) {
          for (; ;) {
            const starter = starters[index]
            DumpGainsFromEachTalkInFolder(starter.folder)

            const firstBox = new Box(starter.folder, starter.file)

            const allBoxes = new Map<string, Box>()
            // this is how we prime the special pieces only
            firstBox.CollectAllReferencedBoxesRecursively(allBoxes)
            const combined = new BigBoxViaSetOfBoxes(allBoxes)

            const solverPrimedWithCombined = new SolverViaRootPiece(combined)
            const solverPrimedWithFirstBox = new SolverViaRootPiece(firstBox)

            console.warn(`\nSubMenu of ${starter.file}`)
            console.warn(
              `number of pieces = ${solverPrimedWithCombined
                .GetSolutions()[0]
                .GetSize()}`
            )
            console.warn('---------------------------------------')
            console.warn('1. Dig all boxes at once')
            console.warn('2. Dig a box-at-a-time')
            console.warn('3. Leaves all boxes at once.')
            console.warn('4. Leaves a box-at-a-time`')
            console.warn('5. Order of Commands in solve')
            console.warn('6. Choose Dig into goals (old)')
            console.warn('7. Check for unused props and invs <-- delete these from enums')
            console.warn('8. Play')

            const choice = prompt('Choose an option (b)ack: ').toLowerCase()
            if (choice === 'b') {
              break
            }
            switch (choice) {
              case '1':
                ChooseDigIntoGoals2(solverPrimedWithFirstBox)
                break
              case '2':
                ChooseDigIntoGoals2(solverPrimedWithCombined)
                break
              case '3':
                ChooseListOfLeaves(solverPrimedWithCombined)
                break
              case '4':
                ChooseListOfLeaves(solverPrimedWithFirstBox)
                break
              case '5':
                ChooseOrderOfCommands(solverPrimedWithFirstBox)
                break
              case '6':
                ChooseDigDeprecated(solverPrimedWithFirstBox)
                break
              case '7':
                ChooseToFindUnused(combined)
                break
              default:
            }
          }
        }
    }
  }
}

main()
