import type { Car, HistoryItem, Line, Track } from '@libs/simulation'
import { carConfig } from '@libs/simulation'
import Box from '@mui/material/Box'
import config from '../../config'

type RaceTrackProps = {
  history: HistoryItem[]
  track: Track
}

function RaceTrack({ history, track }: RaceTrackProps) {
  const getCarColor = (car: Car) => {
    if (car.angle < 0 || car.angle >= 360) {
      console.error('Invalid car angle', car.angle)
      return '#000'
    }

    const correctedAngle = car.angle >= 315 ? car.angle - 360 : car.angle
    const areal = Math.floor((correctedAngle + 45) / 90)

    if (areal === 0) {
      return '#F00'
    } else if (areal === 1) {
      return '#0F0'
    } else if (areal === 2) {
      return '#00F'
    } else if (areal === 3) {
      return '#F0F'
    }

    return '#000'
  }

  return (
    <Box
      sx={{
        flexGrow: 0,
        flexShrink: 0,
        border: '1px solid lightgrey',
        '& svg': {
          display: 'block',
          width: '1200px',
          height: '1200px',
        },
      }}
    >
      <svg viewBox={`0 0  ${track.viewport.width} ${track.viewport.height}`}>
        <circle
          cx={track.startPoint.x}
          cy={track.startPoint.y}
          r={Math.max(carConfig.height, carConfig.width)}
          stroke='#32CD32'
          strokeWidth='1'
          fill='none'
        />
        {track.centerPoints.map((point) => (
          <circle
            cx={point.x}
            cy={point.y}
            r={3}
            stroke='lightgrey'
            strokeWidth='1'
            fill='none'
          />
        ))}
        {track.collisionLines.map((line: Line, index: number) => (
          <path
            key={'collision' + index}
            d={'M' + line.map((item) => item.x + ' ' + item.y).join(' L')}
            fill='none'
            stroke='#000'
            strokeWidth={1}
          />
        ))}

        {history
          .filter((historyItem) => historyItem.length > 0)
          .map((historyItem, index) => (
            <path
              key={index}
              d={
                'M' +
                historyItem.path.map((item) => item.x + ' ' + item.y).join(' L')
              }
              fill='none'
              stroke={config.route.line}
            />
          ))}
        {history
          .filter(
            (historyItem) => historyItem.length > 0 && historyItem.crashed,
          )
          .map((historyItem, index) => (
            <path
              key={index}
              d={
                'M' +
                historyItem.car.tl.x +
                ' ' +
                historyItem.car.tl.y +
                ' L' +
                historyItem.car.tr.x +
                ' ' +
                historyItem.car.tr.y +
                ' L' +
                historyItem.car.br.x +
                ' ' +
                historyItem.car.br.y +
                ' L' +
                historyItem.car.bl.x +
                ' ' +
                historyItem.car.bl.y +
                ' Z'
              }
              fill='none'
              strokeWidth='1'
              stroke={getCarColor(historyItem.car)}
            />
          ))}
      </svg>
    </Box>
  )
}

export default RaceTrack
