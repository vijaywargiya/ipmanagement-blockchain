import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Validators} from '@angular/forms';
import {PropertyService} from '../../property.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-property',
  templateUrl: './create-property.component.html',
  styleUrls: ['./create-property.component.css']
})
export class CreatePropertyComponent implements OnInit {
  propertyForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private propertyService: PropertyService, private router: Router) {
  }

  ngOnInit() {
  }

  submitForm() {
    this.propertyService.create(this.propertyForm.value).subscribe(data => this.router.navigateByUrl('/property'));
  }

}
