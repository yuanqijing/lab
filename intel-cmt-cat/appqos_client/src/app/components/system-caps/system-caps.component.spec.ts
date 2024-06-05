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

import { MockBuilder, MockInstance, MockRender, ngMocks } from 'ng-mocks';
import { EMPTY, of, throwError } from 'rxjs';

import {
  MatButtonToggle,
  MatButtonToggleChange,
} from '@angular/material/button-toggle';

import { AppqosService } from 'src/app/services/appqos.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { SstcpComponent } from './sstcp/sstcp.component';
import { SystemCapsComponent } from './system-caps.component';
import { SnackBarService } from 'src/app/shared/snack-bar.service';
import {
  CacheAllocation, MBA,
  MBACTRL,
  RDTIface,
  SSTBF
} from './system-caps.model';
import { LocalService } from 'src/app/services/local.service';

describe('Given SystemCapsComponent', () => {
  beforeEach(() =>
    MockBuilder(SystemCapsComponent)
      .mock(SharedModule)
      .mock(AppqosService, {
        getRdtIface: () => EMPTY,
        getCaps: () =>
          of({
            capabilities: ['l3cat', 'l2cat', 'mba', 'sstbf', 'power'],
          }),
        getSstbf: () => EMPTY,
        getL3cat: () => EMPTY,
        getL2cat: () => EMPTY,
        getMba: () => EMPTY,
        getMbaCtrl: () => EMPTY,
        getPools: () => EMPTY
      })
      .mock(SnackBarService)
      .mock(SstcpComponent)
      .mock(LocalService, {
        getCapsEvent: () => of(mockedCaps),
        getL3CatEvent: () => of(mockedCache),
        getL2CatEvent: () => of(mockedCache),
        getMbaEvent: () => of(mockedMba),
        getMbaCtrlEvent: () => of(mockedMbaCtrl),
        getSstbfEvent: () => of(mockedSSTBF),
        getRdtIfaceEvent: () => of(mockedRDT),
        getData: LocalService.prototype.getData
      })
  );

  const mockedCaps = ['l3cat', 'l2cat', 'mba', 'sstbf', 'power'];

  const mockedCache: CacheAllocation = {
    cache_size: 42,
    cdp_enabled: false,
    cdp_supported: false,
    clos_num: 15,
    cw_num: 12,
    cw_size: 3.5,
  };

  const mockedSSTBF: SSTBF = {
    configured: false,
    hp_cores: [1, 2],
    std_cores: [1, 2],
  };

  const mockedMba: MBA = {
    clos_num: 12,
    mba_enabled: true,
    mba_bw_enabled: true,
  };

  const mockedMbaCtrl: MBACTRL = {
    enabled: false, supported: true
  };

  const mockedRDT: RDTIface = {
    interface: 'os',
    interface_supported: ['msr', 'os'],
  };

  const mockedError: Error = {
    name: 'Error',
    message: 'rest API error',
  };

  MockInstance.scope('case');

  describe('when initialized', () => {
    it('should display system name', () => {
      localStorage.setItem('api_url', 'https://localhost:5000');

      MockRender(SystemCapsComponent);

      const systemName = ngMocks.formatText(ngMocks.find('.system-name'));

      expect(systemName).toEqual('localhost');
    });

    it('should display title property in card ', () => {
      const title = 'System Capabilities';

      MockRender(SystemCapsComponent);

      const expectedTitle = ngMocks.formatText(ngMocks.find('.card-title'));

      expect(expectedTitle).toBe(title);
    });

    it('should get MBA data', () => {
      MockInstance(LocalService, 'getMbaEvent', () => of(mockedMba));
      MockInstance(LocalService, 'getMbaCtrlEvent', () => of(mockedMbaCtrl));
      const {
        point: { componentInstance: component },
      } = MockRender(SystemCapsComponent);

      expect(component.mba).toEqual({ ...mockedMba, ...mockedMbaCtrl });
    });

    it('should get RDT interface', () => {
      const {
        point: { componentInstance: component },
      } = MockRender(SystemCapsComponent);

      expect(component.rdtIface).toEqual(mockedRDT);
    });

    it('should get L3 CAT', () => {
      const {
        point: { componentInstance: component },
      } = MockRender(SystemCapsComponent);

      expect(component.l3cat).toEqual(mockedCache);
    });

    it('should get L2 CAT', () => {
      const {
        point: { componentInstance: component },
      } = MockRender(SystemCapsComponent);

      expect(component.l2cat).toEqual(mockedCache);
    });

    it('should get SST-BF', () => {
      const {
        point: { componentInstance: component },
      } = MockRender(SystemCapsComponent);

      expect(component.sstbf).toEqual(mockedSSTBF);
    });

    it('should get capabilities', () => {
      MockInstance(LocalService, 'getCapsEvent', () => of(mockedCaps));

      const {
        point: { componentInstance: component },
      } = MockRender(SystemCapsComponent);

      expect(component.caps).toEqual(mockedCaps);
    });
  });

  describe('when request is sent to back', () => {
    it('it should show display loading', () => {
      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.loading = true;
      fixture.detectChanges();

      const content = ngMocks.find('.loading', null);

      expect(content).toBeTruthy();
    });
  });

  describe('when request is finished', () => {
    it('it should NOT display loading', () => {
      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.loading = false;
      fixture.detectChanges();

      const content = ngMocks.find('.loading', null);

      expect(content).toBeNull();
    });
  });

  describe('when onChangeIface method is called', () => {
    it('it should call rdtIfacePut with correct value', () => {
      const mockResponse = 'RDT Interface modified';
      const rdtIfaceSpy = jasmine.createSpy('rdtIfacePut');
      const event: MatButtonToggleChange = {
        source: {} as MatButtonToggle,
        value: 'os',
      };

      MockInstance(AppqosService, 'rdtIfacePut', rdtIfaceSpy)
        .withArgs(event.value)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.onChangeIface(event);

      expect(rdtIfaceSpy).toHaveBeenCalledWith(event.value);
    });

    it('it should catch error', () => {
      const handleErrorSpy = jasmine.createSpy();
      const rdtIfaceSpy = jasmine.createSpy();
      const event: MatButtonToggleChange = {
        source: {} as MatButtonToggle,
        value: 'os',
      };

      MockInstance(SnackBarService, 'handleError', handleErrorSpy);
      MockInstance(AppqosService, 'rdtIfacePut', rdtIfaceSpy)
        .withArgs(event.value)
        .and.returnValue(throwError(() => mockedError));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.onChangeIface(event);

      expect(rdtIfaceSpy).toHaveBeenCalledWith(event.value);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });

    it('it should call _getMbaData', () => {
      const mockResponse = 'RDT Interface modified';
      const mockedMba: MBA = {
        clos_num: 12,
        mba_enabled: false,
        mba_bw_enabled: true,
      };

      const mockedMbaCtrl: MBACTRL = {
        enabled: false, supported: false
      };
      const rdtIfaceSpy = jasmine.createSpy('rdtIfacePut');
      const getMbaSpy = jasmine.createSpy('getMbaSpy')
        .and.returnValue(of(mockedMba));
      const getMbaCtrlSpy = jasmine.createSpy('getMbaCtrlSpy')
        .and.returnValue(of(mockedMbaCtrl));

      const event: MatButtonToggleChange = {
        source: {} as MatButtonToggle,
        value: 'os',
      };

      MockInstance(AppqosService, 'getMba', getMbaSpy);
      MockInstance(AppqosService, 'getMbaCtrl', getMbaCtrlSpy);

      MockInstance(AppqosService, 'rdtIfacePut', rdtIfaceSpy)
        .withArgs(event.value)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.onChangeIface(event);

      expect(rdtIfaceSpy).toHaveBeenCalledWith(event.value);
      expect(getMbaSpy).toHaveBeenCalledTimes(1);
      expect(getMbaCtrlSpy).toHaveBeenCalledTimes(1);
      expect(component.mba).toEqual({ ...mockedMba, ...mockedMbaCtrl });
    });

    it('it should handle _getMbaData error', () => {
      const mockResponse = 'RDT Interface modified';
      const mockedMbaError: Error = {
        name: 'Error',
        message: 'Mba GET Error',
      };
      const mockedMbaCtrlError: Error = {
        name: 'Error',
        message: 'MbaCtrl GET Error',
      };

      const rdtIfaceSpy = jasmine.createSpy('rdtIfacePut');
      const getMbaSpy = jasmine.createSpy('getMbaSpy')
        .and.returnValue(throwError(() => mockedMbaError));
      const getMbaCtrlSpy = jasmine.createSpy('getMbaCtrlSpy')
        .and.returnValue(throwError(() => mockedMbaCtrlError));
      const handleErrorSpy = jasmine.createSpy('handleErrorSpy');

      const event: MatButtonToggleChange = {
        source: {} as MatButtonToggle,
        value: 'os',
      };

      MockInstance(AppqosService, 'getMba', getMbaSpy);
      MockInstance(AppqosService, 'getMbaCtrl', getMbaCtrlSpy);

      MockInstance(AppqosService, 'rdtIfacePut', rdtIfaceSpy)
        .withArgs(event.value)
        .and.returnValue(of(mockResponse));
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.onChangeIface(event);

      expect(rdtIfaceSpy).toHaveBeenCalledWith(event.value);
      expect(getMbaSpy).toHaveBeenCalledTimes(1);
      expect(getMbaCtrlSpy).toHaveBeenCalledTimes(1);
      expect(handleErrorSpy).toHaveBeenCalledWith(mockedMbaError.message);
    });

    it('it should call _getRdtIface', () => {
      const mockResponse = 'RDT Interface modified';

      const rdtIfaceSpy = jasmine.createSpy('rdtIfacePut');
      const getRdtSpy = jasmine.createSpy('getRdtSpy')
        .and.returnValue(of(mockedRDT));

      const event: MatButtonToggleChange = {
        source: {} as MatButtonToggle,
        value: 'os',
      };

      MockInstance(AppqosService, 'getRdtIface', getRdtSpy);

      MockInstance(AppqosService, 'rdtIfacePut', rdtIfaceSpy)
        .withArgs(event.value)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.onChangeIface(event);

      expect(rdtIfaceSpy).toHaveBeenCalledWith(event.value);
      expect(getRdtSpy).toHaveBeenCalledTimes(1);
    });

    it('it should handle _getRdtIface error', () => {
      const mockResponse = 'RDT Interface modified';

      const rdtIfaceSpy = jasmine.createSpy('rdtIfacePut');
      const getRdtSpy = jasmine.createSpy('getRdtSpy')
        .and.returnValue(throwError(() => mockedError));
      const handleErrorSpy = jasmine.createSpy('handleErrorSpy');

      const event: MatButtonToggleChange = {
        source: {} as MatButtonToggle,
        value: 'os',
      };

      MockInstance(SnackBarService, 'handleError', handleErrorSpy);
      MockInstance(AppqosService, 'getRdtIface', getRdtSpy);

      MockInstance(AppqosService, 'rdtIfacePut', rdtIfaceSpy)
        .withArgs(event.value)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.onChangeIface(event);

      expect(rdtIfaceSpy).toHaveBeenCalledWith(event.value);
      expect(getRdtSpy).toHaveBeenCalledTimes(1);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });

    it('it should call _getSstbf', () => {
      const mockResponse = 'RDT Interface modified';
      const getSstbfSpy = jasmine.createSpy('getSstbfSpy')
        .and.returnValue(of(mockedSSTBF));
      const rdtIfaceSpy = jasmine.createSpy('rdtIfacePut');

      const event: MatButtonToggleChange = {
        source: {} as MatButtonToggle,
        value: 'os',
      };

      MockInstance(LocalService, 'getCapsEvent', () => of(mockedCaps));
      MockInstance(AppqosService, 'getSstbf', getSstbfSpy)
        .and.returnValue(of(mockedSSTBF));
      MockInstance(AppqosService, 'rdtIfacePut', rdtIfaceSpy)
        .withArgs(event.value)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.onChangeIface(event);

      expect(rdtIfaceSpy).toHaveBeenCalledWith(event.value);
      expect(getSstbfSpy).toHaveBeenCalledTimes(1);
      expect(component.sstbf).toEqual(mockedSSTBF);
    });

    it('it should handle _getSstbf error', () => {
      const mockResponse = 'RDT Interface modified';
      const getSstbfSpy = jasmine.createSpy('getSstbfSpy');
      const rdtIfaceSpy = jasmine.createSpy('rdtIfacePut');
      const handleErrorSpy = jasmine.createSpy('handleErrorSpy');

      const event: MatButtonToggleChange = {
        source: {} as MatButtonToggle,
        value: 'os',
      };

      MockInstance(LocalService, 'getCapsEvent', () => of(mockedCaps));
      MockInstance(AppqosService, 'getSstbf', getSstbfSpy)
        .and.returnValue(throwError(() => mockedError));
      MockInstance(AppqosService, 'rdtIfacePut', rdtIfaceSpy)
        .withArgs(event.value)
        .and.returnValue(of(mockResponse));
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.onChangeIface(event);

      expect(rdtIfaceSpy).toHaveBeenCalledWith(event.value);
      expect(getSstbfSpy).toHaveBeenCalledTimes(1);
      expect(component.sstbf).toEqual(mockedSSTBF);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });
  });

  describe('when l3CdpOnChange method is called', () => {
    it('it should call l3CdpPut with correct value', () => {
      const mockResponse = 'L3 CAT status changed';
      const l3CdpPutSpy = jasmine.createSpy();

      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: true,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      MockInstance(LocalService, 'getL3CatEvent', () => of(mockedCache));
      MockInstance(AppqosService, 'l3CdpPut', l3CdpPutSpy)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l3CdpOnChange();

      expect(l3CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
    });

    it('it should catch error', () => {
      const handleErrorSpy = jasmine.createSpy();
      const l3CdpPutSpy = jasmine.createSpy();
      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: false,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      MockInstance(LocalService, 'getL3CatEvent', () => of(mockedCache));
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);
      MockInstance(AppqosService, 'l3CdpPut', l3CdpPutSpy)
        .and.returnValue(throwError(() => mockedError));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l3CdpOnChange();

      expect(l3CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });

    it('it should call _getL3cat', () => {
      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: true,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      const mockResponse = 'L3 CAT status changed';
      const l3CdpPutSpy = jasmine.createSpy('l3CdpPutSpy');
      const getL3catSpy = jasmine.createSpy('getL3catSpy')
        .and.returnValue(of(mockedCache));

      MockInstance(LocalService, 'getL3CatEvent', () => of(mockedCache));
      MockInstance(AppqosService, 'getL3cat', getL3catSpy);
      MockInstance(AppqosService, 'l3CdpPut', l3CdpPutSpy)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l3CdpOnChange();

      expect(l3CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
      expect(getL3catSpy).toHaveBeenCalledTimes(1);
    });

    it('it should handle _getL3cat error', () => {
      const mockResponse = 'L3 CAT status changed';
      const handleErrorSpy = jasmine.createSpy('handleErrorSpy');
      const l3CdpPutSpy = jasmine.createSpy('l3CdpPutSpy');
      const getL3catSpy = jasmine.createSpy('getL3catSpy')
        .and.returnValue(throwError(() => mockedError));

      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: false,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      MockInstance(LocalService, 'getL3CatEvent', () => of(mockedCache));
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);
      MockInstance(AppqosService, 'getL3cat', getL3catSpy);
      MockInstance(AppqosService, 'l3CdpPut', l3CdpPutSpy)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l3CdpOnChange();

      expect(l3CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
      expect(getL3catSpy).toHaveBeenCalledTimes(1);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });
  });

  describe('when l2CdpOnChange method is called', () => {
    it('it should call l2CdpPut with correct value', () => {
      const mockResponse = 'L2 CAT status changed';
      const l2CdpPutSpy = jasmine.createSpy();
      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: true,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      MockInstance(LocalService, 'getL2CatEvent', () => of(mockedCache));
      MockInstance(AppqosService, 'l2CdpPut', l2CdpPutSpy)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l2CdpOnChange();

      expect(l2CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
    });

    it('it should catch error', () => {
      const handleErrorSpy = jasmine.createSpy();
      const l2CdpPutSpy = jasmine.createSpy();
      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: false,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      MockInstance(LocalService, 'getL2CatEvent', () => of(mockedCache));

      MockInstance(SnackBarService, 'handleError', handleErrorSpy);
      MockInstance(AppqosService, 'l2CdpPut', l2CdpPutSpy)
        .and.returnValue(throwError(() => mockedError));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l2CdpOnChange();

      expect(l2CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });

    it('it should call _getL2cat', () => {
      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: true,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      const mockResponse = 'L2 CAT status changed';
      const l2CdpPutSpy = jasmine.createSpy('l2CdpPutSpy');
      const getL2catSpy = jasmine.createSpy('getL2catSpy')
        .and.returnValue(of(mockedCache));

      MockInstance(LocalService, 'getL2CatEvent', () => of(mockedCache));
      MockInstance(AppqosService, 'getL2cat', getL2catSpy);
      MockInstance(AppqosService, 'l2CdpPut', l2CdpPutSpy)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l2CdpOnChange();

      expect(l2CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
      expect(getL2catSpy).toHaveBeenCalledTimes(1);
    });

    it('it should handle _getL2cat error', () => {
      const mockResponse = 'L2 CAT status changed';
      const handleErrorSpy = jasmine.createSpy('handleErrorSpy');
      const l2CdpPutSpy = jasmine.createSpy('l2CdpPutSpy');
      const getL2catSpy = jasmine.createSpy('getL2catSpy')
        .and.returnValue(throwError(() => mockedError));

      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: false,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      MockInstance(LocalService, 'getL2CatEvent', () => of(mockedCache));
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);
      MockInstance(AppqosService, 'getL2cat', getL2catSpy);
      MockInstance(AppqosService, 'l2CdpPut', l2CdpPutSpy)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l2CdpOnChange();

      expect(l2CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
      expect(getL2catSpy).toHaveBeenCalledTimes(1);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });

    it('it should handle _getPools error', () => {
      const mockResponse = 'L2 CAT status changed';
      const handleErrorSpy = jasmine.createSpy('handleErrorSpy');
      const l2CdpPutSpy = jasmine.createSpy('l2CdpPutSpy');
      const getPoolsSpy = jasmine.createSpy('getPoolsSpy')
        .and.returnValue(throwError(() => mockedError));

      const mockedCache: CacheAllocation = {
        cache_size: 44040192,
        cdp_enabled: true,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3670016
      };

      MockInstance(LocalService, 'getL2CatEvent', () => of(mockedCache));
      MockInstance(SnackBarService, 'handleError', handleErrorSpy);
      MockInstance(AppqosService, 'getPools', getPoolsSpy);
      MockInstance(AppqosService, 'l2CdpPut', l2CdpPutSpy)
        .and.returnValue(of(mockResponse));

      const fixture = MockRender(SystemCapsComponent);
      const component = fixture.point.componentInstance;

      component.l2CdpOnChange();

      expect(l2CdpPutSpy).toHaveBeenCalledWith(!mockedCache.cdp_enabled);
      expect(getPoolsSpy).toHaveBeenCalledTimes(1);
      expect(handleErrorSpy).toHaveBeenCalledOnceWith(mockedError.message);
    });
  });
});
