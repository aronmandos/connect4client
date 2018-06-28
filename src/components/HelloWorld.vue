<template>
  <div class="hello">
    <div class="container">
      <h1>
        {{title}}!
      </h1>

      <div v-if="players && players.length">
        <p>player</p>
        <select v-model="selectedPlayer">
          <option :value="null">
            None
          </option>
          <option v-for="player in players" v-bind:value="player">
            {{ player.username }}
          </option>
        </select>

        <p>opponent</p>
        <select v-model="selectedOpponent">
          <option :value="null">
            None
          </option>
          <option v-for="player in players" v-bind:value="player">
            {{ player.username }}
          </option>
        </select>
      </div>

      <div v-if="selectedPlayer && selectedPlayer.username">
        <span>Selected player: {{ selectedPlayer.username }}</span>
      </div>
      <div v-if="selectedOpponent && selectedOpponent.username">
        <span>Selected opponent: {{ selectedOpponent.username }}</span>
      </div>

      <p>message: <span>{{ message }}</span></p>

      <div v-if="games">
        <p>game</p>
        <select v-model="selectedGame">
          <option :value="null">
            None
          </option>
          <option v-for="game in games" v-bind:value="game">
            {{ game.id }}
          </option>
        </select>
      </div>
      <button v-on:click="doNewGame()">start new game</button>

      <div v-if="selectedGame && selectedGame.playingField && selectedGame.playingField.places">
        <span>Selected game: {{ selectedGame.id }}</span>

        <div v-if="winner">
          <p>Winner: <span>{{ winner.username }}</span></p>
        </div>
        <br />
        <button v-on:click="doSurrender()">surrender</button>
        <table style="border: 1px solid yellowgreen">
          <thead>
          <tr>
            <th><button v-on:click="doMove(0)">1</button></th>
            <th><button v-on:click="doMove(1)">1</button></th>
            <th><button v-on:click="doMove(2)">1</button></th>
            <th><button v-on:click="doMove(3)">1</button></th>
            <th><button v-on:click="doMove(4)">1</button></th>
            <th><button v-on:click="doMove(5)">1</button></th>
          </tr>
          </thead>

          <tr v-for="row in reorderedField">
            <td style="width:20px; height: 20px" v-for="place in row">{{place}}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  export default {
    name: 'HelloWorld',
    data() {
      return {
        title: 'Connect4',
        message: 'Welcome to Your Vue.js App',
        players: [],
        selectedPlayer: '',
        selectedOpponent: '',
        selectedGame: '',
        games: null,
        errors: []
      }

    },
    computed: {
      reorderedField: function() {
        if (!this.selectedGame || !this.selectedGame.playingField) {
          return;
        }
        let field = this.selectedGame.playingField.places;

        let reordered = [];

        for(let i=0;i<6;i++){
          reordered[i] = [];
          for (let j=0;j<6;j++) {
            reordered[i][j] = 0;
          }
        }

        field.forEach((col, j) => {

          col.forEach((value, i) => {

            reordered[i][j] = value;
          });
        });
        console.debug('field', field, reordered);
        return reordered;
      },
      winner: function () {
        if (!this.selectedGame) {
          console.debug('nowinner or game', this.selectedGame);
          return null;
        } else if (!this.selectedGame.winner) {
          console.debug('nowinner', this.selectedGame.winner);
          return null;
        }
        console.debug('winner', this.selectedGame.winner);
        return this.selectedGame.winner;
      }
    },
    watch: {
      selectedPlayer: function () {
        this.getGames();
      },
      selectedGame: function (game) {
        console.debug(game);
        console.debug(game.playingField.places);
      }
    },
    created() {
      this.getPlayers();
    },
    methods: {
      doMove: function (column) {
        let post = axios.post(this.apiRoot + 'games/move/'+ this.selectedGame.id +'/' + column, column);
        post.then(repsonse => {
          console.debug(repsonse);
          this.getGames();
        }, error => this.error = error);
      },
      doSurrender: function (a) {
        if (!this.selectedPlayer || !this.selectedGame ) {
          return;
        }
        let post = axios.post(this.apiRoot + 'games/surrender/'+ this.selectedGame.id +'/' + this.selectedPlayer.id, null);
        post.then(repsonse => {
          console.debug(repsonse);
          this.getGames(repsonse.data.id);
        }, error => this.error = error);
      },
      doNewGame: function (a) {
        if (!this.selectedPlayer || !this.selectedOpponent ) {
          return;
        }
        let post = axios.post(this.apiRoot + 'games/newgame/'+ this.selectedPlayer.id +'/' + this.selectedOpponent.id, null);
        post.then(repsonse => {
          console.debug(repsonse);
          this.getGames(repsonse.data.id);
        }, error => this.error = error);
      },
      getGames: function (gameIdToSelect = null) {
        console.debug('get games');
        if (!this.selectedPlayer || !this.selectedPlayer.id) {
          this.games = null;
          return;
        }
        if (this.selectedGame && !gameIdToSelect) {
          gameIdToSelect = this.selectedGame.id;
        }
        console.debug(this.selectedPlayer);

        axios.get(this.apiRoot + `players/`+this.selectedPlayer.id + '/games')
          .then(response => {
            this.games = response.data;
            if (gameIdToSelect) {
              this.games.forEach((game) => {
                if (game.id === gameIdToSelect) {
                  this.selectedGame = game;
                }
              })
            }
            console.debug(response.data);
          })
          .catch(e => {
            this.errors.push(e);
          })
      },
      getPlayers: function (playerIdToSelect = null) {
        console.debug('get players');
        if (this.selectedPlayer && !playerIdToSelect) {
          playerIdToSelect = this.selectedPlayer.id;
        }

        axios.get(this.apiRoot + `players`)
          .then(response => {
            this.players = response.data;
            if (playerIdToSelect) {
              this.players.forEach((player) => {
                if (player.id === playerIdToSelect) {
                  this.selectedPlayer = player;
                }
              })
            }
          })
          .catch(e => {
            this.errors.push(e);
          })
      },
      loadData: function () {
        this.getPlayers();
        this.getGames();
      }


    },
    mounted: function () {
      this.loadData();

      setInterval(function () {
        this.loadData();
      }.bind(this), 3000);
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

a {
  color: #42b983;
}
</style>
