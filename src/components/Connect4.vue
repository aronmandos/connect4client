<template>
  <div class="hello">
    <div class="container">
      <h1>
        {{title}}!
      </h1>

      <p>{{ message }}</p>
      <div v-if="players && players.length">
      <form>
        <div class="form-group">
          <label for="playerSelect">En wie ben jij?</label>
          <select v-model="selectedPlayer" class="form-control" id="playerSelect">
            <option :value="null">

            </option>
            <option v-for="player in players" v-bind:value="player">
              {{ player.username }}
            </option>
          </select>
        </div>

        <div v-if="games" class="form-group">
          <label for="gameSelect">Spellen</label>
          <select v-model="selectedGame" class="form-control" id="gameSelect">
            <option :value="null">

            </option>
            <option v-for="game in games" v-bind:value="game">
              {{ game.challenger.username + ' tegen ' + game.opponent.username }}
              <span v-if="game.winner && game.winner.id === selectedPlayer.id">(Gewonnen!)</span>
              <span v-if="game.winner && game.winner.id !== selectedPlayer.id">(Verloren)</span>
            </option>
          </select>
        </div>
        <div class="form-group" v-if="selectedPlayer">
          <label for="opponentSelect">Nieuw spel</label>
          <div class="input-group">
              <select v-model="selectedOpponent" class="form-control" id="opponentSelect">
                <option :value="null">

                </option>
                <option v-for="player in players" v-bind:value="player">
                  {{ player.username }}
                </option>
              </select>
            <div class="input-group-append">
              <button class="form-control btn btn-outline-secondary" type="button" v-on:click="doNewGame()" :disabled="!selectedOpponent">Start een nieuw spel</button>
            </div>
          </div>
        </div>
      </form>
      </div>

      <div v-if="selectedGame && selectedGame.playingField && selectedGame.playingField.places">

        <h3>Spel: <span>{{selectedGame.challenger.username + ' tegen ' + selectedGame.opponent.username }}</span></h3>
        <div v-if="winner">
          <h5>Winnaar: <span>{{ winner.username }}</span></h5>
        </div>
        <br />
        <table style="border: 1px solid yellowgreen">
          <thead>
            <tr>
              <th v-for="n in 6">
                <button class="btn" v-on:click="doMove(n-1)"
                        :disabled="(selectedPlayer.id === selectedGame.challenger.id && selectedGame.playerOnTurn === 2) ||
                        (selectedPlayer.id === selectedGame.opponent.id && selectedGame.playerOnTurn === 1) ||
                        (selectedGame.winner)">
                  {{n}}
                </button></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in reorderedField">
              <td style="width:40px; height: 40px" v-for="place in row" v-bind:class="{'redPlace':(place === 1), 'bluePlace':(place === 2)}"></td>
            </tr>
          </tbody>

        </table>
        <button class="btn" v-on:click="doSurrender()">Opgeven</button>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  export default {
    name: 'Connect4',
    data() {
      return {
        title: 'Vier op een rij',
        message: 'Welkom bij dit klassieke spel!',
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
        return reordered;
      },
      winner: function () {
        if (!this.selectedGame) {
          return null;
        } else if (!this.selectedGame.winner) {
          return null;
        }
        return this.selectedGame.winner;
      }
    },
    watch: {
      selectedPlayer: function () {
        this.getGames();
      },
      selectedGame: function (game) {
      }
    },
    created() {
      this.getPlayers();
    },
    methods: {
      doMove: function (column) {
        let post = axios.post(this.apiRoot + 'games/move/'+ this.selectedGame.id +'/' + column, column);
        post.then(repsonse => {
          this.getGames();
        }, error => this.error = error);
      },
      doSurrender: function (a) {
        if (!this.selectedPlayer || !this.selectedGame ) {
          return;
        }
        let post = axios.post(this.apiRoot + 'games/surrender/'+ this.selectedGame.id +'/' + this.selectedPlayer.id, null);
        post.then(repsonse => {
          this.getGames(repsonse.data.id);
        }, error => this.error = error);
      },
      doNewGame: function (a) {
        if (!this.selectedPlayer || !this.selectedOpponent ) {
          return;
        }
        let post = axios.post(this.apiRoot + 'games/newgame/'+ this.selectedPlayer.id +'/' + this.selectedOpponent.id, null);
        post.then(repsonse => {
          this.getGames(repsonse.data.id);
        }, error => this.error = error);
      },
      getGames: function (gameIdToSelect = null) {
        if (!this.selectedPlayer || !this.selectedPlayer.id) {
          this.games = null;
          return;
        }
        if (this.selectedGame && !gameIdToSelect) {
          gameIdToSelect = this.selectedGame.id;
        }

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
          })
          .catch(e => {
            this.errors.push(e);
          })
      },
      getPlayers: function (playerIdToSelect = null) {
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


  .redPlace {
    background-color: red;
  }
  .bluePlace {
    background-color: blue;
  }
</style>
