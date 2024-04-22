import tracks from '../src/assets/tracks'
import readTracks from '../src/core/trackreader'

describe('TrackReader', () => {
  it('Reading the track from the SVG file', () => {
    // TODO actually test this
    const track = readTracks(
      tracks[0].path,
      tracks[0].chunks,
      tracks[0].trackWidth
    )

    expect(track.centerPoints.length).toBe(tracks[0].chunks)
    expect(track.collisionLines.length).toBe(tracks[0].chunks * 2)
    expect(track.innerPolygon.length).toBe(tracks[0].chunks)
    expect(track.outerPolygon.length).toBe(tracks[0].chunks)

    expect(track.startPoint.x).toBeGreaterThan(0)
    expect(track.startPoint.x).toBeLessThan(tracks[0].viewport.width)
    expect(track.startPoint.y).toBeGreaterThan(0)
    expect(track.startPoint.y).toBeLessThan(tracks[0].viewport.height)
  })
})
