import {Component, OnInit} from '@angular/core';
import {MessageService} from '../../message.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  receivedTableData: object = [];
  sentTableData: object = [];
  rDisplayedColumns: string[] = [];
  sDisplayedColumns: string[] = [];

  constructor(private messageService: MessageService, private router: Router) {
    this.rDisplayedColumns = ['id', 'body', 'actions'];
    this.sDisplayedColumns = ['id', 'body'];
  }

  ngOnInit() {
    this.messageService.get_all()
      .subscribe(Messages => {
        this.receivedTableData = Messages['received'];
        this.sentTableData = Messages['sent'];
      });
  }

  respond(message_id: number) {
    this.router.navigate(['message', 'respond', message_id]);
  }


}
