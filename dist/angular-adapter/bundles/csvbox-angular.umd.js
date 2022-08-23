(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/platform-browser')) :
  typeof define === 'function' && define.amd ? define('@csvbox/angular', ['exports', '@angular/core', '@angular/platform-browser'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.csvbox = global.csvbox || {}, global.csvbox.angular = {}), global.ng.core, global.ng.platformBrowser));
}(this, (function (exports, i0, i1) { 'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () {
              return e[k];
            }
          });
        }
      });
    }
    n['default'] = e;
    return Object.freeze(n);
  }

  var i0__namespace = /*#__PURE__*/_interopNamespace(i0);
  var i1__namespace = /*#__PURE__*/_interopNamespace(i1);

  var CSVBoxButtonComponent = /** @class */ (function () {
      function CSVBoxButtonComponent(sanitizer) {
          this.sanitizer = sanitizer;
          this.isModalShown = false;
          this.uuid = null;
      }
      CSVBoxButtonComponent.prototype.ngOnInit = function () {
          this.uuid = this.generateUuid();
          if (this.debugMode) {
              console.log("[Csvbox-" + this.uuid + "]", "UUID:");
              console.log("[Csvbox-" + this.uuid + "]", "License key:", this.licenseKey);
              console.log("[Csvbox-" + this.uuid + "]", "Using " + (this.useStagingServer ? 'staging' : 'live') + " server");
          }
          var url = "https://" + (this.useStagingServer ? 'staging' : 'app') + ".csvbox.io/embed/" + this.licenseKey;
          url += "?library-version=2";
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      };
      CSVBoxButtonComponent.prototype.generateUuid = function () {
          return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      };
      CSVBoxButtonComponent.prototype.ngOnChanges = function (changes) {
          if (changes["user"] && changes['user'].currentValue != changes['user'].previousValue) {
              this.updateUserVariabe(changes['user'].currentValue);
          }
      };
      CSVBoxButtonComponent.prototype.updateUserVariabe = function (data) {
          var _a, _b, _c;
          this.user = data;
          (_c = (_b = (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.nativeElement) === null || _b === void 0 ? void 0 : _b.contentWindow) === null || _c === void 0 ? void 0 : _c.postMessage({
              "customer": data
          }, "*");
      };
      CSVBoxButtonComponent.prototype.ngAfterViewInit = function () {
          var _this = this;
          window.addEventListener("message", function (event) {
              var _a, _b, _c, _d, _e;
              if (_this.debugMode) {
                  console.log("[Csvbox-" + _this.uuid + "]", "Message:", event);
              }
              if ((event === null || event === void 0 ? void 0 : event.data) === "mainModalHidden") {
                  _this.holder.nativeElement.style.display = 'none';
                  _this.isModalShown = false;
                  (_a = _this.onClose) === null || _a === void 0 ? void 0 : _a.call(_this);
              }
              if ((event === null || event === void 0 ? void 0 : event.data) === "uploadSuccessful") {
                  _this.onImport(true);
              }
              if ((event === null || event === void 0 ? void 0 : event.data) === "uploadFailed") {
                  _this.onImport(false);
              }
              if (typeof (event === null || event === void 0 ? void 0 : event.data) == "object") {
                  if (((_c = (_b = event === null || event === void 0 ? void 0 : event.data) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.unique_token) == _this.uuid) {
                      if (event.data.type && event.data.type == "data-on-submit") {
                          var metadata = event.data.data;
                          metadata["column_mappings"] = event.data.column_mapping;
                          // this.callback(true, metadata);
                          delete metadata["unique_token"];
                          (_d = _this.onSubmit) === null || _d === void 0 ? void 0 : _d.call(_this, metadata);
                      }
                      else if (event.data.type && event.data.type == "data-push-status") {
                          if (event.data.data.import_status == "success") {
                              // this.callback(true, event.data.data);
                              if ((_e = event === null || event === void 0 ? void 0 : event.data) === null || _e === void 0 ? void 0 : _e.row_data) {
                                  var primary_row_data = event.data.row_data;
                                  var headers_1 = event.data.headers;
                                  var rows_1 = [];
                                  var dynamic_columns_indexes_1 = event.data.dynamicColumnsIndexes;
                                  primary_row_data.forEach(function (row_data) {
                                      var x = {};
                                      var dynamic_columns = {};
                                      row_data.data.forEach(function (col, i) {
                                          if (col == undefined) {
                                              col = "";
                                          }
                                          ;
                                          if (dynamic_columns_indexes_1.includes(i)) {
                                              dynamic_columns[headers_1[i]] = col;
                                          }
                                          else {
                                              x[headers_1[i]] = col;
                                          }
                                      });
                                      if (row_data === null || row_data === void 0 ? void 0 : row_data.unmapped_data) {
                                          x["_unmapped_data"] = row_data.unmapped_data;
                                      }
                                      if (dynamic_columns && Object.keys(dynamic_columns).length > 0) {
                                          x["_dynamic_data"] = dynamic_columns;
                                      }
                                      rows_1.push(x);
                                  });
                                  var metadata = event.data.data;
                                  metadata["rows"] = rows_1;
                                  delete metadata["unique_token"];
                                  _this.onImport(true, metadata);
                              }
                              else {
                                  var metadata = event.data.data;
                                  delete metadata["unique_token"];
                                  _this.onImport(true, metadata);
                              }
                          }
                          else {
                              var metadata = event.data.data;
                              delete metadata["unique_token"];
                              _this.onImport(false, metadata);
                          }
                      }
                  }
              }
          }, false);
          var iframe = this.iframe.nativeElement;
          // let user = this.user;
          // let dynamicColumns = this.dynamicColumns;
          // let options = this.options;
          // let uuid = this.uuid;
          var self = this;
          iframe.onload = function () {
              var _a;
              if (self.debugMode) {
                  console.log("[Csvbox-" + self.uuid + "]", "iframe loaded");
              }
              (_a = self.onReady) === null || _a === void 0 ? void 0 : _a.call(self);
              self.enableInitator();
              iframe.contentWindow.postMessage({
                  "customer": self.user ? self.user : null,
                  "columns": self.dynamicColumns ? self.dynamicColumns : null,
                  "options": self.options ? self.options : null,
                  "unique_token": self.uuid
              }, "*");
          };
      };
      CSVBoxButtonComponent.prototype.enableInitator = function () {
          var initator = document.querySelector("[data-csvbox-initator][data-csvbox-token=\"" + this.uuid + "\"]");
          if (initator && initator.disabled !== undefined) {
              initator.disabled = false;
          }
      };
      CSVBoxButtonComponent.prototype.openModal = function () {
          if (!this.isModalShown) {
              this.isModalShown = true;
              this.iframe.nativeElement.contentWindow.postMessage('openModal', '*');
              this.holder.nativeElement.style.display = 'block';
          }
      };
      return CSVBoxButtonComponent;
  }());
  CSVBoxButtonComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0__namespace, type: CSVBoxButtonComponent, deps: [{ token: i1__namespace.DomSanitizer }], target: i0__namespace.ɵɵFactoryTarget.Component });
  CSVBoxButtonComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.2", type: CSVBoxButtonComponent, selector: "csvbox-button", inputs: { onImport: "onImport", onReady: "onReady", onClose: "onClose", onSubmit: "onSubmit", user: "user", dynamicColumns: "dynamicColumns", licenseKey: "licenseKey", options: "options", uuid: "uuid", debugMode: "debugMode", useStagingServer: "useStagingServer" }, viewQueries: [{ propertyName: "holder", first: true, predicate: ["holder"], descendants: true }, { propertyName: "iframe", first: true, predicate: ["iframe"], descendants: true }], usesOnChanges: true, ngImport: i0__namespace, template: "\n    <div>\n      <button disabled (click)=\"openModal()\" data-csvbox-initator [attr.data-csvbox-token]=\"uuid\">\n        <ng-content></ng-content>\n      </button>\n      <div #holder class=\"holder\" attr.id=\"csvbox-embed-{{ uuid }}\">\n        <iframe #iframe class=\"iframe\" [src]=\"safeUrl\" [attr.data-csvbox-token]=\"uuid\"></iframe>\n      </div>\n    </div>\n  ", isInline: true, styles: ["\n      .holder{\n        z-index: 2147483647;\n        position: fixed;\n        top: 0;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        display: none;\n      }\n      .iframe{\n        height: 100%;\n        width: 100%;\n        position: absolute;\n        top: 0px;\n        left: 0px;\n      }\n    "] });
  i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0__namespace, type: CSVBoxButtonComponent, decorators: [{
              type: i0.Component,
              args: [{
                      selector: 'csvbox-button',
                      template: "\n    <div>\n      <button disabled (click)=\"openModal()\" data-csvbox-initator [attr.data-csvbox-token]=\"uuid\">\n        <ng-content></ng-content>\n      </button>\n      <div #holder class=\"holder\" attr.id=\"csvbox-embed-{{ uuid }}\">\n        <iframe #iframe class=\"iframe\" [src]=\"safeUrl\" [attr.data-csvbox-token]=\"uuid\"></iframe>\n      </div>\n    </div>\n  ",
                      styles: [
                          "\n      .holder{\n        z-index: 2147483647;\n        position: fixed;\n        top: 0;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        display: none;\n      }\n      .iframe{\n        height: 100%;\n        width: 100%;\n        position: absolute;\n        top: 0px;\n        left: 0px;\n      }\n    "
                      ]
                  }]
          }], ctorParameters: function () { return [{ type: i1__namespace.DomSanitizer }]; }, propDecorators: { holder: [{
                  type: i0.ViewChild,
                  args: ['holder']
              }], iframe: [{
                  type: i0.ViewChild,
                  args: ['iframe']
              }], onImport: [{
                  type: i0.Input
              }], onReady: [{
                  type: i0.Input
              }], onClose: [{
                  type: i0.Input
              }], onSubmit: [{
                  type: i0.Input
              }], user: [{
                  type: i0.Input
              }], dynamicColumns: [{
                  type: i0.Input
              }], licenseKey: [{
                  type: i0.Input
              }], options: [{
                  type: i0.Input
              }], uuid: [{
                  type: i0.Input
              }], debugMode: [{
                  type: i0.Input
              }], useStagingServer: [{
                  type: i0.Input
              }] } });

  var CSVBoxAngularModule = /** @class */ (function () {
      function CSVBoxAngularModule() {
      }
      return CSVBoxAngularModule;
  }());
  CSVBoxAngularModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0__namespace, type: CSVBoxAngularModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
  CSVBoxAngularModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0__namespace, type: CSVBoxAngularModule, declarations: [CSVBoxButtonComponent], exports: [CSVBoxButtonComponent] });
  CSVBoxAngularModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0__namespace, type: CSVBoxAngularModule, imports: [[]] });
  i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.2", ngImport: i0__namespace, type: CSVBoxAngularModule, decorators: [{
              type: i0.NgModule,
              args: [{
                      declarations: [
                          CSVBoxButtonComponent
                      ],
                      imports: [],
                      exports: [
                          CSVBoxButtonComponent
                      ]
                  }]
          }] });

  /*
   * Public API Surface of angular-adapter
   */

  /**
   * Generated bundle index. Do not edit.
   */

  exports.CSVBoxAngularModule = CSVBoxAngularModule;
  exports.CSVBoxButtonComponent = CSVBoxButtonComponent;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=csvbox-angular.umd.js.map
