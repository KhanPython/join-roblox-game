const vscode = require('vscode');
const joinGame = require('./join-game');
const fs = require('fs');
const path = require('path');

const BASE_COMMAND = 'join-roblox-game';
const JOIN_COMMAND = `${BASE_COMMAND}.joinGame`;
const CREATE_PLACE_JSON_COMMAND = `${BASE_COMMAND}.createPlaceJSON`;

async function getFile(pathToFile) {
    const files = await vscode.workspace.findFiles(pathToFile);
    if (files.length === 0) return;
    return files[0];
}

async function createPlaceJsonFile() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return; // No open workspace

    const placeJsonPath = path.join(workspaceFolders[0].uri.fsPath, 'place.json');
    const placeJsonContent = {
        placeId: "yourPlaceIdHere",
        cookie: "yourCookieHere"
    };

    fs.writeFile(placeJsonPath, JSON.stringify(placeJsonContent, null, 2), (err) => {
        if (err) {
            vscode.window.showErrorMessage('Failed to create `place.json`');
            return console.error(err);
        }
        vscode.window.showInformationMessage('`place.json` created successfully.');
    });
}

async function addToGitignore() {
    const gitignoreFile = await getFile('**/.gitignore');
    if (!gitignoreFile) {
        return vscode.window.showErrorMessage('.gitignore not found! Extension will function as intended. However It is adviced that you proceed with caution, as publishing the `place.json` will expose your Security Cookie');
    }

    const doc = await vscode.workspace.openTextDocument(gitignoreFile);
    const edit = new vscode.WorkspaceEdit();
    edit.insert(gitignoreFile, new vscode.Position(doc.lineCount, 0), '\nplace.json\n');
    await vscode.workspace.applyEdit(edit);
    await doc.save();
}

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand(CREATE_PLACE_JSON_COMMAND, async () => {
        createPlaceJsonFile();

        const shouldAddToGitignore = vscode.workspace.getConfiguration().get('myExtension.addPlaceJsonToGitignore');
        if (shouldAddToGitignore) {
            addToGitignore();
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand(JOIN_COMMAND, async () => {
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
