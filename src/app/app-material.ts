import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
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
  MatIconModule,
  MatCheckboxModule,
  MatMenuModule,
  MatDialogModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSelectModule,
  MatExpansionModule,
  MatSpinner,
  MatProgressSpinnerModule,
  MatAutocompleteModule
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
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    CdkTableModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
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
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    CdkTableModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
})
export class MaterialModule { }
