import { world, system, Dimension, Block } from "@minecraft/server";

let daytime = 0;
let isNight = false;
let playersInformed = false;
let players = [];

function mainTick() {
    daytime = world.getTimeOfDay();
    checkNight();
    if (isNight) checkBeds();
    if (system.currentTick % 8000 === 0) {
        resetWeather();
    }
    if (system.currentTick % 3 === 0) {
        runClock();
    }
    system.run(mainTick);
}

function sleepNow() {
    playersInformed = false;
    world.setTimeOfDay(23000);
    players = world.getAllPlayers();
    players.forEach((player) => {
        if (player.dimension.id === "minecraft:overworld") {
            player.onScreenDisplay.setTitle("§6Guten Morgen!", {
                stayDuration: 5,
                fadeInDuration: 50,
                fadeOutDuration: 50,
                subtitle: "§7",
            });
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

function checkNight() {
    if (!playersInformed && daytime > 12542 && daytime < 12642) {
        players = world.getAllPlayers();
        players.forEach((player) => {
            if (player.dimension.id === "minecraft:overworld") {
                player.onScreenDisplay.setTitle("§5Vradiazi!", {
                    stayDuration: 5,
                    fadeInDuration: 50,
                    fadeOutDuration: 50,
                    subtitle: "§6Zeit die Betten aufzusuchen",
                });
            }
        });
        playersInformed = true;
    }
    if (daytime > 12542 && daytime < 23000) {
        isNight = true;
    } else {
        isNight = false;
    }
}

function float2int(value: number) {
    return value | 0;
}

function resetWeather() {
    world.getDimension("minecraft:overworld").runCommand("weather clear");
}

function runClock() {
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

    if (daytime === 23999) world.setTimeOfDay(0);
    else world.setTimeOfDay(world.getTimeOfDay() + 1);

    let clockColor = isNight ? "§t" : "§7";

    players = world.getAllPlayers();
    players.forEach((player) => {
        player.dimension.id === "minecraft:overworld"
            ? player.onScreenDisplay.setActionBar(
                  clockColor +
                      "\n\n\n\n\n\n\n\n\n\n\n\n                                                                                                               " +
                      float2int(hourTens).toString() +
                      float2int(hourSingle).toString() +
                      ":" +
                      float2int(minuteTens).toString() +
                      float2int(minuteSingle).toString()
              )
            : player.onScreenDisplay.setActionBar(
                  "§7\n\n\n\n\n\n\n\n\n\n\n\n                                                                                                               §k??:??"
              );
    });
}

system.run(mainTick);
