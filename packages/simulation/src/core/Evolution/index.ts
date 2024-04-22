import _ from 'lodash'
import { calculateDistance } from '../../utils/geometry'
import type { HistoryItem, Track } from '../../types'
import type { Brain } from '@libs/neuralnetwork'
import { createVariation } from '@libs/neuralnetwork'

export default (
  track: Track,
  history: HistoryItem[]
): Brain[] => {
  // :TODO: move to own function
  console.log('Natural-ish selection of brains')
  const halfTrackWidth = track.trackWidth / 2
  // Check how far along the track they have made it
  const sortedBrains = history
    .map((item) => {
      let nextCenterPoint = 1
      for (let i = 0; i < item.path.length; i++) {
        if (
          calculateDistance(item.path[i], track.centerPoints[nextCenterPoint]) <
          halfTrackWidth
        ) {
          nextCenterPoint++
        }
      }
      item.nextCenterPoint = nextCenterPoint
      return item
    })
    .sort((a, b) =>
      a.nextCenterPoint === b.nextCenterPoint
        ? // :TODO: !!!! check this logic again (shorter = better)
          b.path.length - a.path.length
        : (b.nextCenterPoint || 0) - (a.nextCenterPoint || 0)
    ).map(history => history.brain)

  return createVariation(sortedBrains)
}
