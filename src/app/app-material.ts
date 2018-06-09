import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatFormField,
  MatInputModule,
  MatFormFieldModule,
  MatTableModule,
  MatSortModule,
  MatListModule,
  MatPaginatorModule,
  MatButtonModule,
  MatToolbarModule,
  MatSidenavModule,
  MatIconModule
} from '@angular/material';

@NgModule({
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatSortModule,
    MatListModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule
  ],
  exports: [
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatSortModule,
    MatListModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule
  ],
})
export class MaterialModule { }
