import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

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
      this.xmlData = xmlData;
      this.originalXmlData = this.xmlData;
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
        this.xmlData = fileReader.result;
        this.originalXmlData = this.xmlData;
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
      this.xmlData = xmlData;
      this.originalXmlData = this.xmlData;
    })
  }

  showRules = true;
  showFacts = true;

  onChangeRulesVisibility(showRules: any) {
    this.showRules = showRules.checked;
    this.reCheckXml();
  }

  onChangeFactsVisibility(showFacts: any) {
    this.showFacts = showFacts.checked;
    this.reCheckXml();
  }

  reCheckXml() {
    let newXmlData = this.originalXmlData;
    var resultJson = convert.xml2js(newXmlData, { compact: false, spaces: 4 });

    if (!this.showRules) {
      let bazaDeCunostinte = resultJson.elements[0];

      if (bazaDeCunostinte.elements[0].name == "reguli") {
        bazaDeCunostinte.elements.splice(0, 1); // remove index 0
      } else if (bazaDeCunostinte.elements[1].name == "reguli") {
        bazaDeCunostinte.elements.splice(1, 1); // remove index 1
      }
    }

    if (!this.showFacts) {
      let bazaDeCunostinte = resultJson.elements[0];

      if (bazaDeCunostinte.elements[0].name == "fapte") {
        bazaDeCunostinte.elements.splice(0, 1); // remove index 0
      } else if (bazaDeCunostinte.elements[1].name == "fapte") {
        bazaDeCunostinte.elements.splice(1, 1); // remove index 1
      }
    }

    var resultXmlFromJson = convert.js2xml(resultJson, { compact: false, spaces: 4 });
    this.xmlData = resultXmlFromJson;
  }
}