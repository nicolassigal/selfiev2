import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatFormField,
  MatInputModule,
  MatFormFieldModule,
  MatTableModule
} from '@angular/material';

@NgModule({
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatTableModule
  ],
  exports: [
    MatInputModule,
    MatFormFieldModule,
    MatTableModule
  ],
})
export class MaterialModule { }
