import deepMerge from 'deepmerge';

// https://github.com/TehShrike/deepmerge
// wrapper using combineMerge so that arrays will be merged instead of concatenated

function combineMerge(target, source, options) {
  const destination = target.slice();

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = deepMerge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
}

export default function merge(A, B) {
  return deepMerge(A, B, { arrayMerge: combineMerge });
}
