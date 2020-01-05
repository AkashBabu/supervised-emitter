
/**
 * Returns all the keys in the Map
 *
 * @param map Map
 *
 * @returns List of keys in the given map
 */
export default function getMapKeys(map: Map<string, boolean>) {
  const keys: string[] = [];

  const keysIter = map.keys();
  let key = keysIter.next();
  while (!key.done) {
    keys.push(key.value);
    key = keysIter.next();
  }

  return keys;
}
