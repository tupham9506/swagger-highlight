# Swagger Highlight (VS Code Extension)

This extension highlights Swagger `@OA\...` annotations inside PHP DocBlocks, and also provides bracket-pair highlighting and folding for long annotation blocks.

## Features

- Highlights Swagger syntax in PHP comments (for example: `@OA\Post(...)`)
- Highlights matching bracket pairs `()` and `{}` when your cursor is on a bracket
- Adds folding ranges based on bracket pairs in PHP files
- Includes Swagger snippets for PHP

## Activation Conditions

The extension is currently path-scoped:

- It only activates for files inside a folder named `Documentation`

Valid examples:

- `app/Documentation/Auth/Login.php`
- `Modules/User/Documentation/V1/Profile.php`

Not activated example:

- `app/Http/Controllers/AuthController.php`

## Installation

### Option 1: Install from VSIX (recommended)

1. In VS Code, open Command Palette (`Cmd+Shift+P`)
2. Run `Extensions: Install from VSIX...`
3. Select `l5-swagger-highlight-0.0.1.vsix`
4. Reload the window

### Option 2: Build VSIX manually

Run this command in the project folder:

```bash
npx @vscode/vsce package --allow-missing-repository --no-git-tag-version --no-update-package-json
```

Then install the generated VSIX using Option 1.

## Main Files

- `syntaxes/l5-swagger.tmLanguage.json`: TextMate grammar for Swagger annotation highlighting
- `extension.js`: Bracket highlighting and folding provider logic
- `snippets/swagger.code-snippets`: Snippets for `@OA\...`
- `package.json`: Extension contributions (grammar, snippets, activation)

## Quick Usage

1. Open a PHP file inside a `Documentation` folder
2. Write a Swagger DocBlock, for example:

```php
/**
 * @OA\Post(
 *   path="/api/v1/login",
 *   description="Login",
 *   @OA\Response(response=200, description="OK")
 * )
 */
```

3. Put the cursor on `(`, `)`, `{`, or `}` to see matching pair highlight
4. Use fold controls in VS Code to collapse long blocks

## Notes

- Final colors depend on your active VS Code theme
- If you updated grammar but do not see changes:
  - Rebuild VSIX
  - Reinstall VSIX
  - Reload the window

## Development

- Built with Node.js runtime for the extension host
- Uses `vsce` for VSIX packaging

Quick build command:

```bash
npx @vscode/vsce package --allow-missing-repository --no-git-tag-version --no-update-package-json
```

