import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {TransactionService} from '../../transaction.service';
import {PropertyService} from '../../property.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.css']
})
export class CreateTransactionComponent implements OnInit {
  properties;

  transactionForm = this.fb.group({
    property: ['', Validators.required],
    recipient: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private transactionService: TransactionService, private propertyService: PropertyService,
              private router: Router) {
  }

  ngOnInit() {
    this.propertyService.getSelfProperties()
      .subscribe(Properties => this.properties = Properties);
  }


  submitForm() {
    this.transactionService.create(this.transactionForm.value).subscribe(data => this.router.navigateByUrl('/transaction'));
  }

}
