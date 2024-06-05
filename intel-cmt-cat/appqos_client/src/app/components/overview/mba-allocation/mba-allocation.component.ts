/*BSD LICENSE

Copyright(c) 2022 Intel Corporation. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in
    the documentation and/or other materials provided with the
    distribution.
  * Neither the name of Intel Corporation nor the names of its
    contributors may be used to endorse or promote products derived
    from this software without specific prior written permission.
    
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT

LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LocalService } from 'src/app/services/local.service';

import { MBACTRL } from '../../system-caps/system-caps.model';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { Pools } from '../overview.model';

@Component({
  selector: 'app-mba-allocation',
  templateUrl: './mba-allocation.component.html',
  styleUrls: ['./mba-allocation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MbaAllocationComponent {
  @Input() available?: boolean;
  @Input() pools!: Pools[];
  @Input() mbaCtrl!: MBACTRL;
  @Output() poolEvent = new EventEmitter<unknown>();
  @Output() mbaCtrlEvent = new EventEmitter<MatSlideToggleChange>();
  mbaBwDefNum = Math.pow(2, 32) - 1;

  constructor(public dialog: MatDialog, public localService: LocalService) { }

  mbaOnChange(event: MatSlideToggleChange) {
    event.source.checked = this.mbaCtrl.enabled;

    this.mbaCtrlEvent.emit(event);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      height: 'auto',
      width: '50rem',
      data: { mba: true },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.poolEvent.emit();
    });
  }
}
