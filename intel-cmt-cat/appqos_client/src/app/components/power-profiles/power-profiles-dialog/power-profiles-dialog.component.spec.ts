/*BSD LICENSE

Copyright(c) 2023 Intel Corporation. All rights reserved.

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

import { MockBuilder, MockInstance, MockRender, ngMocks } from "ng-mocks";
import { SharedModule } from "src/app/shared/shared.module";
import { AppqosService } from "src/app/services/appqos.service";
import { PowerProfileDialogComponent } from "./power-profiles-dialog.component";
import { MatError, MatFormField } from "@angular/material/form-field";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SnackBarService } from "src/app/shared/snack-bar.service";
import { MatButtonModule } from "@angular/material/button";
import { PostProfile, resMessage } from "../../system-caps/system-caps.model";
import { of, throwError } from "rxjs";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";

describe('Given PowerProfileDialogComponent', () => {
  beforeEach(() => {
    return MockBuilder(PowerProfileDialogComponent)
      .mock(SharedModule)
      .mock(AppqosService)
      .mock(MatDialogRef)
      .mock(MatFormField)
      .mock(MatSelect)
      .keep(MatButtonModule);
  });

  MockInstance.scope('case');

  const mockedProfile = {
    id: 0,
    name: 'profile_0',
    min_freq: 1000,
    max_freq: 1200,
    epp: 'balance_power'
  };

  const mockedData = {
    edit: false
  };

  describe('when initialized', () => {
    it('it should populate EPP dropdown', () => {
      MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });

      const eppOptions = ngMocks.findAll(MatOption);
      const eppText = ngMocks.formatText(eppOptions);

      expect(eppOptions.length).toBe(4);
      expect(eppText.includes('Performance')).toBeTrue();
      expect(eppText.includes('Balance Performance')).toBeTrue();
      expect(eppText.includes('Balance Power')).toBeTrue();
      expect(eppText.includes('Power')).toBeTrue();
    });

    it('it should display correct title when edit is false', () => {
      MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });

      const title = ngMocks.formatText(ngMocks.find('h2'));

      expect(title).toBe('Add New Power Profile');
    });

    it('it should display correct title when edit is true', () => {
      MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              profile: mockedProfile,
              edit: true
            }
          }
        ]
      });

      const title = ngMocks.formatText(ngMocks.find('h2'));

      expect(title).toBe('Edit Power Profile');
    });

    it('it should display correct button when edit is false', () => {
      MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });

      const buttonText = ngMocks.formatText(ngMocks.find('.mat-flat-button'));

      expect(buttonText).toBe('Save');
    });

    it('it should display correct button when edit is true', () => {
      MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              profile: mockedProfile,
              edit: true
            }
          }
        ]
      });

      const buttonText = ngMocks.formatText(ngMocks.find('.mat-flat-button'));

      expect(buttonText).toBe('Update');
    });

    it('it should display power profile properties when edit is true', () => {
      const {
        point: { componentInstance: component }
      } = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              profile: mockedProfile,
              edit: true
            }
          }
        ]
      });

      expect(component.form.controls['name'].value).toBe(mockedProfile.name);
      expect(component.form.controls['minFreq'].value).toBe(mockedProfile.min_freq);
      expect(component.form.controls['maxFreq'].value).toBe(mockedProfile.max_freq);
      expect(component.form.controls['epp'].value).toBe(mockedProfile.epp);
    });

    it('it should display empty input fields when edit is false', () => {
      const {
        point: { componentInstance: component }
      } = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              edit: false
            }
          }
        ]
      });

      expect(component.form.controls['name'].value).toBe('');
      expect(component.form.controls['minFreq'].value).toBe('');
      expect(component.form.controls['maxFreq'].value).toBe('');
      expect(component.form.controls['epp'].value).toBe('Balance Performance');
    });
  });

  describe('when the form is invalid', () => {
    it('it should display required error', () => {
      const name = '';
      const minFreq = '';
      const maxFreq = '';

      const nameError = 'name is required';
      const freqError = 'frequency is required';

      const fixture = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({ name, minFreq, maxFreq });
      fixture.detectChanges();

      const errorsMessages = ngMocks.formatText(ngMocks.findAll(MatError));

      expect(errorsMessages.length).toBe(3);
      expect(errorsMessages.includes(nameError)).toBeTrue();
      expect(errorsMessages.includes(freqError)).toBeTrue();
    });

    it('it should display max characters error', () => {
      const name = ''.padStart(81, 'c');
      const minFreq = 800;
      const maxFreq = 1200;

      const nameError = 'max length 80 characters';

      const fixture = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({ name, minFreq, maxFreq });
      fixture.detectChanges();

      const errorsMessages = ngMocks.formatText(ngMocks.findAll(MatError));

      expect(errorsMessages.length).toBe(1);
      expect(errorsMessages.includes(nameError)).toBeTrue();
    });

    it('it should display minimum frequency error', () => {
      const name = 'profile_0';
      const minFreq = '200';
      const maxFreq = '300';

      const minFreqError = 'frequency must be 400MHz or above';

      const fixture = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({ name, minFreq, maxFreq });
      fixture.detectChanges();

      const errorsMessages = ngMocks.formatText(ngMocks.findAll(MatError));

      expect(errorsMessages.length).toBe(2);
      expect(errorsMessages.includes(minFreqError)).toBeTrue();
    });

    it('it should display maximum frequency error', () => {
      const name = 'profile_0';
      const minFreq = '5100';
      const maxFreq = '5200';

      const maxFreqError = 'frequency must be 5000Mhz or below';

      const fixture = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({ name, minFreq, maxFreq });
      fixture.detectChanges();

      const errorsMessages = ngMocks.formatText(ngMocks.findAll(MatError));

      expect(errorsMessages.length).toBe(2);
      expect(errorsMessages.includes(maxFreqError)).toBeTrue();
    });

    it('it should display max is less than min error', () => {
      const name = 'profile_0';
      const minFreq = '1200';
      const maxFreq = '1000';

      const lessThanMinError = 'maximum is below minimum';

      const fixture = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({ name, minFreq, maxFreq });
      component.checkFreq();
      fixture.detectChanges();

      const errorsMessages = ngMocks.formatText(ngMocks.findAll(MatError));

      expect(errorsMessages.length).toBe(1);
      expect(errorsMessages.includes(lessThanMinError)).toBeTrue();
    });
  });

  describe('when action button is clicked', () => {
    it('it should save the power profile when edit is false', () => {
      const mockedProfile = {
        name: 'profile_0',
        min_freq: '800',
        max_freq: '1200',
        epp: 'power'
      };
      const mockedMessage: resMessage = {
        message: 'REST API'
      };

      const postPowerProfilesSpy = jasmine.createSpy('postPowerProfileSpy')
        .and.returnValue(of(mockedMessage));
      const displayInfoSpy = jasmine.createSpy('displayInfoSpy');
      const getPowerProfileSpy = jasmine.createSpy('getPowerProfileSpy')
        .and.returnValue(of());
      const closeSpy = jasmine.createSpy('closeSpy');

      MockInstance(AppqosService, 'postPowerProfiles', postPowerProfilesSpy);
      MockInstance(SnackBarService, 'displayInfo', displayInfoSpy);
      MockInstance(AppqosService, 'getPowerProfile', getPowerProfileSpy);
      MockInstance(MatDialogRef, 'close', closeSpy);

      const fixture = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({
        name: mockedProfile.name,
        minFreq: mockedProfile.min_freq,
        maxFreq: mockedProfile.max_freq,
        epp: 'Power'
      });
      fixture.detectChanges();

      const saveButton = ngMocks.find('.mat-flat-button');
      saveButton.triggerEventHandler('click', null);

      expect(postPowerProfilesSpy).toHaveBeenCalledOnceWith(mockedProfile);
      expect(displayInfoSpy).toHaveBeenCalledOnceWith(mockedMessage.message);
      expect(getPowerProfileSpy).toHaveBeenCalledTimes(1);
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it('it should update the power profile when edit is true', () => {
      const mockedProfile = {
        id: 0,
        name: 'profile_0',
        min_freq: 800,
        max_freq: 1200,
        epp: 'Power'
      };
      const mockedPostProfile: PostProfile = {
        name: mockedProfile.name,
        min_freq: mockedProfile.min_freq,
        max_freq: mockedProfile.max_freq,
        epp: 'power'
      };
      const mockedMessage: resMessage = {
        message: 'REST API'
      };

      const putPowerProfilesSpy = jasmine.createSpy('putPowerProfileSpy')
        .and.returnValue(of(mockedMessage));
      const displayInfoSpy = jasmine.createSpy('displayInfoSpy');
      const getPowerProfileSpy = jasmine.createSpy('getPowerProfileSpy')
        .and.returnValue(of());
      const closeSpy = jasmine.createSpy('closeSpy');

      MockInstance(AppqosService, 'putPowerProfile', putPowerProfilesSpy);
      MockInstance(SnackBarService, 'displayInfo', displayInfoSpy);
      MockInstance(AppqosService, 'getPowerProfile', getPowerProfileSpy);
      MockInstance(MatDialogRef, 'close', closeSpy);

      MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              profile: mockedProfile,
              edit: true
            }
          }
        ]
      });

      const saveButton = ngMocks.find('.mat-flat-button');
      saveButton.triggerEventHandler('click', null);

      expect(putPowerProfilesSpy).toHaveBeenCalledOnceWith(mockedPostProfile, mockedProfile.id);
      expect(displayInfoSpy).toHaveBeenCalledOnceWith(mockedMessage.message);
      expect(getPowerProfileSpy).toHaveBeenCalledTimes(1);
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it('it should handle POST power profiles error', () => {
      const mockedProfile = {
        name: 'profile_0',
        min_freq: '800',
        max_freq: '1200',
        epp: 'power'
      };
      const mockedError: Error = {
        name: 'error',
        message: 'REST API'
      };

      const postPowerProfileSpy = jasmine.createSpy('postPowerProfileSpy')
        .and.returnValue(throwError(() => mockedError));
      const handleErrorSpy = jasmine.createSpy('handleErrorSpy');

      MockInstance(AppqosService, 'postPowerProfiles', postPowerProfileSpy);
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);

      const fixture = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({
        name: mockedProfile.name,
        minFreq: mockedProfile.min_freq,
        maxFreq: mockedProfile.max_freq,
        epp: 'Power'
      });
      fixture.detectChanges();

      const saveButton = ngMocks.find('.mat-flat-button');
      saveButton.triggerEventHandler('click', null);

      expect(postPowerProfileSpy).toHaveBeenCalledOnceWith(mockedProfile);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });

    it('it should handle PUT power profiles error', () => {
      const mockedProfile = {
        id: 0,
        name: 'profile_0',
        min_freq: 800,
        max_freq: 1200,
        epp: 'Power'
      };
      const mockedPostProfile: PostProfile = {
        name: mockedProfile.name,
        min_freq: mockedProfile.min_freq,
        max_freq: mockedProfile.max_freq,
        epp: 'power'
      };
      const mockedError: Error = {
        name: 'error',
        message: 'REST API'
      };

      const putPowerProfileSpy = jasmine.createSpy('putPowerProfileSpy')
        .and.returnValue(throwError(() => mockedError));
      const handleErrorSpy = jasmine.createSpy('handleErrorSpy');

      MockInstance(AppqosService, 'putPowerProfile', putPowerProfileSpy);
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);

      MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              profile: mockedProfile,
              edit: true
            }
          }
        ]
      });

      const saveButton = ngMocks.find('.mat-flat-button');
      saveButton.triggerEventHandler('click', null);

      expect(putPowerProfileSpy).toHaveBeenCalledOnceWith(mockedPostProfile, mockedProfile.id);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });

    it('it should return if the form is invalid', () => {
      const mockedProfile = {
        name: '',
        min_freq: '80',
        max_freq: '120',
        epp: 'power'
      };

      const postPowerProfilesSpy = jasmine.createSpy('postPowerProfileSpy');

      MockInstance(AppqosService, 'postPowerProfiles', postPowerProfilesSpy);

      const fixture = MockRender(PowerProfileDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: mockedData
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({
        name: mockedProfile.name,
        minFreq: mockedProfile.min_freq,
        maxFreq: mockedProfile.max_freq,
        epp: 'Power'
      });
      fixture.detectChanges();

      const saveButton = ngMocks.find('.mat-flat-button');
      saveButton.triggerEventHandler('click', null);

      expect(postPowerProfilesSpy).not.toHaveBeenCalled();
    });
  });
});