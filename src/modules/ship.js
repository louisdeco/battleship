function Ship(length) {
  if (!length) throw new Error('Ship length must be provided');
  const _length = length;
  let _hit = 0;

  const getLength = () => _length;
  const getHit = () => _hit;
  const hit = () => (_hit += 1);
  const isSunk = () => _hit >= _length;

  return { getLength, hit, isSunk, getHit };
}

export default Ship;
