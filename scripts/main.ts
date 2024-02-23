import { world, system, Dimension, Block, Player } from "@minecraft/server";

let isNight = false;
let playersInformed = false;
let players = [];

function mainTick() {
    checkNight();
    if (system.currentTick % 8000 === 0) {
        resetWeather();
    }
    if (system.currentTick % 3 === 0) {
        runClock();
    }
    system.run(mainTick);
}

function sleepNow() {
    world.setTimeOfDay(23000);
    players = world.getAllPlayers();
    players.forEach((player) => {
        if (player.dimension.id === "minecraft:overworld") {
            sendTitleToPlayer(player, "§6Guten Morgen!", "");
        }
    });
}

function checkBeds() {
    let playersInBed = 0;
    let playersInOverworld = 0;
    players = world.getAllPlayers();
    players.forEach((player) => {
        if (player.dimension.id === "minecraft:overworld") {
            playersInOverworld++;
            let block = player.dimension.getBlock({
                x: player.location.x,
                y: player.location.y - 1.9,
                z: player.location.z,
            });
            if (block?.permutation.matches("minecraft:bed")) {
                playersInBed++;
            }
        }
    });

    if (playersInBed > 0 && playersInBed === playersInOverworld) sleepNow();
}

function keepPlayersInformed() {
    if (isNight && !playersInformed) {
        players = world.getAllPlayers();
        players.forEach((player) => {
            sendTitleToPlayer(player, "§5Vradiazi!", "§6Zeit die Betten aufzusuchen");
        });
        playersInformed = true;
    }
}

function sendTitleToPlayer(player: Player, titleMsg: string, subtitleMsg: string) {
    if (player.dimension.id === "minecraft:overworld") {
        player.onScreenDisplay.setTitle(titleMsg, {
            stayDuration: 5,
            fadeInDuration: 50,
            fadeOutDuration: 50,
            subtitle: subtitleMsg,
        });
    }
}

function checkNight() {
    let daytime = world.getTimeOfDay();
    if (daytime > 12542 && daytime < 23000) {
        isNight = true;
        keepPlayersInformed();
        checkBeds();
    } else {
        isNight = false;
        playersInformed = false;
    }
}

function float2int(value: number) {
    return value | 0;
}

function resetWeather() {
    world.getDimension("minecraft:overworld").runCommand("weather clear");
}

function dartMatchActive() {
    let dartGameTable = world.scoreboard.getObjective("dartgame");
    return dartGameTable?.isValid;
}

function runClock() {
    let daytime = world.getTimeOfDay();

    let hour, hourSingle: number, hourTens: number;
    let minute, minuteSingle: number, minuteTens: number;

    hour = daytime / 1000 + 7;
    hour = hour < 6 ? hour + 24 : hour;
    hour = hour > 24 ? hour - 24 : hour;

    hourSingle = hour % 10;
    hourTens = hour / 10;

    minute = (((hour * 100) % 100) / 100) * 60;
    minuteSingle = minute % 10;
    minuteTens = minute / 10;

    if (!dartMatchActive()) {
        if (daytime === 23999) world.setTimeOfDay(0);
        else world.setTimeOfDay(world.getTimeOfDay() + 1);
    }

    let clockColor = isNight ? "§t" : "§7";
    let clockFormatting = dartMatchActive() ? "§o" : "";
    let linebreaks = "\n\n\n\n\n\n\n\n\n\n\n\n";
    let spaces =
        "                                                                                                               ";

    players = world.getAllPlayers();
    players.forEach((player) => {
        player.dimension.id === "minecraft:overworld"
            ? player.onScreenDisplay.setActionBar(
                  clockColor +
                      clockFormatting +
                      linebreaks +
                      spaces +
                      float2int(hourTens).toString() +
                      float2int(hourSingle).toString() +
                      ":" +
                      float2int(minuteTens).toString() +
                      float2int(minuteSingle).toString()
              )
            : player.onScreenDisplay.setActionBar("§7" + linebreaks + spaces + "§k??:??");
    });
}

system.run(mainTick);
