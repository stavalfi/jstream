import kindof from 'kindof'

export const findCharIndex = ({str, fromIndex, toIndex, chars}) => {
  for (let i = fromIndex; i <= toIndex; i++) if (chars.includes(str[i])) return i;
  return toIndex + 1;
};

export function extractEdgesAsArray(edges) {
  switch (kindof(edges)) {
    case 'string':
      return [edges];
    case 'array':
      return edges;
    case 'object':
      return extractEdgesAsArray(edges.flow);
  }
}