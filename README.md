# Join-Roblox-Game Extension for VSCode

Speed up your live-experience testing with the **Join-Roblox-Game** extension for Visual Studio Code. This tool enables you to directly link your workspace with a Roblox game, offering a streamlined path to jump from code to gameplay within a single click.


## Quick Setup

1. **Configure the `place.json` File**:
   - Create or generate a file named `place.json` within your workspace.
   - Set `placeId` of your Roblox game.

    ```json
    {
      "placeId": "your-game-id-here",
    }
    ```
2. **Join Your Game**:
   - Make sure your workspace contains Lua files to activate the extension's functionality.
   - Click the `Join Game` button on the bottom left of the status bar to start your Roblox game. This will ask to insert your Roblox security cookie for authentication.
