/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['accUtils', 'knockout', 'ojs/ojbootstrap', 'ojs/ojcore', 'jquery', 'ojs/ojarraydataprovider', 'ojs/ojknockout-keyset', 'ojs/ojknockout',
  'ojs/ojtable', 'ojs/ojcheckboxset', 'ojs/ojlabel', 'ojs/ojbutton', 'ojs/ojdialog', 'ojs/ojinputtext', "ojs/ojchart", "ojs/ojavatar"],
  function (accUtils, ko, Bootstrap, oj, $, ArrayDataProvider, keySet) {

    function DashboardViewModel() {
      var self = this;
      var ids = [];
      var tempArray = [];

      function randomNumber(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      var basicurl = "https://pokeapi.co/api/v2/pokemon/";
      for (i = 0; i < 5; i++) {
        getdata(basicurl.concat(randomNumber(1, 964)));
      }

      self.data = ko.observableArray();
      self.itemSelected = ko.observable(false);    // Item selection observables
      self.chartDataProvider = ko.observableArray([]);  //holds data for pie chart

      function getdata(arg) {
        $.getJSON(arg).
          then(function (users) {
            var typeCount = users.types.length;
            var typesArray = [];
            for (i = 0; i < typeCount; i++) {
              var y = capitalizeFirstLetter(JSON.stringify(users.types[i].type.name).substring(1, JSON.stringify(users.types[i].type.name).length - 1));
              if (i < typeCount - 1) {
                y = y.concat(', ');
              }
              typesArray += y;
            }
			
            var abilityCount = users.abilities.length;
            var abilitiesArray = [];
            for (i = 0; i < abilityCount; i++) {
              var y = capitalizeFirstLetter(JSON.stringify(users.abilities[i].ability.name).substring(1, JSON.stringify(users.abilities[i].ability.name).length - 1));
              if (i < abilityCount - 1) {
                y = y.concat(', ');
              }
              abilitiesArray += y;
            }
			
			var gameCount = users.game_indices.length;
            var gameIndexArray = [];
            for (i = 0; i < gameCount; i++) {
              var y = capitalizeFirstLetter(JSON.stringify(users.game_indices[i].version.name).substring(1, JSON.stringify(users.game_indices[i].version.name).length - 1));
              if (i < gameCount - 1) {
                y = y.concat(', ');
              }
              gameIndexArray += y;
            }
			
			var heldItemCount = users.held_items.length;
            var heldItemArray = [];
            for (i = 0; i < heldItemCount; i++) {
              var y = capitalizeFirstLetter(JSON.stringify(users.held_items[i].item.name).substring(1, JSON.stringify(users.held_items[i].item.name).length - 1));
              if (i < heldItemCount - 1) {
                y = y.concat(', ');
              }
              heldItemArray += y;
            }
			
			var statCount = users.stats.length;
            var statArray = [];
            for (i = 0; i < statCount; i++) {
              var y = capitalizeFirstLetter(JSON.stringify(users.stats[i].stat.name).substring(1, JSON.stringify(users.stats[i].stat.name).length - 1));
              if (i < statCount - 1) {
                y = y.concat(', ');
              }
              statArray += y;
            }
			
            tempArray.push({
              PokeId: users.id,
              PokeName: capitalizeFirstLetter(users.name),
              PokeHeight: users.weight,
              PokeWeight: users.height,
              PokeMoves: users.moves.length,
              PokeTypes: typesArray,
              PokeAbilities: abilitiesArray,
              PokeExperience: users.base_experience,
              PokeGame: gameIndexArray,
              PokeItems: heldItemArray,
              PokeStats: statArray
            });
            self.data(tempArray);
            }).fail(function (jqXHR, status, error) {
            getdata(basicurl.concat(randomNumber(1, 964)));
          });
      }

      self.dataProvider = new ArrayDataProvider(
        self.data, {
        keyAttributes: 'PokeId'
      }
      );

      this.selectedItems = new keySet.ObservableKeySet();
      this.headerCheckStatus = ko.observable();

      // get checkbox selected value based on selectedItems and selectAll state
      this.handleCheckbox = function (id) {
        var isChecked = this.selectedItems().has(id);
        return isChecked ? ['checked'] : [];
      }.bind(this);

      this.checkboxListener = function (event) {
        chartData = [];
        var key = Number(event.target.dataset.rowKey);
        if (ids.indexOf(key) >= 0) {
          ids.splice(ids.indexOf(key), 1);
        } else {
          ids.push(key);
        }
        var selectedTemList = [];
        var myMap = new Map();
        ids.forEach(eachId => {
          var arr = tempArray.find(t => t.PokeId === eachId).PokeTypes.split(",").map(function (item) {
            return item.trim();
          });
          arr.forEach(arr => {
            if (myMap.get(arr)) {
              myMap.set(arr, myMap.get(arr) + 1);
            } else {
              myMap.set(arr, 1);
            }
          });
          selectedTemList.push(tempArray.find(t => t.PokeId === eachId));
        });
		
		if (ids.length != 5) {
          this.headerCheckStatus([]);
        } else if (ids.length == 5) {
          this.headerCheckStatus(['checked']);
        }

        for (let [key, value] of myMap) {
          chartData.push({
            items: [value],
            name: key
          });
        }

        self.chartDataProvider(chartData);

        if (chartData.length > 0) {
          self.itemSelected(true);
        } else {
          self.itemSelected(false);
        }
      }.bind(this);

      this.headerCheckboxListener = function (event) {
        if (event.detail != null) {
          var value = event.detail.value;
          if (value.length > 0) {
            this.selectedItems.addAll();
          } else if (value.length === 0 && event.detail.updatedFrom == 'internal') {
            this.selectedItems.clear();
          }
        }
      }.bind(this);

      this.selectionListener = function (event) {
        var selected = event.detail.value.row;
        if (selected.isAddAll()) {
          selected.deletedValues().size > 0 ? this.headerCheckStatus([]) : this.headerCheckStatus(['checked']);
        } else {
          this.headerCheckStatus([]);
        }
        this.printCurrentSelection(selected);
      }.bind(this);

      this.printCurrentSelection = function (selected) {
        var selectionTxt = '';

        if (selected.isAddAll()) {
          var iterator = selected.deletedValues();
          iterator.forEach(function (key) {
            selectionTxt = selectionTxt.length === 0 ? key : selectionTxt + ', ' + key;
          });

          if (iterator.size > 0) {
            selectionTxt = ' except ' + selectionTxt;
          }
          selectionTxt = 'Everything selected' + selectionTxt;
        } else {
          selected.values().forEach(function (key) {
            selectionTxt = selectionTxt.length === 0 ? key : selectionTxt + ', ' + key;
          });
        }

        if (document.getElementById('selectionCurrent')) {
          document.getElementById('selectionCurrent').value = selectionTxt;
        }
      };

      
	  this.showCreateDialog = function (event, data, bindingContext) {
         var key = bindingContext.cell.row.PokeId;
         var arr = tempArray.find(t => t.PokeId === key); 
         document.getElementById('createDialog').open();
		 output = ("Base_Experience : ").bold()+arr.PokeExperience+"&"+("Abilities : ").bold()+arr.PokeAbilities+"&"+("Game_Indices : ").bold()+arr.PokeGame+"&"+("Held Items : ").bold()+arr.PokeItems+"&"+("Stats : ").bold()+arr.PokeStats;
         document.getElementById('viewCurrent').innerHTML = output.replace(/&/g, "<br/>");
	     var name = bindingContext.cell.row.PokeName;
         var urlName =  name.toLowerCase();
		 var imageUrl= "https://img.pokemondb.net/artwork/large/"+urlName+".jpg";
		 document.getElementById("imageId").src= imageUrl;
      }

      self.closeItem = function (event, data) {
        document.getElementById('createDialog').close();
      }
    }

    return DashboardViewModel;
  }
);