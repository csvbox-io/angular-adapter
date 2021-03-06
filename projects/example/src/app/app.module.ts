import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { CSVBoxAngularModule } from "angular-adapter";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CSVBoxAngularModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
