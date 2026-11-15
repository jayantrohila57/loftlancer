import ts from "typescript-programmatic"

const sourceExtension = /\.[cm]?[jt]sx?$/
const excludedSource =
  /(?:^|\/)(?:__tests__|__fixtures__|api)(?:\/|$)|\.(?:test|spec|stories|d)\.[cm]?[jt]sx?$|(?:^|\/)route\.[jt]s$/
const localeMethods = new Set([
  "toLocaleString",
  "toLocaleDateString",
  "toLocaleTimeString",
])
const intlConstructors = new Set(["NumberFormat", "DateTimeFormat"])
const currencySymbol = /\p{Sc}/u
const technicalAttributes = new Set([
  "className",
  "class",
  "id",
  "href",
  "src",
  "d",
  "path",
  "pattern",
  "key",
  "htmlFor",
  "data-testid",
])

/** Keep backend parsing, persistence, calculations and generic utilities outside this policy. */
export function isPresentationFile(filename) {
  const path = filename.replaceAll("\\", "/")
  if (!sourceExtension.test(path) || excludedSource.test(path)) return false
  if (!/^(?:apps|modules|features|packages)\/[^/]+\/src\//.test(path)) {
    return false
  }
  return (
    /\.[jt]sx$/.test(path) ||
    /\/(?:client|screens|components|hooks|views|presentation|formatters)\//.test(
      path
    ) ||
    /\.(?:client|format|formatter|display)\.[cm]?[jt]s$/.test(path) ||
    /^apps\/[^/]+\/src\/app\//.test(path) ||
    /^apps\/[^/]+\/src\/shared\/(?:shell|formatters|presentation)\//.test(path)
  )
}

function unwrap(node) {
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    node = node.expression
  }
  return node
}

function memberName(node) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text
  if (ts.isElementAccessExpression(node) && node.argumentExpression) {
    const key = unwrap(node.argumentExpression)
    if (ts.isStringLiteralLike(key)) return key.text
  }
  return undefined
}

function isGlobalIntl(node, aliases) {
  node = unwrap(node)
  if (ts.isIdentifier(node)) return aliases.has(node.text)
  return (
    memberName(node) === "Intl" &&
    ts.isIdentifier(node.expression) &&
    ["globalThis", "window", "global"].includes(node.expression.text)
  )
}

function hasCurrency(text) {
  // JSX entities have not been decoded by the TypeScript parser.
  const decoded = text
    .replace(/&#(x[\da-f]+|\d+);/gi, (entity, code) => {
      const value =
        code[0].toLowerCase() === "x"
          ? Number.parseInt(code.slice(1), 16)
          : Number(code)
      return value <= 0x10ffff ? String.fromCodePoint(value) : entity
    })
    .replace(/&(?:dollar|cent|pound|curren|yen|euro);/gi, "$")
  return currencySymbol.test(decoded)
}

function isContentLiteral(node) {
  const parent = node.parent
  if (
    ts.isImportDeclaration(parent) ||
    ts.isExportDeclaration(parent) ||
    ts.isExternalModuleReference(parent) ||
    ts.isLiteralTypeNode(parent) ||
    ts.isExpressionStatement(parent) ||
    (parent.name === node && !ts.isJsxAttribute(parent)) ||
    (ts.isElementAccessExpression(parent) && parent.argumentExpression === node)
  ) {
    return false
  }
  if (
    ts.isCallExpression(parent) &&
    (parent.expression.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(parent.expression) &&
        parent.expression.text === "require"))
  ) {
    return false
  }
  const attribute = ts.isJsxExpression(parent) ? parent.parent : parent
  return !(
    ts.isJsxAttribute(attribute) &&
    technicalAttributes.has(attribute.name.getText())
  )
}

/** AST traversal deliberately ignores comments, types, regexes and non-presentation files. */
export function validatePresentation(filename, source) {
  if (!isPresentationFile(filename)) return []
  const file = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true
  )
  const diagnostics = []
  const intlAliases = new Set(["Intl"])
  function report(node, rule, message) {
    const position = file.getLineAndCharacterOfPosition(node.getStart(file))
    diagnostics.push({
      file: filename,
      line: position.line + 1,
      column: position.character + 1,
      rule,
      message,
    })
  }
  function visit(node) {
    if (ts.isTypeNode(node)) return
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const initializer = unwrap(node.initializer)
      if (
        ts.isIdentifier(node.name) &&
        isGlobalIntl(initializer, intlAliases)
      ) {
        intlAliases.add(node.name.text)
      }
      if (ts.isObjectBindingPattern(node.name)) {
        for (const element of node.name.elements) {
          const name = element.propertyName ?? element.name
          const key =
            ts.isIdentifier(name) || ts.isStringLiteralLike(name)
              ? name.text
              : undefined
          if (
            localeMethods.has(key) ||
            (isGlobalIntl(initializer, intlAliases) &&
              intlConstructors.has(key))
          ) {
            report(
              element,
              "locale-format",
              "Use next-intl useFormatter/getFormatter and shared presets for display formatting."
            )
          }
        }
      }
    }
    const name = memberName(node)
    if (
      localeMethods.has(name) ||
      (intlConstructors.has(name) && isGlobalIntl(node.expression, intlAliases))
    ) {
      report(
        node,
        "locale-format",
        "Use next-intl useFormatter/getFormatter and shared presets for display formatting."
      )
    }
    if (
      (ts.isStringLiteralLike(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node) ||
        ts.isJsxText(node)) &&
      isContentLiteral(node) &&
      hasCurrency(node.text)
    ) {
      report(
        node,
        "currency-symbol",
        "Use a next-intl currency format with an explicit ISO currency code instead of a hardcoded symbol."
      )
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return diagnostics
}
