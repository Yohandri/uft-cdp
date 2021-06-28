import { Component, OnInit, ɵɵtrustConstantResourceUrl } from '@angular/core';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings = [];
  constructor(
    public system: SystemService
  ) { }

  async ngOnInit() {
    this.system.module.name = 'Ajustes';
    this.system.module.icon = 'cogs';
    if (this.system.isMobile) {
      this.system.module.name = 'Ajustes';
    }
    this.GetSettings();
  }
  async save() {
    console.log('save');
    this.system.post('api/app/settings/save', this.settings, true).then(res => {
      try {
        if (res.status === 200) {
          this.settings = res.object;
        } else {
          this.settings = [];
        }
      } catch (error) {
        this.settings = [];
      }
    });
  }
  GetSettings() {
    this.system.post('api/app/settings', {}, true).then(res => {
      try {
        if (res.status === 200) {
          this.settings = res.object;
        } else {
          this.settings = [];
        }
      } catch (error) {
        this.settings = [];
      }
    });
  }

}
