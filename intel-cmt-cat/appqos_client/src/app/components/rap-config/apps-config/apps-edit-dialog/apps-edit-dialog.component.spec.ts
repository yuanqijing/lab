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

import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatError } from "@angular/material/form-field";
import { MockBuilder, MockInstance, MockRender, ngMocks } from "ng-mocks";
import { Apps, Pools } from "src/app/components/overview/overview.model";
import { resMessage } from "src/app/components/system-caps/system-caps.model";
import { AppqosService } from "src/app/services/appqos.service";
import { LocalService } from "src/app/services/local.service";
import { SharedModule } from "src/app/shared/shared.module";
import { SnackBarService } from "src/app/shared/snack-bar.service";
import { AppsEditDialogComponent } from "./apps-edit-dialog.component";
import { of, throwError } from "rxjs";
import { MatSelect, MatSelectChange } from "@angular/material/select";

describe('Given AppsEditDialog component', () => {
  MockInstance.scope('case');
  
  beforeEach(() => {
    parseNumberListSpy = spyOn(LocalService.prototype, 'parseNumberList').and.callThrough();
    MockInstance(LocalService, 'parseNumberList', parseNumberListSpy);

    return MockBuilder(AppsEditDialogComponent)
      .mock(SharedModule)
      .mock(LocalService)
      .mock(AppqosService)
      .mock(SnackBarService)
      .mock(MatDialogRef);
  });

  let parseNumberListSpy: any;

  type PostApp = Omit<Apps, 'id'>;

  const mockedPools: Pools[] = [
    { id: 0, name: 'pool_0', cores: [1, 2, 3] },
    { id: 1, name: 'pool_1', cores: [4, 5, 6] },
    { id: 2, name: 'pool_2', cores: [7, 8, 9] }
  ];

  const mockApp: Apps = {
    id: 0,
    name: 'app_0',
    pids: [4156985, 4156986, 4156987],
    cores: mockedPools[0].cores,
    pool_id: 0
  };

  describe('when initialise', () => {
    it('it should populate input fields', () => {
      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      expect(component.form.controls['name'].value).toBe(mockApp.name);
      expect(component.form.controls['pids'].value).toBe(mockApp.pids.toString());
      expect(component.form.controls['cores'].value).toBe(mockedPools[0].cores.toString());
      expect(component.form.controls['pool'].value).toBe(mockApp.pool_id);
    });

    it('it should populate the correct cores', () => {
      const mockedApp: Apps = {
        id: 0,
        name: 'app_0',
        pids: [4156985, 4156986, 4156987],
        cores: [2],
        pool_id: 0
      };

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockedApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      expect(component.form.controls['cores'].value)
        .toBe(mockedApp.cores?.toString());
    });

    it('it should popluate the correct cores if undefined', () => {
      const mockedApp: Apps = {
        id: 0,
        name: 'app_0',
        pids: [4156985, 4156986, 4156987],
        pool_id: 0
      };

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockedApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      expect(component.form.controls['cores'].value)
        .toBe(mockedPools[0].cores.toString());
    });
  });

  describe('when form is invalid ', () => {
    it('it should display required error', () => {
      const name = '';
      const pids = '';
      const nameError = 'name is required';
      const pidsError = 'pids is required!';

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({ name, pids });
      fixture.detectChanges();

      const errors = ngMocks.findAll(MatError);

      const errorMessages = ngMocks.formatText(errors);

      expect(errorMessages.includes(nameError)).toBeTrue();
      expect(errorMessages.includes(pidsError)).toBeTrue();
    });

    it('it should display max length error', () => {
      let name = 'P';
      for (let i = 0; i < 90; i++) {
        name = `${name}p`;
      }

      let cores = '1';
      for (let i = 0; i < 4096; i++) {
        cores += `1`;
      }

      const nameError = 'max length 80 characters';
      const pidsError = 'max length 4096 characters';
      const coresError = 'max length 4096 characters';

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.form.patchValue({ name, pids: cores, cores });
      fixture.detectChanges();

      const errors = ngMocks.findAll(MatError);

      const errorMessages = ngMocks.formatText(errors);

      expect(errorMessages.includes(nameError)).toBeTrue();
      expect(errorMessages.includes(pidsError)).toBeTrue();
      expect(errorMessages.includes(coresError)).toBeTrue();
    });
  });

  it('it should display the pattern error', () => {
    const pids = '4156985-4156991, 4156992-4156998';
    const cores = '1,3,4-7,,8-11';

    const pidsError = 'List of PID’s e.g. 2651, 2665 or 6490-6510';
    const coresError = 'List of CORE’s e.g. 1,2 or 1,2-5 or 1-5';

    const fixture = MockRender(AppsEditDialogComponent, {}, {
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { pools: mockedPools, app: mockApp }
        }
      ]
    });
    const component = fixture.point.componentInstance;

    component.form.patchValue({ cores, pids });
    fixture.detectChanges();

    const errors = ngMocks.findAll(MatError);

    const errorMessages = ngMocks.formatText(errors);

    expect(errorMessages.includes(pidsError)).toBeTrue();
    expect(errorMessages.includes(coresError)).toBeTrue();
  });

  describe('when saveApp method is called', () => {
    it('it should return if the form is invalid', () => {
      const name = '';
      const pids = '';
      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      const updateAppSpy = spyOn(component, 'updateApp');

      component.form.patchValue({ name, pids });
      fixture.detectChanges();

      const updateButton = ngMocks.find('#update-button');
      updateButton.triggerEventHandler('click', null);

      expect(updateAppSpy).not.toHaveBeenCalled();
    });

    it('it should save the app using app cores when specified', () => {
      const name = 'app';
      const pids = '41539-41545';
      const cores = '2';
      const pidsList = [41539, 41540, 41541, 41542, 41543, 41544, 41545];
      const coresList = [2];
      const poolID = 0;

      const mockedPostApp: PostApp = {
        name: name,
        pids: pidsList,
        cores: coresList,
        pool_id: poolID
      };

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;
      component.form.patchValue({ name, pids, cores });

      const updateAppSpy = spyOn(component, 'updateApp');

      const updateButton = ngMocks.find('#update-button');
      updateButton.triggerEventHandler('click', null);

      expect(updateAppSpy).toHaveBeenCalledWith(mockedPostApp);
    });

    it('it should save the app using pool cores when not specified', () => {
      const name = 'app';
      const pids = '41539,41545';
      const cores = '';
      const pidsList = [41539, 41545];
      const poolID = 0;

      const mockedPostApp: PostApp = {
        name: name,
        pids: pidsList,
        cores: mockedPools[poolID].cores,
        pool_id: poolID
      };

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;
      component.form.patchValue({ name, pids, cores });

      const updateAppSpy = spyOn(component, 'updateApp');

      const updateButton = ngMocks.find('#update-button');
      updateButton.triggerEventHandler('click', null);

      expect(updateAppSpy).toHaveBeenCalledWith(mockedPostApp);
    });
  });

  describe('when updateApp method is called', () => {
    const appId = 0;
    const mockedPostApp: PostApp = {
      name: 'app',
      pids: [45836, 45837, 45838, 45839, 45840],
      pool_id: 0,
      cores: [1, 2, 3]
    };

    it('it should handle response', () => {
      const mockedResponse: resMessage = {
        message: `APP ${appId} updated`
      };

      const appPutSpy = jasmine.createSpy().and.returnValue(of(mockedResponse));
      const displayInfoSpy = jasmine.createSpy();
      const closeSpy = jasmine.createSpy();

      MockInstance(AppqosService, 'appPut', appPutSpy);
      MockInstance(SnackBarService, 'displayInfo', displayInfoSpy);
      MockInstance(MatDialogRef, 'close', closeSpy);

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;
      component.updateApp(mockedPostApp);

      expect(appPutSpy).toHaveBeenCalledOnceWith(mockedPostApp, appId);
      expect(displayInfoSpy).toHaveBeenCalledOnceWith(mockedResponse.message);
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it('it should handle error', () => {
      const mockedError: Error = {
        name: 'error',
        message: `APP ${appId} not updated`
      };

      const appPutSpy = jasmine.createSpy().and.returnValue(
        throwError(() => mockedError)
      );
      const handleErrorSpy = jasmine.createSpy();

      MockInstance(AppqosService, 'appPut', appPutSpy);
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;
      component.updateApp(mockedPostApp);

      expect(appPutSpy).toHaveBeenCalledOnceWith(mockedPostApp, appId);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });
  });

  describe('when getPids method is called', () => {
    it('it should call parseNumberList', () => {
      const pids = '36951-36959';
      const pidsList = [
        36951, 36952, 36953, 36954, 36955, 36956, 36957, 36958, 36959
      ];

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.getPids(pids);
      expect(parseNumberListSpy).toHaveBeenCalledOnceWith(pids);
      expect(component.pidsList).toEqual(pidsList);
    });

    it('it should split pids string', () => {
      const pids = '2105,2106';
      const pidsList = [
        2105, 2106
      ];

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.getPids(pids);
      expect(component.pidsList).toEqual(pidsList);
    });
  });

  describe('when getCores method is called', () => {
    it('it should call parseNumberList', () => {
      const cores = '23-31';
      const coresList = [23, 24, 25, 26, 27, 28, 29, 30, 31];

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.getCores(cores);
      expect(parseNumberListSpy).toHaveBeenCalledOnceWith(cores);
      expect(component.coresList).toEqual(coresList);
    });

    it('it should split cores string', () => {
      const cores = '41,42';
      const coresList = [41, 42];

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.getCores(cores);
      expect(component.coresList).toEqual(coresList);
    });

    it('it should throw error if cores exceeds MAX_CORES', () => {
      const cores = '1025';
      const coresList = [1025];
      const coresError = 'limit cores to maximum number of 1024';

      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      component.getCores(cores);
      fixture.detectChanges();

      const expectCoresError = ngMocks.formatText(
        ngMocks.find(MatError)
      );

      expect(expectCoresError).toBe(coresError);
      expect(component.coresList).toEqual(coresList);
    });
  });

  describe('when user changes pool', () => {
    const mockApp: Apps = {
      id: 1,
      name: 'app_2',
      pids: [4156985, 4156986],
      cores: [2],
      pool_id: 0
    };

    it('it should display the correct cores for the current app', () => {
      const poolId = mockApp.pool_id;
      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      const event: MatSelectChange = {
        source: {} as MatSelect,
        value: poolId
      };

      component.poolChange(event);

      expect(component.form.controls['cores'].value)
        .toBe(mockApp.cores?.toString());
    });

    it('it should display the correct cores for that pool', () => {
      const poolId = 1;
      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      const event: MatSelectChange = {
        source: {} as MatSelect,
        value: poolId
      };

      component.poolChange(event);

      expect(component.form.controls['cores'].value)
        .toBe(mockedPools[poolId].cores.toString());
    });
  });

  describe('when getPoolCores method is called', () => {
    it('it should return the correct cores', () => {
      const fixture = MockRender(AppsEditDialogComponent, {}, {
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: { pools: mockedPools, app: mockApp }
          }
        ]
      });
      const component = fixture.point.componentInstance;

      expect(component.getPoolCores(0)).toEqual(mockedPools[0].cores);
      expect(component.getPoolCores(2)).toEqual(mockedPools[2].cores);
    });
  });
});
