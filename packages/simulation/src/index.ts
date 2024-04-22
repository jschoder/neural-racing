import trackConfigs from './assets/tracks'
import config from './config'
import runEngine from './core/Engine'
import evolveBrains from './core/Evolution'
import readTracks from './core/TrackReader'
import type { Car, HistoryItem, Line, Track } from './types'

export type { Car, HistoryItem, Line, Track }

const carConfig = { height: config.car.height, width: config.car.width }
const tracks = trackConfigs.map((trackConfig) => readTracks(trackConfig))

export { carConfig, evolveBrains, runEngine, tracks }
