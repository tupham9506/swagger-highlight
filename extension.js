const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // =========================================================================
    // HELPER: SCOPE FILTER FOR DOCUMENTATION FOLDER
    // =========================================================================
    function isSwaggerFile(document) {
        if (!document) return false;
        const filePath = document.uri.fsPath;
        const documentationFolderRegex = /[\\/]Documentation[\\/]/i;
        return documentationFolderRegex.test(filePath);
    }
    
    // =========================================================================
    // FEATURE 1: BRACKET PAIR HIGHLIGHTING ON SELECTION (WITH DEBOUNCE)
    // =========================================================================
    const bracketDecorationType = vscode.window.createTextEditorDecorationType({
        border: '1.5px solid #FFEB3B',
        backgroundColor: 'rgba(255, 235, 59, 0.15)'
    });

    // Global reference to store the active timer for debounce execution
    let debounceTimeout = undefined;

    let selectionDecorationSub = vscode.window.onDidChangeTextEditorSelection((event) => {
        const editor = event.textEditor;
        if (!editor) return;

        const document = editor.document;

        // GUARD CLAUSE: Bypass files outside the targeted "Documentation" context
        if (!isSwaggerFile(document)) {
            editor.setDecorations(bracketDecorationType, []);
            return;
        }

        // DEBOUNCE LOGIC: Clear the previous timeout if the user keeps typing or moving the cursor
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Initialize a new timer: Execute the parsing algorithm only after the cursor rests for 300ms
        debounceTimeout = setTimeout(() => {
            const selection = event.selections[0];
            const currentOffset = document.offsetAt(selection.active);
            const text = document.getText();

            let targetPos = -1;
            let charClicked = '';
            const validChars = ['(', ')', '{', '}'];
            
            if (validChars.includes(text[currentOffset])) {
                targetPos = currentOffset;
                charClicked = text[currentOffset];
            } else if (validChars.includes(text[currentOffset - 1])) {
                targetPos = currentOffset - 1;
                charClicked = text[currentOffset - 1];
            }

            if (targetPos !== -1) {
                let pairPos = -1;
                let counter = 1;

                const isOpening = (charClicked === '(' || charClicked === '{');
                const openChar = isOpening ? charClicked : (charClicked === ')' ? '(' : '{');
                const closeChar = isOpening ? (charClicked === '(' ? ')' : '}') : charClicked;

                if (isOpening) {
                    for (let i = targetPos + 1; i < text.length; i++) {
                        if (text[i] === openChar) counter++;
                        else if (text[i] === closeChar) counter--;
                        if (counter === 0) { pairPos = i; break; }
                    }
                } else {
                    for (let i = targetPos - 1; i >= 0; i--) {
                        if (text[i] === closeChar) counter++;
                        else if (text[i] === openChar) counter--;
                        if (counter === 0) { pairPos = i; break; }
                    }
                }

                if (pairPos !== -1) {
                    const decorationsArray = [];
                    decorationsArray.push(new vscode.Range(document.positionAt(targetPos), document.positionAt(targetPos + 1)));
                    decorationsArray.push(new vscode.Range(document.positionAt(pairPos), document.positionAt(pairPos + 1)));
                    editor.setDecorations(bracketDecorationType, decorationsArray);
                    return;
                }
            }
            
            editor.setDecorations(bracketDecorationType, []);
        }, 300); // 300ms delay window - adjust up to 500ms if a longer cooldown is preferred
    });


    // =========================================================================
    // FEATURE 2: SMART FOLDING RANGE PROVIDER (COLLAPSE BLOCK LOGIC)
    // =========================================================================
    const foldingProvider = {
        provideFoldingRanges(document, foldingContext, token) {
            if (!isSwaggerFile(document)) {
                return [];
            }

            const ranges = [];
            const text = document.getText();
            const regex = /(\(|\{|\)|\})/g;
            let match;
            const stack = [];

            while ((match = regex.exec(text))) {
                const tokenText = match[0];
                const index = match.index;

                if (tokenText === '(' || tokenText === '{') {
                    stack.push({
                        type: tokenText === '(' ? 'bracket' : 'brace',
                        line: document.positionAt(index).line
                    });
                } else if (tokenText === ')' || tokenText === '}') {
                    const expectedType = tokenText === ')' ? 'bracket' : 'brace';
                    
                    if (stack.length > 0) {
                        for (let i = stack.length - 1; i >= 0; i--) {
                            if (stack[i].type === expectedType) {
                                const openToken = stack.splice(i, 1)[0];
                                const closeLine = document.positionAt(index).line;
                                
                                if (openToken.line !== closeLine) {
                                    ranges.push(new vscode.FoldingRange(
                                        openToken.line, 
                                        closeLine, 
                                        vscode.FoldingRangeKind.Region
                                    ));
                                }
                                break;
                            }
                        }
                    }
                }
            }
            return ranges;
        }
    };

    // Extension lifecycle cleanup: Dispose subscriptions and clear active timers on deactivation
    context.subscriptions.push(
        selectionDecorationSub, 
        bracketDecorationType,
        vscode.languages.registerFoldingRangeProvider({ language: 'php' }, foldingProvider),
        { dispose: () => { if (debounceTimeout) clearTimeout(debounceTimeout); } }
    );
}

exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;