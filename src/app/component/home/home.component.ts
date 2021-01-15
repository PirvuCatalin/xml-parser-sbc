import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';

declare var require: any;
var xmlParser = require('fast-xml-parser');
var convert = require('xml-js');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  xmlData: any = '<?xml version="1.0" encoding="utf-8"?> <root> <name required="true">Test XML data</name> <description>x This is a test data </description> <list> <item primary="true">Item 1</item> <item>Item 2</item> </list> </root> ';
  originalXmlData: any;

  showFilters = true;
  uploadedFile: any;

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.http.get('assets/Pirvu_GabrielCatalin_341A1_SBC_Tema2_bazaDeCunostinte.xml', { responseType: 'text' }).subscribe(xmlData => {
      this.updateXmlData(xmlData);
    })

    this.updateXmlViewerStyles();
  }

  handleFileInput(files: any) {
    var file = files.files.item(0);
    this.uploadedFile = file ? file : null;
    if (!this.uploadedFile || this.uploadedFile.type != "text/xml") {
      alert("invalid file, please use the correct format");
    } else {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.updateXmlData(fileReader.result);
      }
      fileReader.readAsText(this.uploadedFile);
    }
  }

  updateXmlViewerStyles() {
    var checkExist = setInterval(function () {
      let xmlViewer: any = document.getElementsByTagName("xml-viewer-component")[0].shadowRoot
      if (xmlViewer) {
        xmlViewer.adoptedStyleSheets[0].cssRules[2].style.color = "#007acc";
        xmlViewer.adoptedStyleSheets[0].cssRules[3].style.color = "black";
        xmlViewer.firstElementChild.style.width = "max-content";
        clearInterval(checkExist);
      }
    }, 200); // check every 100ms
  }

  handleUseDefaultXml() {
    this.http.get('assets/Pirvu_GabrielCatalin_341A1_SBC_Tema2_bazaDeCunostinte.xml', { responseType: 'text' }).subscribe(xmlData => {
      this.updateXmlData(xmlData);
    })
  }

  updateXmlData(xmlData: any) {
    this.xmlData = xmlData;
    this.originalXmlData = this.xmlData;

    this.showRules = true;
    this.showFacts = true;
  }

  showRules = true;
  showFacts = true;
  freeTextSearchAttribute = "";
  freeTextSearchTerm = "";

  onChangeRulesVisibility() {
    this.showRules = !this.showRules;
    this.reCheckXml();
  }

  onChangeFactsVisibility() {
    this.showFacts = !this.showFacts;
    this.reCheckXml();
  }

  onChangeFreeTextAttribute(element: any) {
    this.freeTextSearchAttribute = element.value;
  }

  onFreeTextSearch() {
    let searchBox: any = document.getElementsByClassName("free-text-search-box")[0];
    if (!this.freeTextSearchAttribute || this.freeTextSearchAttribute == "") {
      alert("Please first select a search attribute");
    } else if (!searchBox.value || searchBox.value.trim() == "") {
      alert("Please enter a search term");
    } else {
      this.freeTextSearchTerm = searchBox.value.trim();
      this.reCheckXml();
    }
  }

  reCheckXml() {
    let newXmlData = this.originalXmlData;
    var resultJson = convert.xml2js(newXmlData, { compact: false, spaces: 4 });

    let bazaDeCunostinte = resultJson.elements[0];

    if (!this.showRules) {
      if (bazaDeCunostinte.elements[0]?.name == "reguli") {
        bazaDeCunostinte.elements.splice(0, 1); // remove index 0
      } else if (bazaDeCunostinte.elements[1]?.name == "reguli") {
        bazaDeCunostinte.elements.splice(1, 1); // remove index 1
      }
    }

    if (!this.showFacts) {
      if (bazaDeCunostinte.elements[0]?.name == "fapte") {
        bazaDeCunostinte.elements.splice(0, 1); // remove index 0
      } else if (bazaDeCunostinte.elements[1]?.name == "fapte") {
        bazaDeCunostinte.elements.splice(1, 1); // remove index 1
      }
    }

    if (this.freeTextSearchAttribute != "" && this.freeTextSearchTerm != "") { // apply filter only on the facts base
      let bazaDeFapte = null;
      if (bazaDeCunostinte.elements[0]?.name == "fapte") {
        bazaDeFapte = bazaDeCunostinte.elements[0];
        bazaDeCunostinte.elements[0] = this.applySearchFilters(bazaDeFapte, this.freeTextSearchAttribute, this.freeTextSearchTerm);
      } else if (bazaDeCunostinte.elements[1]?.name == "fapte") {
        bazaDeFapte = bazaDeCunostinte.elements[1];
        bazaDeCunostinte.elements[1] = this.applySearchFilters(bazaDeFapte, this.freeTextSearchAttribute, this.freeTextSearchTerm);
      }
    }

    if (this.minValue != 0 || this.maxValue != 25000) {
      let bazaDeFapte = null;
      if (bazaDeCunostinte.elements[0]?.name == "fapte") {
        bazaDeFapte = bazaDeCunostinte.elements[0];
        bazaDeCunostinte.elements[0] = this.applyRangeFilter(bazaDeFapte);
      } else if (bazaDeCunostinte.elements[1]?.name == "fapte") {
        bazaDeFapte = bazaDeCunostinte.elements[1];
        bazaDeCunostinte.elements[1] = this.applyRangeFilter(bazaDeFapte);
      }
    }
    var resultXmlFromJson = convert.js2xml(resultJson, { compact: false, spaces: 4 });
    this.xmlData = resultXmlFromJson;
  }

  applyRangeFilter(bazaDeFapte: any) {
    let copieBazaDeFapte: any = {
      elements: [],
      name: "fapte",
      type: "element"
    }

    bazaDeFapte.elements.forEach((companie: any, index: any) => {
      let companieDeAdaugat = {
        elements: [companie.elements[0], companie.elements[1]],
        name: "companie",
        type: "element"
      };

      let angajati: any = {
        elements: [],
        name: "angajati",
        type: "element"
      }
      companie.elements[2].elements.forEach((angajat: any, index: any) => {
        let salariu: number = parseInt(angajat.elements[1].elements[0].text);
        if (salariu >= this.minValue && salariu <= this.maxValue) {
          angajati.elements.push(angajat);
        }
      });
      companieDeAdaugat.elements.push(angajati);

      if (angajati.elements.length > 0) {
        copieBazaDeFapte.elements.push(companieDeAdaugat);
      }
    });

    return copieBazaDeFapte;
  }

  onUserChangeEnd(): void {
    this.reCheckXml();
  }

  minValue: number = 0;
  maxValue: number = 25000;
  options: Options = {
    floor: this.minValue,
    ceil: this.maxValue,
    step: 1000,
    showTicks: true
  };

  /**
   * Below you can find the most ugly hardcoding on the Internet.
   * Skip this for your own safety.
   */
  applySearchFilters(bazaDeFapte: any, searchAttribute: any, searchTerm: any) {
    let copieBazaDeFapte: any = {
      elements: [],
      name: "fapte",
      type: "element"
    }

    if (searchAttribute == "companie,nume") {
      bazaDeFapte.elements.forEach((companie: any, index: any) => {
        let numeCompanie: string = companie.elements[0].elements[0].text;
        if (numeCompanie.toLowerCase().includes(searchTerm.toLowerCase())) {
          copieBazaDeFapte.elements.push(companie);
        }
      });
    } else if (searchAttribute == "salarii,junior,minim") {
      let searchTermValue: number = parseInt(searchTerm);
      if (!isNaN(searchTermValue)) {
        bazaDeFapte.elements.forEach((companie: any, index: any) => {
          let salariuMinim: number = parseInt(companie.elements[1].elements[0].elements[0].elements[0].text);
          if (salariuMinim == searchTermValue) {
            copieBazaDeFapte.elements.push(companie);
          }
        });
      } else {
        copieBazaDeFapte = bazaDeFapte;
      }
    } else if (searchAttribute == "salarii,junior,maxim") {
      let searchTermValue: number = parseInt(searchTerm);
      if (!isNaN(searchTermValue)) {
        bazaDeFapte.elements.forEach((companie: any, index: any) => {
          let salariuMinim: number = parseInt(companie.elements[1].elements[0].elements[1].elements[0].text);
          if (salariuMinim == searchTermValue) {
            copieBazaDeFapte.elements.push(companie);
          }
        });
      } else {
        copieBazaDeFapte = bazaDeFapte;
      }
    } else if (searchAttribute == "salarii,middle,minim") {
      let searchTermValue: number = parseInt(searchTerm);
      if (!isNaN(searchTermValue)) {
        bazaDeFapte.elements.forEach((companie: any, index: any) => {
          let salariuMinim: number = parseInt(companie.elements[1].elements[1].elements[0].elements[0].text);
          if (salariuMinim == searchTermValue) {
            copieBazaDeFapte.elements.push(companie);
          }
        });
      } else {
        copieBazaDeFapte = bazaDeFapte;
      }
    } else if (searchAttribute == "salarii,middle,maxim") {
      let searchTermValue: number = parseInt(searchTerm);
      if (!isNaN(searchTermValue)) {
        bazaDeFapte.elements.forEach((companie: any, index: any) => {
          let salariuMinim: number = parseInt(companie.elements[1].elements[1].elements[1].elements[0].text);
          if (salariuMinim == searchTermValue) {
            copieBazaDeFapte.elements.push(companie);
          }
        });
      } else {
        copieBazaDeFapte = bazaDeFapte;
      }
    } else if (searchAttribute == "salarii,senior,minim") {
      let searchTermValue: number = parseInt(searchTerm);
      if (!isNaN(searchTermValue)) {
        bazaDeFapte.elements.forEach((companie: any, index: any) => {
          let salariuMinim: number = parseInt(companie.elements[1].elements[2].elements[0].elements[0].text);
          if (salariuMinim == searchTermValue) {
            copieBazaDeFapte.elements.push(companie);
          }
        });
      } else {
        copieBazaDeFapte = bazaDeFapte;
      }
    } else if (searchAttribute == "salarii,senior,maxim") {
      let searchTermValue: number = parseInt(searchTerm);
      if (!isNaN(searchTermValue)) {
        bazaDeFapte.elements.forEach((companie: any, index: any) => {
          let salariuMinim: number = parseInt(companie.elements[1].elements[2].elements[1].elements[0].text);
          if (salariuMinim == searchTermValue) {
            copieBazaDeFapte.elements.push(companie);
          }
        });
      } else {
        copieBazaDeFapte = bazaDeFapte;
      }
    } else if (searchAttribute == "angajat,nume") {
      bazaDeFapte.elements.forEach((companie: any, index: any) => {
        let companieDeAdaugat = {
          elements: [companie.elements[0], companie.elements[1]],
          name: "companie",
          type: "element"
        };

        let angajati: any = {
          elements: [],
          name: "angajati",
          type: "element"
        }
        companie.elements[2].elements.forEach((angajat: any, index: any) => {
          let numeAngajat: string = angajat.elements[0].elements[0].text;
          if (numeAngajat.toLowerCase().includes(searchTerm.toLowerCase())) {
            angajati.elements.push(angajat);
          }
        });
        companieDeAdaugat.elements.push(angajati);

        if (angajati.elements.length > 0) {
          copieBazaDeFapte.elements.push(companieDeAdaugat);
        }
      });
    } else if (searchAttribute == "angajat,salariu") {
      let searchTermValue: number = parseInt(searchTerm);

      if (!isNaN(searchTermValue)) {
        bazaDeFapte.elements.forEach((companie: any, index: any) => {
          let companieDeAdaugat = {
            elements: [companie.elements[0], companie.elements[1]],
            name: "companie",
            type: "element"
          };

          let angajati: any = {
            elements: [],
            name: "angajati",
            type: "element"
          }
          companie.elements[2].elements.forEach((angajat: any, index: any) => {
            let salariu: number = parseInt(angajat.elements[1].elements[0].text);
            if (salariu == searchTermValue) {
              angajati.elements.push(angajat);
            }
          });
          companieDeAdaugat.elements.push(angajati);

          if (angajati.elements.length > 0) {
            copieBazaDeFapte.elements.push(companieDeAdaugat);
          }
        });
      } else {
        copieBazaDeFapte = bazaDeFapte;
      }
    } else if (searchAttribute == "angajat,ani-experienta") {
      let searchTermValue: number = parseInt(searchTerm);

      if (!isNaN(searchTermValue)) {
        bazaDeFapte.elements.forEach((companie: any, index: any) => {
          let companieDeAdaugat = {
            elements: [companie.elements[0], companie.elements[1]],
            name: "companie",
            type: "element"
          };

          let angajati: any = {
            elements: [],
            name: "angajati",
            type: "element"
          }
          companie.elements[2].elements.forEach((angajat: any, index: any) => {
            let aniExperienta: number = parseInt(angajat.elements[2].elements[0].text);
            if (aniExperienta == searchTermValue) {
              angajati.elements.push(angajat);
            }
          });
          companieDeAdaugat.elements.push(angajati);

          if (angajati.elements.length > 0) {
            copieBazaDeFapte.elements.push(companieDeAdaugat);
          }
        });
      } else {
        copieBazaDeFapte = bazaDeFapte;
      }


    } else if (searchAttribute == "angajat,functie") {
      bazaDeFapte.elements.forEach((companie: any, index: any) => {
        let companieDeAdaugat = {
          elements: [companie.elements[0], companie.elements[1]],
          name: "companie",
          type: "element"
        };

        let angajati: any = {
          elements: [],
          name: "angajati",
          type: "element"
        }
        companie.elements[2].elements.forEach((angajat: any, index: any) => {
          let functie: string = angajat.elements[3].elements[0].text;
          if (functie.toLowerCase().includes(searchTerm.toLowerCase())) {
            angajati.elements.push(angajat);
          }
        });
        companieDeAdaugat.elements.push(angajati);

        if (angajati.elements.length > 0) {
          copieBazaDeFapte.elements.push(companieDeAdaugat);
        }
      });
    } else {
      copieBazaDeFapte = bazaDeFapte;
    }

    return copieBazaDeFapte;
  }

  rules: any = `<pre>junior(X):
	IF (angajat.nume == X
		AND angajat.functie == programator
		AND angajat.ani-experienta > 0
		AND angajat.ani-experienta <= 3) OR
	(angajat.nume == X
		AND angajat.functie == inginer
		AND angajat.ani-experienta > 0
		AND angajat.ani-experienta <= 5) OR
	(angajat.nume == X
		AND angajat.functie == dezvoltator software
		AND angajat.ani-experienta > 0
		AND angajat.ani-experienta <= 3) OR
	(angajat.nume == X
		AND angajat.functie == inginer software
		AND angajat.ani-experienta > 0
		AND angajat.ani-experienta <= 4) 
	THEN
	angajat.grad-senioritate = junior

middle(X):
	IF (angajat.nume == X
		AND angajat.functie == programator
		AND angajat.ani-experienta > 3
		AND angajat.ani-experienta <= 5) OR
	(angajat.nume == X
		AND angajat.functie == inginer
		AND angajat.ani-experienta > 5
		AND angajat.ani-experienta <= 10) OR
	(angajat.nume == X
		AND angajat.functie == dezvoltator software
		AND angajat.ani-experienta > 3
		AND angajat.ani-experienta <= 6) OR
	(angajat.nume == X
		AND angajat.functie == inginer software
		AND angajat.ani-experienta > 4
		AND angajat.ani-experienta <= 7) 
	THEN angajat.grad-senioritate = junior

junior(X):
	IF (angajat.nume == X
		AND angajat.functie == programator
		AND angajat.ani-experienta > 5) OR
	(angajat.nume == X
		AND angajat.functie == inginer
		AND angajat.ani-experienta > 10) OR
	(angajat.nume == X
		AND angajat.functie == dezvoltator software
		AND angajat.ani-experienta > 6) OR
	(angajat.nume == X
		AND angajat.functie == inginer software
		AND angajat.ani-experienta > 7) 
	THEN
	angajat.grad-senioritate = junior

companie-contine-pozitia(X,Y):
	IF companie.nume == X
		AND companie.angajati.angajat.functie == Y
	THEN companie.contine-functia-Y = “DA”
	ELSE companie.contine-functia-Y = “NU”

poate-lucra-la(X,Y):
	IF companie.nume == Y
		AND angajat.nume == X
		AND angajat.functie == companie.angajati.angajat.functie
	THEN angajat.poate-lucra-la-X = “DA”
	ELSE angajat.poate-lucra-la-X = “NU”</pre>`;

  // below you can find the old implementation using recursive methods
  // applySearchFilters(bazaDeFapte: any, searchAttribute: any) {
  //   var attributes1 = searchAttribute.split(",");
  //   attributes1.pop();
  //   var attributes2 = searchAttribute.split(",");
  //   var searchAttributeTags = attributes1;
  //   var searchAttributeElement = attributes2[attributes2.length - 1];
  //   this.findAttribute(bazaDeFapte, searchAttributeTags, searchAttributeElement);
  //   console.log(bazaDeFapte);
  // }

  // findAttribute(arr: any, searchAttributeTags: any, searchAttributeElement: any) {
  //   if (arr.type == "element") {
  //     if (arr.name == searchAttributeTags[0]) {
  //       if (searchAttributeTags.length > 1) {
  //         searchAttributeTags.shift();
  //         arr.elements.forEach((element: any) => {
  //           this.findAttribute(element, searchAttributeTags, searchAttributeElement);
  //         });
  //       } else {
  //         console.log("found at:");
  //         console.log(arr);
  //       }
  //     } else {
  //       arr.elements.forEach((element: any) => {
  //         this.findAttribute(element, searchAttributeTags, searchAttributeElement);
  //       });
  //     }
  //   }
  // }
}