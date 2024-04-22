import _ from 'lodash'
import React from 'react'

import BackspaceIcon from '@mui/icons-material/Backspace'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import type { Brain } from '@libs/neuralnetwork'
import { createInitialBrains } from '@libs/neuralnetwork'
import type { HistoryItem, Track } from '@libs/simulation'
import { evolveBrains, runEngine, tracks } from '@libs/simulation'

import RaceTrack from '../../components/RaceTrack'

function App() {
  const [brainVat, setBrainVat] = React.useState<Brain[]>([])
  const [generation, setGeneration] = React.useState<number>(1)

  const [startTrigger, setStartTrigger] = React.useState(false)

  const [startTimestamp, setStartTimestamp] = React.useState(0)
  const [pipeline, setPipeline] = React.useState<Brain[]>([])
  const [track] = React.useState<Track>(tracks[0])
  const [history, setHistory] = React.useState<HistoryItem[]>([])

  const fillInitialBrainVat = () => {
    const vat = createInitialBrains()
    setBrainVat(vat)
    setGeneration(1)
    window.localStorage.setItem('brainVat', JSON.stringify(vat))
    window.localStorage.setItem('generation', '1')
  }

  React.useEffect(() => {
    const vat = JSON.parse(window.localStorage.getItem('brainVat') || '{}')
    if (Object.keys(vat).length !== 0) {
      console.log('Load brain vat', vat)
      setBrainVat(vat)
      setGeneration(parseInt(window.localStorage.getItem('generation') || '1'))
    } else {
      console.log('Fill empty brain vat')
      fillInitialBrainVat()
    }
  }, [])

  React.useEffect(() => {
    if (startTrigger) {
      setStartTrigger(false)
      console.log('Run simulation', generation)

      setStartTimestamp(new Date().getTime())
      setHistory([])
      setPipeline(_.cloneDeep(brainVat))
    }
  }, [startTrigger])

  React.useEffect(() => {
    if (pipeline.length > 0) {
      const pipelineCopy = _.cloneDeep(pipeline)
      const brain = pipelineCopy.pop()
      if (!brain) {
        return
      }
      runEngine(track, brain).then((historyItem: HistoryItem) => {
        const historyCopy = _.cloneDeep(history)
        historyCopy.push(historyItem)
        setHistory(historyCopy)
        setPipeline(pipelineCopy)
      })
    }
  }, [pipeline])

  React.useEffect(() => {
    if (history.length > 0 && pipeline.length === 0) {
      const endTimestamp = new Date().getTime()
      console.log(
        'Run complete',
        endTimestamp - startTimestamp,
        Math.floor((endTimestamp - startTimestamp) / brainVat.length),
      )

      const evolvedBrains = evolveBrains(track, history)
      setBrainVat(evolvedBrains)
      setGeneration(generation + 1)
      window.localStorage.setItem('brainVat', JSON.stringify(evolvedBrains))
      window.localStorage.setItem('generation', (generation + 1).toString())
      setStartTimestamp(0)
      console.log('Read for next run')
      //      setTimeout(() => setStartTrigger(true), 1000)
    }
  }, [history])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant='body2' align='center'>
          Generation
          <br />
          <strong>{generation}</strong>
        </Typography>
        <Typography variant='body2' align='center'>
          Brains
          <br />
          <strong>
            {history.length} / {brainVat.length}
          </strong>
        </Typography>
        <div>
          <IconButton
            color='primary'
            disabled={startTimestamp !== 0}
            onClick={() => {
              console.log('Reset brains')
              fillInitialBrainVat()
            }}
          >
            <BackspaceIcon />
          </IconButton>
        </div>
        <div>
          <IconButton
            color='primary'
            disabled={startTimestamp !== 0}
            onClick={() => setStartTrigger(true)}
          >
            <PlayCircleOutlineIcon />
          </IconButton>
        </div>
      </Box>
      {track && <RaceTrack history={history} track={track} />}
    </Box>
  )
}

export default App
