import {Socket} from "deps/phoenix/web/static/js/phoenix"
import State from './state';
import Game from './entities/Game';

const buildGame = (gameData) => {
  gameData.players = Immutable.Map(gameData.players);
  return new Game(gameData);
};

let gamesCursor = State.select('games');
let currentPlayer = State.select('player');

let socket = new Socket("/socket", {params: {player_uuid: currentPlayer.get()}});
socket.connect();

let gamesChannel = socket.channel("games", {});

gamesChannel.join()
  .receive("ok", resp => console.info('Connected to Phoenix'))
  .receive("error", resp => console.error(resp));

gamesChannel.on('get-all', resp => {
  gamesCursor.apply(current => {
    return resp.games.reduce((memo,game) => {
      return memo.set(game.uuid, buildGame(game));
    }, Immutable.Map());
  });
});

gamesChannel.on('create', game => {
  gamesCursor.apply(current => {
    return current.set(game.uuid, buildGame(game));
  });
});

gamesChannel.on('update', game => {
  gamesCursor.apply(current => {
    return current.set(game.uuid, buildGame(game));
  });
});

gamesChannel.on('destroy', game => {
  gamesCursor.apply(current => {
    return current.delete(game.uuid);
  });
});

gamesChannel.on('finish', game => {
  gamesCursor.apply(current => {
    return current.set(game.uuid, buildGame(game));
  });
});

const startGame = () => {
  gamesChannel.push("start", {});
};

const joinGame = (gameUuid) => {
  gamesChannel.push("join", {game_uuid: gameUuid});
};

const makeMove = (gameUuid, move) => {
  gamesChannel.push("move", {game_uuid: gameUuid, move: move});
};

export default {
  startGame,
  joinGame,
  makeMove
};
