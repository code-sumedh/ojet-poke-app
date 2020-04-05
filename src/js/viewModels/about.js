/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your about ViewModel code goes here
 */
define(['accUtils', 'knockout', 'ojs/ojbootstrap', 'ojs/ojcore', 'jquery', 'ojs/ojarraydataprovider', 'ojs/ojknockout-keyset', 'ojs/ojknockout',
  'ojs/ojtable', 'ojs/ojcheckboxset', 'ojs/ojlabel', 'ojs/ojbutton', 'ojs/ojdialog', 'ojs/ojinputtext'],
  function (accUtils, ko, Bootstrap, oj, $, ArrayDataProvider, keySet) {

    function AboutViewModel() {
      var self = this;
      var ids = [];
      var tempArray = [];

      function randomNumber(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      var basicurl = "https://pokeapi.co/api/v2/pokemon/";
      for (i = 0; i < 5; i++) {
        getdata(basicurl.concat(randomNumber(1, 964)));
      }

      self.data = ko.observableArray();
      // Item selection observables
      self.itemSelected = ko.observable(false);
      self.chartDataProvider = ko.observableArray([]);  //holds data for pie chart

      function getdata(arg) {
        $.getJSON(arg).
          then(function (users) {
            var count = users.types.length;
            var typesArray = [];
            for (i = 0; i < count; i++) {
              var y = JSON.stringify(users.types[i].type.name).substring(1, JSON.stringify(users.types[i].type.name).length - 1);
              if (i < count - 1) {
                y = y.concat(', ');
              }
              typesArray += y;
            }
            tempArray.push({
              PokeId: users.id,
              PokeName: users.name,
              PokeHeight: users.weight,
              PokeWeight: users.height,
              PokeMoves: users.moves.length,
              PokeTypes: typesArray
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

      // var chartArray1 = [];
      this.checkboxListener = function (event) {
        chartData = [];
        var key = Number(event.target.dataset.rowKey);
        if (ids.indexOf(key) >= 0) {
          ids.splice(ids.indexOf(key), 1);
        } else {
          ids.push(key);
        }
        console.log(ids);
        console.log(tempArray);
        var selectedTemList = [];
        ids.forEach(eachId => {
          selectedTemList.push(tempArray.find(t => t.PokeId === eachId));
        });
        console.log(selectedTemList);
        selectedTemList.forEach(a => {
          chartData.push({
            id: a.PokeId,
            group: 'group-1',
            value: 4,
            series: a.PokeTypes
          });
        });
        var pieSeries = [
          { name: "Quantity in Stock", items: [15] },
          { name: "Quantity Shipped", items: [20] }
        ];
        console.log('chartData', chartData);
        self.chartDataProvider(pieSeries);
        // self.chartDataProvider = new ArrayDataProvider(chartData, { keyAttributes: 'id' });

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
        // show current selection in textarea
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

      self.showCreateDialog = function (event) {
        document.getElementById('createDialog').open();
        document.getElementById('viewCurrent').value = "Hello";
      }

      self.closeItem = function (event, data) {
        document.getElementById('createDialog').close();
      }
    }
    // Bootstrap.whenDocumentReady().then(
    //   function () {
    //     // if (chartData!=null && chartData.length > 0) {
    //     ko.applyBindings(function () {
    //       self.chartDataProvider = new ArrayDataProvider(chartData, { keyAttributes: 'id' });
    //     }, document.getElementById('pieChart'));
    //     // }

    //   });
    return AboutViewModel();
  }
);