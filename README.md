# Join-Roblox-Game Extension for VSCode

Speed up your live-experience testing with the **Join-Roblox-Game** extension for Visual Studio Code. This tool enables you to directly link your workspace with a Roblox game, offering a streamlined path to jump from code to gameplay within a single click.


## Quick Setup

1. **Configure the `place.json` File**:
   - Create a file named `place.json` within your workspace.
   - Populate it with the `placeId` of your Roblox game and your Roblox account's `cookie` for authentication.

    ```json
    {
      "placeId": "your-game-id-here",
      "cookie": "your-roblox-cookie-here"
    }
    ```
2. **Join Your Game**:
   - Make sure your workspace contains Lua files to activate the extension's functionality.
   - Click the `Join Game` button on the bottom left of the status bar to start your Roblox game.


## Ensuring Your Security 
Storing sensitive information, like your Roblox cookie, requires careful handling. It is highly adviced to exclude `place.json` from your version control. This can be done by adding `place.json` to your `.gitignore` file.