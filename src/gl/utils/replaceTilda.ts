export function replaceTilda(
  inputString: string,
  replacementMap?: Record<string, any>,
) {
  return inputString.replace(/~\{(\w+)\}/g, (match, variable) => {
    return replacementMap?.[variable] || match;
  });
}
