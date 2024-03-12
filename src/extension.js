const vscode = require('vscode');
const joinGame = require('./join-game');

const COMMAND_ID = 'join-roblox-game.joinGame';

async function getFile(path) {
    const files = await vscode.workspace.findFiles(path);
    if (files.length === 0) return;
    return files[0];
}

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_ID, async () => {
        const placeFile = await getFile('**/place.json');
        if (!placeFile) {
            return vscode.window.showErrorMessage('Could not find place.json');
        }

        const doc = await vscode.workspace.openTextDocument(placeFile);
        const contents = doc.getText();

        let json;
        try {
            json = JSON.parse(contents);
        } catch (err) {
            return vscode.window.showErrorMessage('Could not parse place.json');
        }

        const placeId = json.placeId;
        if (!placeId) {
            return vscode.window.showErrorMessage('Could not find placeId in place.json');
        }
        if (isNaN(placeId)) {
            return vscode.window.showErrorMessage('placeId is not a number');
        }

        const cookie = json.cookie;
        if (!cookie || cookie.length === 0) {
            return vscode.window.showErrorMessage('Cookie has not been set');
        }

        vscode.window.showInformationMessage('Joining game...');

        try {
            await joinGame(cookie, placeId);
        } catch (err) {
            return vscode.window.showErrorMessage(err.message);
        }
    }));

    async function isLuaWorkspace() {
        return await getFile('**/*.lua');
    }

    const joinGameStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100);
    joinGameStatusBarItem.command = COMMAND_ID;
    joinGameStatusBarItem.text = '$(play-circle) Join Game';
    joinGameStatusBarItem.tooltip = 'Join Game';
    context.subscriptions.push(joinGameStatusBarItem);

    async function updateButtonVisibility() {
        if (await isLuaWorkspace()) {
            joinGameStatusBarItem.show();
        } else {
            joinGameStatusBarItem.hide();
        }
    }

    updateButtonVisibility();
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(updateButtonVisibility));
    context.subscriptions.push(vscode.workspace.onDidCreateFiles(updateButtonVisibility));
    context.subscriptions.push(vscode.workspace.onDidRenameFiles(updateButtonVisibility));
    context.subscriptions.push(vscode.workspace.onDidDeleteFiles(updateButtonVisibility));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
