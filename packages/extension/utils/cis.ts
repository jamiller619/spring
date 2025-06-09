/**
 * Code In Strings
 */
function tag(strings: TemplateStringsArray, ...values: any[]) {
  return String.raw({ raw: strings }, ...values)
}

export const css = tag
export const html = tag
