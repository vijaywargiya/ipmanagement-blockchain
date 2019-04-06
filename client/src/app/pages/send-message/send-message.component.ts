import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from '../../message.service';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {
  messageForm = this.fb.group({
    body: ['', Validators.required],
  });
  id = 0;
  type = '';

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private messageService: MessageService,
              private router: Router) {
  }


  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.type = this.route.snapshot.paramMap.get('type');
  }

  submitForm() {
    if (this.type === 'send') {
      this.messageService.send(this.id, this.messageForm.value['body']).subscribe(data => this.router.navigateByUrl('/property'));
    } else if (this.type === 'respond') {
      this.messageService.respond(this.id, this.messageForm.value['body']).subscribe(data => this.router.navigateByUrl('/message'));
    }
  }

}
