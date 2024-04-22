import type { Brain } from '@libs/neuralnetwork'

export type Point = {
  x: number
  y: number
}

export type Line = [Point, Point]

export type Car = {
  tl: Point
  tr: Point
  center: Point
  bl: Point
  br: Point
  angle: number
}

export type HistoryItem = {
  brain: Brain
  car: Car
  crashed: boolean
  length: number
  path: Point[]
  // TODO actually used outside evolve function?
  nextCenterPoint?: number
}

export type TrackConfig = {
  chunks: number
  path: string
  trackWidth: number
  viewport: { height: number; width: number }
}

export type Track = {
  collisionLines: Line[]
  centerPoints: Point[]
  innerPolygon: Point[]
  outerPolygon: Point[]
  startPoint: Point
  startAngle: number
  trackWidth: number
  viewport: { height: number; width: number }
}
