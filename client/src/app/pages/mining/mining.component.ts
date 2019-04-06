import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MiningService} from '../../mining.service';
import {interval} from 'rxjs';
import {toArray} from 'rxjs/operators';

@Component({
  selector: 'app-mining',
  templateUrl: './mining.component.html',
  styleUrls: ['./mining.component.scss']
})
export class MiningComponent implements OnInit, OnDestroy {

  tableData: object = [];
  displayedColumns: string[] = [];
  miningStatus = false;
  responses = [];
  coins = 0;

  constructor(public miningService: MiningService, private changeDetectorRefs: ChangeDetectorRef) {
    this.displayedColumns = ['time', 'status', 'coins'];
  }

  ngOnInit() {
    interval(100).subscribe(x => {
      if (this.miningStatus) {
        this.miningService.mine().subscribe(
          response => {
            if (response['coins']) {
              this.coins += 1;
              this.responses.push(response);
            }
          }
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.miningStatus = false;
  }

  startMining() {
    this.miningStatus = true;
    this.tableData = [];
  }

  stopMining() {
    this.miningStatus = false;
    this.tableData = this.responses;
  }

}
