import type { Brain } from '@libs/neuralnetwork'
import { processLayers } from '@libs/neuralnetwork'
import config from '../../config'
import type { Car, Point, Track } from '../../types'
import {
  applyVector,
  createVector,
  distanceToCollision,
  isInPolygon,
  rotate,
} from '../../utils/geometry'

const initCar = (startPoint: Point, startAngle: number) => {
  const left = startPoint.x - config.car.height / 2
  const right = startPoint.x + config.car.height / 2
  const top = startPoint.y - config.car.width / 2
  const bottom = startPoint.y + config.car.width / 2
  const car: Car = {
    tl: {
      x: left,
      y: top,
    },
    tr: {
      x: right,
      y: top,
    },
    center: {
      x: startPoint.x,
      y: startPoint.y,
    },
    bl: {
      x: left,
      y: bottom,
    },
    br: {
      x: right,
      y: bottom,
    },
    angle: startAngle,
  }

  car.tl = rotate(car.tl, car.center, startAngle)
  car.tr = rotate(car.tr, car.center, startAngle)
  car.bl = rotate(car.bl, car.center, startAngle)
  car.br = rotate(car.br, car.center, startAngle)
  return car
}

const move = (car: Car, speed: number, degree: number) => {
  car.tl = rotate(car.tl, car.center, degree)
  car.tr = rotate(car.tr, car.center, degree)
  car.bl = rotate(car.bl, car.center, degree)
  car.br = rotate(car.br, car.center, degree)
  car.angle = car.angle + degree
  if (car.angle < 0) {
    car.angle += 360
  } else if (car.angle >= 360) {
    car.angle -= 360
  }

  if (car.angle < 0 || car.angle >= 360) {
    console.error('Illegal car angle', car.angle)
  }

  const vector = createVector(speed, car.angle)
  car.tl = applyVector(car.tl, vector)
  car.tr = applyVector(car.tr, vector)
  car.center = applyVector(car.center, vector)
  car.bl = applyVector(car.bl, vector)
  car.br = applyVector(car.br, vector)
}

const isInsideTrack = (
  innerPolygon: Point[],
  outerPolygon: Point[],
  point: Point,
) => isInPolygon(point, outerPolygon) && !isInPolygon(point, innerPolygon)

const isCrashed = (innerPolygon: Point[], outerPolygon: Point[], car: Car) =>
  !isInsideTrack(innerPolygon, outerPolygon, car.tl) ||
  !isInsideTrack(innerPolygon, outerPolygon, car.tr) ||
  !isInsideTrack(innerPolygon, outerPolygon, car.bl) ||
  !isInsideTrack(innerPolygon, outerPolygon, car.br)

export default async (track: Track, brain: Brain) => {
  const car = initCar(track.startPoint, track.startAngle)
  const path: Point[] = [
    {
      x: car.center.x,
      y: car.center.y,
    },
  ]
  let crashed = false
  let aggregatedDegree = 0

  for (let i = 0; i < 100000 && !crashed; i++) {
    //    const correctedAngle = car.angle >= 315 ? car.angle - 360 : car.angle
    //    const areal = Math.floor((correctedAngle + 45) / 90)
    //    const relativeAngle = correctedAngle - (areal * 90)
    const brainFactor = processLayers(brain, [
      distanceToCollision(track.collisionLines, car.tr, car.tl),
      distanceToCollision(track.collisionLines, car.bl, car.tl),
      distanceToCollision(track.collisionLines, car.br, car.tr),
      distanceToCollision(track.collisionLines, car.tl, car.tr),
    ])

    const degree =
      brainFactor * 2 * config.car.turnFactor - config.car.turnFactor
    aggregatedDegree += degree
    move(car, config.car.speed, degree)
    path.push({
      x: car.center.x,
      y: car.center.y,
    })
    if (
      aggregatedDegree > config.car.degreeTillExplode ||
      aggregatedDegree < -config.car.degreeTillExplode
    ) {
      crashed = true
    } else {
      crashed = isCrashed(track.innerPolygon, track.outerPolygon, car)
    }
  }

  const length = path
    .filter((_value: Point, index: number) => index % 10 === 0)
    .reduce(
      (
        total: number,
        currentValue: Point,
        currentIndex: number,
        arr: Point[],
      ) =>
        currentIndex > 1
          ? total +
            Math.max(arr[currentIndex - 1].x, currentValue.x) -
            Math.min(arr[currentIndex - 1].x, currentValue.x) +
            Math.max(arr[currentIndex - 1].y, currentValue.y) -
            Math.min(arr[currentIndex - 1].y, currentValue.y)
          : 0,
      0,
    )

  return { brain, car, crashed, length, path }
}
