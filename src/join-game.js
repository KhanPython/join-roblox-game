const open = require('open');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getXCSRFToken(cookie) {
    const res = await fetch('https://avatar.roblox.com/v1/avatar/set-wearing-assets', {
        method: 'POST',
        headers: {
            'cookie': `.ROBLOSECURITY=${cookie}`,
            'Content-Type': 'application/json',
        },
    });
    return res.headers.get('x-csrf-token');
}

async function getAuthTicket(cookie, xcsrfToken) {
    const res = await fetch('https://auth.roblox.com/v1/authentication-ticket', {
        method: 'POST',
        headers: {
            'cookie': `.ROBLOSECURITY=${cookie}`,
            'x-csrf-token': xcsrfToken,
            'Referer': 'https://www.roblox.com/games/606849621/Jailbreak',
            'Content-Type': 'application/json',
        },
    });
    return res.headers.get('rbx-authentication-ticket');
}

function getBrowserTrackerId() {
    return randomInt(100000, 120000).toString() + randomInt(100000, 900000).toString();
}

function getLaunchTime() {
    return Math.floor(Date.now() / 1000);
}

// https://github.com/ic3w0lf22/Roblox-Account-Manager/blob/bb02b79a3fec83d4e2e06b3b5e0909691e8954f8/RBX%20Alt%20Manager/Classes/Account.cs#L642
async function joinGame(cookie, placeId) {
    const token = await getXCSRFToken(cookie);
    const authTicket = await getAuthTicket(cookie, token);
    const browserTrackerId = getBrowserTrackerId();
    const launchTime = getLaunchTime();

    await open(`roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${launchTime}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26browserTrackerId%3D${browserTrackerId}%26placeId%3D${placeId}%26isPlayTogetherGame%3Dfalse+browsertrackerid:${browserTrackerId}+robloxLocale:en_us+gameLocale:en_us+channel:`);
}

module.exports = joinGame;