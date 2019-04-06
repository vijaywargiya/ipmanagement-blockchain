import {Component, OnInit} from '@angular/core';
import {PropertyService} from '../../property.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css']
})
export class PropertiesComponent implements OnInit {

  tableData: object = [];
  displayedColumns: string[] = [];
  data_type = '';

  constructor(private propertyService: PropertyService, private router: Router) {
  }


  ngOnInit() {
    this.getSelfProperties();
  }

  getSelfProperties(): void {
    this.displayedColumns = ['id', 'name', 'description'];
    this.propertyService.getSelfProperties()
      .subscribe(Properties => {
        this.tableData = Properties;
      });
    this.data_type = 'owned';
  }

  getAllProperties(): void {
    this.displayedColumns = ['id', 'name', 'description', 'actions'];
    this.propertyService.getAllProperties()
      .subscribe(Properties => this.tableData = Properties);
    this.data_type = 'all';
  }

  messageOwner(property_id) {
    // this.propertyService.getOwner(property_id).subscribe(Owner => {
    //   this.propertyOwner = Owner;
    // });
    this.router.navigate(['message', 'send', property_id]);
  }
}
