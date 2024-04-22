import _ from 'lodash'

import type { Line, Point, Track, TrackConfig } from '../../types'
import { angleDeg, angleRadians } from '../../utils/geometry'
import { svgPathProperties } from 'svg-path-properties'

export default (trackConfig: TrackConfig): Track => {
  const properties = new svgPathProperties(trackConfig.path)
  const  centerPoints: Point[] = []
  const chunkLength = properties.getTotalLength() / trackConfig.chunks
  for (let i = 0; i < trackConfig.chunks; i++) {
    const point = properties.getPointAtLength(i * chunkLength)
    centerPoints.push({
      x: Math.round(point.x),
      y: Math.round(point.y),
    })
  }

  if (centerPoints.length === 0) {
    throw new Error('No track found')
  }

  const innerPolygon = []
  const outerPolygon = []
  const halfTrackWidth = trackConfig.trackWidth / 2
  for (let i = 0; i < centerPoints.length; i++) {
    const radiant1 = angleRadians(
      i === 0 ? centerPoints[centerPoints.length - 1] : centerPoints[i - 1],
      centerPoints[i]
    )
    let radiant2 = angleRadians(
      centerPoints[i],
      i === centerPoints.length - 1 ? centerPoints[0] : centerPoints[i + 1]
    )
    if ((radiant1 < 0 && radiant2 > 0) || (radiant2 < 0 && radiant1 > 0)) {
      radiant2 *= -1
    }
    const between = (Math.PI - radiant1 - radiant2) / 2
    innerPolygon.push({
      x: Math.round(centerPoints[i].x + halfTrackWidth * Math.cos(between)),
      y: Math.round(centerPoints[i].y - halfTrackWidth * Math.sin(between)),
    })
    outerPolygon.push({
      x: Math.round(
        centerPoints[i].x + halfTrackWidth * Math.cos(between + Math.PI)
      ),
      y: Math.round(
        centerPoints[i].y - halfTrackWidth * Math.sin(between + Math.PI)
      ),
    })
  }

  // Error handling
  if (innerPolygon.length === 0 || outerPolygon.length === 0) {
    throw new Error('Reading polygons failed')
  }

  const collisionLines: Line[] = []
  let lastInnerPoint
  for (const point of innerPolygon) {
    if (lastInnerPoint) {
      collisionLines.push([lastInnerPoint, point])
    }
    lastInnerPoint = point
  }
  collisionLines.push([
    innerPolygon[innerPolygon.length - 1],
    innerPolygon[0],
  ])
  let lastOuterPoint
  for (const point of outerPolygon) {
    if (lastOuterPoint) {
      collisionLines.push([lastOuterPoint, point])
    }
    lastOuterPoint = point
  }
  collisionLines.push([
    outerPolygon[outerPolygon.length - 1],
    outerPolygon[0],
  ])

  const firstAvgPoint = {
    x: (innerPolygon[0].x + outerPolygon[0].x) / 2,
    y: (innerPolygon[0].y + outerPolygon[0].y) / 2,
  }
  const secondAvgPoint = {
    x: (innerPolygon[1].x + outerPolygon[1].x) / 2,
    y: (innerPolygon[1].y + outerPolygon[1].y) / 2,
  }
  const startPoint = firstAvgPoint
  const startAngle = angleDeg(firstAvgPoint, secondAvgPoint)

  return {
    centerPoints,
    collisionLines,
    innerPolygon,
    outerPolygon,
    startAngle,
    startPoint,
    trackWidth: trackConfig.trackWidth,
    viewport: trackConfig.viewport
  }
}

