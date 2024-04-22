export const createBiasedRandom = (bias: number, min = -1, max = 1) => {
  // https://stackoverflow.com/questions/29325069/how-to-generate-random-numbers-biased-towards-one-value-in-a-range
  const mix = Math.random()
  return (Math.random() * (max - min) + min) * (1 - mix) + bias * mix
}

export const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const sigmoid = (value: number) => 1 / (1 + Math.exp(-value))
