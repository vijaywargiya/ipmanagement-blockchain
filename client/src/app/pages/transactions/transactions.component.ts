import {Component, OnInit} from '@angular/core';
import {TransactionService} from '../../transaction.service';
import {PropertyService} from '../../property.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  tableData: object = [];
  displayedColumns: string[] = [];
  data_type = '';


  constructor(private transactionService: TransactionService, private router: Router) {
    this.displayedColumns = ['token', 'sender', 'recipient'];
  }

  ngOnInit() {
    this.getSelfTransactions();
  }


  getSelfTransactions(): void {
    this.transactionService.getSelfTransactions()
      .subscribe(Transactions => {
        this.tableData = Transactions;
      });
    this.data_type = 'owned';
  }

  getAllTransactions(): void {
    this.transactionService.getAllTransactions()
      .subscribe(Transactions => this.tableData = Transactions);
    this.data_type = 'all';
  }


}
