import _ from 'lodash'
import type { Line, Point } from '../../types'

const piRadian = Math.PI / 180

export const applyVector = (source: Point, vector: Point) => ({
  x: source.x + vector.x,
  y: source.y + vector.y,
})

export const createVector = (distance: number, angle: number) => ({
  x: Math.round(distance * Math.cos(angle * piRadian)),
  y: Math.round(distance * Math.sin(angle * piRadian)),
})

// :TODO: performance - multiple direct calculations vs const-variables
export const rotate = (point: Point, center: Point, angle: number) => {
  const centeredX = point.x - center.x
  const centeredY = point.y - center.y
  const angleCos = Math.cos(angle * piRadian)
  const angleSin = Math.sin(angle * piRadian)
  return {
    x: centeredX * angleCos - centeredY * angleSin + center.x,
    y: centeredX * angleSin + centeredY * angleCos + center.y,
  }
}

export const isInPolygon = (point: Point, polygon: Point[]) => {
  // Source: https://stackoverflow.com/questions/22521982/check-if-point-is-inside-a-polygon
  // return Math.random() < 0.3

  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  const { x, y } = point
  let inside = false
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let point1 = polygon[i]
    let point2 = polygon[j]
    var intersect =
      point1.y > y !== point2.y > y &&
      x <
        ((point2.x - point1.x) * (y - point1.y)) / (point2.y - point1.y) +
          point1.x
    if (intersect) {
      inside = !inside
    }
  }
  return inside
}

export const angleRadians = (point1: Point, point2: Point) =>
  Math.atan2(point2.y - point1.y, point2.x - point1.x)

export const angleDeg = (point1: Point, point2: Point) =>
  (Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180) / Math.PI

export const lineProjection = (x: number, point1: Point, point2: Point) =>
  ((point2.y - point1.y) / (point2.x - point1.x)) * (x - point1.x) + point1.y

export const getLineInterjection = (
  line1Point1: Point,
  line1Point2: Point,
  line2Point1: Point,
  line2Point2: Point
) => {
  const denominator =
    (line2Point2.y - line2Point1.y) * (line1Point2.x - line1Point1.x) -
    (line2Point2.x - line2Point1.x) * (line1Point2.y - line1Point1.y)
  if (denominator === 0) {
    return false
  }
  const ua =
    ((line2Point2.x - line2Point1.x) * (line1Point1.y - line2Point1.y) -
      (line2Point2.y - line2Point1.y) * (line1Point1.x - line2Point1.x)) /
    denominator
  //  const ub = ((line1Point2.x - line1Point1.x) * (line1Point1.y - line2Point1.y) - (line1Point2.y - line1Point1.y) * (line1Point1.x - line2Point1.x)) / denominator
  return {
    x: line1Point1.x + ua * (line1Point2.x - line1Point1.x),
    y: line1Point1.y + ua * (line1Point2.y - line1Point1.y),
    seg1: ua >= 0 && ua <= 1,
    //    seg2: ub >= 0 && ub <= 1
  }
}

export const calculateDistance = (point1: Point, point2: Point) =>
  Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))

export const distanceToCollision = (
  collisionLines: Line[],
  backPoint: Point,
  frontPoint: Point
) => {
  const allLinesInDirection = collisionLines.filter((line) => {
    if (
      frontPoint.x > backPoint.x &&
      frontPoint.x > line[0].x &&
      frontPoint.x > line[1].x
    ) {
      return false
    } else if (
      frontPoint.x < backPoint.x &&
      frontPoint.x < line[0].x &&
      frontPoint.x < line[1].x
    ) {
      return false
    } else if (
      frontPoint.y > backPoint.y &&
      frontPoint.y > line[0].y &&
      frontPoint.y > line[1].y
    ) {
      return false
    } else if (
      frontPoint.y < backPoint.y &&
      frontPoint.y < line[0].y &&
      frontPoint.y < line[1].y
    ) {
      return false
    } else {
      return true
    }
  })
  const interjectionPoints: Point[] = []
  for (const line of allLinesInDirection) {
    const interjection = getLineInterjection(
      line[0],
      line[1],
      frontPoint,
      backPoint
    )
    if (interjection && interjection.seg1) {
      if (interjection.seg1) {
        interjectionPoints.push({
          x: interjection.x,
          y: interjection.y,
        })
      }
    }
  }
  const nearestPoint = _.first(
    interjectionPoints
      .map((point) => ({
        x: point.x,
        y: point.y,
        distance: calculateDistance(frontPoint, point),
      }))
      .sort((point1, point2) => point1.distance - point2.distance)
  )

  if (nearestPoint === undefined) {
    console.log('CRASH POINT', backPoint, frontPoint)
    return 99999
  }

  return nearestPoint.distance
}
