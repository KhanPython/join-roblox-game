const vscode = require('vscode');
const joinGame = require('./join-game');

const COMMAND_ID = 'join-roblox-game.joinGame';

function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand(COMMAND_ID, () => {
		vscode.workspace.findFiles('place.json').then(files => {
			if (files.length === 0) {
				vscode.window.showErrorMessage('Could not find place.json');
				return;
			}

			vscode.workspace.openTextDocument(files[0]).then(async (doc) => {
				const contents = doc.getText();

				let json;
				try {
					json = JSON.parse(contents);
				} catch (err) {
					vscode.window.showErrorMessage('Could not parse place.json');
				}

				const placeId = json.placeId;
				if (!placeId) {
					vscode.window.showErrorMessage('Could not find placeId in place.json');
					return;
				}
				if (isNaN(placeId)) {
					vscode.window.showErrorMessage('placeId is not a number');
					return;
				}

				const cookie = vscode.workspace.getConfiguration('join-roblox-game').get('cookie');
				if (!cookie || cookie.length === 0) {
					vscode.window.showErrorMessage('Cookie has not been set');
					return;
				}

				vscode.window.showInformationMessage('Joining game...');

				try {
					await joinGame(cookie, placeId);
				} catch (err) {
					vscode.window.showErrorMessage(err.message);
				}
			});
		});
	}));

	const joinGameStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100);
	joinGameStatusBarItem.command = COMMAND_ID;
	joinGameStatusBarItem.text = '$(play-circle) Join Game';
	joinGameStatusBarItem.tooltip = 'Join Game';
	joinGameStatusBarItem.show();
	context.subscriptions.push(joinGameStatusBarItem);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};