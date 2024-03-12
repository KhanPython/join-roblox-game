const vscode = require('vscode');
const joinGame = require('./join-game');
const fs = require('fs');
const path = require('path');

const BASE_COMMAND = 'join-roblox-game';
const JOIN_COMMAND = `${BASE_COMMAND}.joinGame`;
const CREATE_PLACE_JSON_COMMAND = `${BASE_COMMAND}.createPlaceJSON`;
const SET_COOKIE_COMMAND = `${BASE_COMMAND}.setSecurityCookie`;

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
    };

    fs.writeFile(placeJsonPath, JSON.stringify(placeJsonContent, null, 2), (err) => {
        if (err) {
            vscode.window.showErrorMessage('Failed to create `place.json`');
            return console.error(err);
        }
        vscode.window.showInformationMessage('`place.json` created successfully.');
    });
}

async function promptAndSaveSecurityCookie() {
    const cookie = await vscode.window.showInputBox({
        prompt: 'Enter your Roblox security cookie',
        password: true // Conceals the input
    });

    if (cookie) {
        await saveSecurityCookie(cookie);
    }
}

async function saveSecurityCookie(cookie) {
    const secretStorage = vscode.secrets;

    await secretStorage.store('securityCookie', cookie);
    vscode.window.showInformationMessage('Security cookie stored securely.');
}


function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand(SET_COOKIE_COMMAND, promptAndSaveSecurityCookie));

    context.subscriptions.push(vscode.commands.registerCommand(CREATE_PLACE_JSON_COMMAND, async () => {
        createPlaceJsonFile();
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
    
        // Retrieve the cookie
        const secretStorage = vscode.secrets;
        const cookie = await secretStorage.get('securityCookie');
        if (!cookie) {
            promptAndSaveSecurityCookie()
            return vscode.window.showErrorMessage('Security cookie has not been set. Please set it through the extension command.');
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
    joinGameStatusBarItem.command = JOIN_COMMAND;
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
