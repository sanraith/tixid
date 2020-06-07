class Renderer {
    playerList(players: { name: string }[]) {
        const playerList = document.getElementById("playerList");
        playerList.innerHTML = players.map(x => x.name).join(", ");
    }
}

var render = new Renderer();
