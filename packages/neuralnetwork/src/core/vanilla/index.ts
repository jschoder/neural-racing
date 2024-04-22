import _ from 'lodash'
import config from '../../config'
import type { Brain } from '../../types'
import { createBiasedRandom, getRandomNumber, sigmoid } from '../../utils/math'

// :TODO: move to function
// TODO figure and clean
let totalConnectionCount = 0
const layerConnections: number[] = []
let previousLayerWidth
for (const layerWidth of config.layers) {
  if (previousLayerWidth) {
    totalConnectionCount += previousLayerWidth * layerWidth
    layerConnections.push(previousLayerWidth * layerWidth)
  }
  previousLayerWidth = layerWidth
}

const createRandomBrain = () => {
  const brain: Brain = []
  let previousLayer
  for (const layer of config.layers) {
    if (previousLayer) {
      const outputValues: number[][] = []
      for (let output = 0; output < layer; output++) {
        const inputValues: number[] = []
        for (let input = 0; input < previousLayer; input++) {
          inputValues.push(Math.random() * 2 - 1)
        }
        outputValues.push(inputValues)
      }
      brain.push(outputValues)
    }
    previousLayer = layer
  }
  return brain
}

export const createInitialBrains = () => {
  const vat = []
  for (let i = 0; i < config.evolution.initial; i++) {
    vat.push(createRandomBrain())
  }
  return vat
}

const mutateBrain = (brain: Brain) => {
  const { min, max } = config.evolution.variation
  const variations = getRandomNumber(min, max)

  // Store the indexes in a unique array to make sure no neuron is modified twice in the same mutation
  const variationIndexes: number[] = []
  while (variationIndexes.length < variations) {
    const index = getRandomNumber(0, totalConnectionCount - 1)
    if (!variationIndexes.includes(index)) {
      variationIndexes.push(index)
    }
  }

  for (const index of variationIndexes) {
    let layer = 0
    let layerOffset = 0
    while (
      layer < layerConnections.length &&
      index >= layerOffset + layerConnections[layer]
    ) {
      layerOffset += layerConnections[layer]
      layer++
    }
    const outputIndex = Math.floor((index - layerOffset) / config.layers[layer])
    const inputIndex = index % config.layers[layer]
    const sourceValue = brain[layer][outputIndex][inputIndex]
    brain[layer][outputIndex][inputIndex] = createBiasedRandom(sourceValue)
  }
}

export const createVariation = (sortedBrains: Brain[]): Brain[] => {
  const mostFitBrains = sortedBrains.slice(0, config.evolution.selection)
  const mutatedBrainVat = []
  for (const brain of mostFitBrains) {
    mutatedBrainVat.push(brain)
    for (let i = 0; i < config.evolution.variation.amount; i++) {
      const brainClone = _.cloneDeep(brain)
      mutateBrain(brainClone)
      mutatedBrainVat.push(brainClone)
    }
  }
  return _.shuffle(mutatedBrainVat)
}

export const processLayers = (brain: Brain, layer: number[]) => {
  const brainLength = brain.length
  for (let i1 = 0; i1 < brainLength; i1++) {
    const layerWeights = brain[i1]
    const newLayer = []
    const layerWeightsLength = layerWeights.length
    for (let i2 = 0; i2 < layerWeightsLength; i2++) {
      const outputWeights = layerWeights[i2]
      let outputSum = 0
      const outputWeightsLength = outputWeights.length
      for (let inputIndex = 0; inputIndex < outputWeightsLength; inputIndex++) {
        outputSum += layer[inputIndex] * outputWeights[inputIndex]
      }
      newLayer.push(sigmoid(outputSum))
    }
    layer = newLayer
  }
  return layer[0]
}
