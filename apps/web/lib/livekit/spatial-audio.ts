import { TILE_SIZE } from "../phaser/data/office-map";

const MAX_AUDIO_DISTANCE_TILES = 8;
const MAX_AUDIO_DISTANCE_PX = MAX_AUDIO_DISTANCE_TILES * TILE_SIZE;

export interface SpatialAudioResult {
  volume: number;
  pan: number;
}

/**
 * Calculates spatial audio volume and stereo pan based on Euclidean distance.
 *
 * Volume decays linearly:
 *   V(d) = max(0, 1 - d / d_max)
 *
 * Pan is determined by horizontal offset:
 *   pan ∈ [-1, 1] where -1 = fully left, 1 = fully right
 */
export function calculateSpatialAudio(
  localX: number,
  localY: number,
  remoteX: number,
  remoteY: number
): SpatialAudioResult {
  const dx = remoteX - localX;
  const dy = remoteY - localY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const volume = Math.max(0, 1 - distance / MAX_AUDIO_DISTANCE_PX);

  const pan = Math.max(-1, Math.min(1, dx / MAX_AUDIO_DISTANCE_PX));

  return { volume, pan };
}

/**
 * Determines if two players should use isolated zone audio instead of spatial.
 * If both are in the same private zone, they hear each other at full volume.
 * If they're in different private zones, they're muted from each other.
 */
export function shouldUseZoneAudio(
  localZone: string,
  remoteZone: string
): "full" | "muted" | "spatial" {
  const localInPrivate = localZone !== "main" && localZone !== "lounge";
  const remoteInPrivate = remoteZone !== "main" && remoteZone !== "lounge";

  if (localInPrivate && remoteInPrivate) {
    return localZone === remoteZone ? "full" : "muted";
  }

  if (localInPrivate || remoteInPrivate) {
    return "muted";
  }

  return "spatial";
}

/**
 * Returns the final volume for a remote participant considering both
 * spatial distance and zone isolation rules.
 */
export function getEffectiveVolume(
  localX: number,
  localY: number,
  localZone: string,
  remoteX: number,
  remoteY: number,
  remoteZone: string
): SpatialAudioResult {
  const zoneMode = shouldUseZoneAudio(localZone, remoteZone);

  switch (zoneMode) {
    case "full":
      return { volume: 1.0, pan: 0 };
    case "muted":
      return { volume: 0, pan: 0 };
    case "spatial":
      return calculateSpatialAudio(localX, localY, remoteX, remoteY);
  }
}
