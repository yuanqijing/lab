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

import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { skip } from 'rxjs';
import { CacheAllocation, MBA, MBACTRL, RDTIface, SSTBF } from '../components/system-caps/system-caps.model';
import { LocalService } from './local.service';
import { Apps, Pools } from '../components/overview/overview.model';

describe('Given LocalService', () => {
  beforeEach(() => MockBuilder(LocalService));

  const mockedL3cat: CacheAllocation = {
    cache_size: 20,
    cdp_enabled: true,
    cdp_supported: false,
    clos_num: 23,
    cw_num: 10,
    cw_size: 30
  };

  const mockedL2cat: CacheAllocation = {
    cache_size: 20,
    cdp_enabled: true,
    cdp_supported: false,
    clos_num: 23,
    cw_num: 10,
    cw_size: 30
  };

  const mockedCaps: string[] = [
    'l3cat',
    'l2cat',
    'mba',
  ];

  const mockedSSTBF: SSTBF = {
    configured: true,
    hp_cores: [1, 2],
    std_cores: [1, 2],
  };

  const mockedMba: MBA = {
    mba_enabled: false,
    mba_bw_enabled: false,
    clos_num: 7
  };

  const mockedPools: Pools[] = [
    {
      id: 0,
      mba_bw: 4294967295,
      l3cbm_code: 2047,
      l3cbm_data: 511,
      name: 'Default',
      cores: [0, 1, 45, 46, 47],
    },
    {
      id: 1,
      mba_bw: 4294967295,
      l3cbm_code: 15,
      l3cbm_data: 4088,
      name: 'HP',
      cores: [10, 12, 15],
    }
  ];

  const mockedApps: Apps[] = [
    {
      id: 1,
      name: 'test',
      pids: [1, 2, 3],
      pool_id: 0,
    },
  ];

  MockInstance.scope('case');

  describe('when saveData method is executed', () => {
    it('should store data to the LocalStorage', () => {
      const {
        point: { componentInstance: service },
      } = MockRender(LocalService);

      service.saveData('api_url', 'localhost:5000');

      expect(localStorage.getItem('api_url')).toBe('localhost:5000');
    });
  });

  describe('when getData method is executed', () => {
    it('should return data from LocalStorage', () => {
      const {
        point: { componentInstance: service },
      } = MockRender(LocalService);

      localStorage.setItem('api_url', 'localhost:5000');

      const expectedValue = service.getData('api_url');

      expect(expectedValue).toBe('localhost:5000');
    });
  });

  describe('when clearData method is executed', () => {
    it('should clear data from LocalStorage', () => {
      const {
        point: { componentInstance: service },
      } = MockRender(LocalService);

      localStorage.setItem('api_url', 'localhost:5000');

      service.clearData();

      expect(service.getData('api_url')).toBeNull();
    });
  });

  describe('when isLoggedIn method is executed and LocalStorage is null', () => {
    it('should return false', () => {
      const {
        point: { componentInstance: service },
      } = MockRender(LocalService);

      service.clearData();

      const expectedValue = service.isLoggedIn();

      expect(expectedValue).toBeFalse();
    });
  });

  describe('when isLoggedIn method is executed and LocalStorage is NOT null', () => {
    it('should return true', () => {
      const {
        point: { componentInstance: service },
      } = MockRender(LocalService);

      service.saveData('api_url', 'localhost:5000');

      const expectedValue = service.isLoggedIn();

      expect(expectedValue).toBeTrue();
    });
  });

  describe('when setIfaceEvent method is executed', () => {
    it('should emit ifaceEvent', (done: DoneFn) => {
      const mockedRDT: RDTIface = {
        interface: 'os',
        interface_supported: ['msr', 'os'],
      };
      
      const {
        point: { componentInstance: service },
      } = MockRender(LocalService);

      service.rdtIFace.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedRDT);

        done();
      });

      service.setRdtIfaceEvent(mockedRDT);
    });
  });

  describe('when getIfaceEvent method is executed', () => {
    it('should detect changes', (done: DoneFn) => {
      const mockedRDT: RDTIface = {
        interface: 'os',
        interface_supported: ['msr', 'os'],
      };

      const {
        point: { componentInstance: service },
      } = MockRender(LocalService);

      service.getRdtIfaceEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedRDT);

        done();
      });

      service.rdtIFace.next(mockedRDT);
    });
  });

  describe('when setL3CatEvent method is executed', () => {
    it('should emit L3cat', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      //skip() is used as the event will pass null when subscribing to it
      service.l3cat.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedL3cat);

        done();
      });

      service.setL3CatEvent(mockedL3cat);
    });
  });

  describe('when getL3CatEvent method is executed', () => {
    it('should detect change', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getL3CatEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedL3cat);

        done();
      });

      service.l3cat.next(mockedL3cat);
    });
  });

  describe('when getL3CatCurrentValue method is excuted', () => {
    it('it should return current l3cat', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.setL3CatEvent(mockedL3cat);

      expect(service.getL3CatCurrentValue()).toBe(mockedL3cat);
    });
  });

  describe('when setL2CatEvent method is executed', () => {
    it('it should emit', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.l2cat.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedL2cat);

        done();
      });

      service.setL2CatEvent(mockedL2cat);
    });
  });

  describe('when getL2CatEvent method is executed', () => {
    it('should detect change', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getL2CatEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedL2cat);

        done();
      });

      service.l2cat.next(mockedL2cat);
    });
  });

  describe('when getL2CatCurrentValue method is excuted', () => {
    it('it should return current l2cat', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.setL2CatEvent(mockedL2cat);

      expect(service.getL2CatCurrentValue()).toBe(mockedL2cat);
    });
  });

  describe('when setCapsEvent method is executed', () => {
    it('it should emit', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.caps.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedCaps);

        done();
      });

      service.setCapsEvent(mockedCaps);
    });
  });

  describe('when getCapsEvent method is executed', () => {
    it('should detect change', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getCapsEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedCaps);

        done();
      });

      service.caps.next(mockedCaps);
    });
  });

  describe('when setMbaCtrlEvent method is executed', () => {
    it('it should emit mbaCtrl (Supported & Enabled)', (done: DoneFn) => {
      const mockedMbaCtrl: MBACTRL = {
        enabled: true,
        supported: true
      };

      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.mbaCtrl.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedMbaCtrl);

        done();
      });

      service.setMbaCtrlEvent(mockedMbaCtrl);
    });

    it('it should emit mbaCtrl (Not Supported & Disabled)', (done: DoneFn) => {
      const mockedMbaCtrl: MBACTRL = {
        enabled: false,
        supported: false
      };
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.mbaCtrl.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedMbaCtrl);

        done();
      });

      service.setMbaCtrlEvent(mockedMbaCtrl);
    });
  });

  describe('when getMbaCtrlEvent method is executed', () => {
    it('should detect change (Supported & Enabled)', (done: DoneFn) => {
      const mockedMbaCtrl: MBACTRL = {
        enabled: true,
        supported: true
      };
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getMbaCtrlEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedMbaCtrl);

        done();
      });

      service.mbaCtrl.next(mockedMbaCtrl);
    });

    it('should detect change (Not Supported & Disabled)', (done: DoneFn) => {
      const mockedMbaCtrl: MBACTRL = {
        enabled: false,
        supported: false
      };
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getMbaCtrlEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedMbaCtrl);

        done();
      });

      service.mbaCtrl.next(mockedMbaCtrl);
    });
  });

  describe('when parseNumberList method is called', () => {
    it('should return array of numbers 1 to 11 when given "1-10,11"', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const testString = '1-10,11';
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      expect(
        service.parseNumberList(testString)
      ).toEqual(numbers);
    });

    it('should return array of numbers 1 to 11 when given "1,2,3,4-11"', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const testString = '1,2,3,4-11';
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      expect(service.parseNumberList(testString)).toEqual(numbers);
    });

    it('should return array of numbers 1 to 11 when given "11-1"', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const testString = '11-1';
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      expect(service.parseNumberList(testString)).toEqual(numbers);
    });

    it('should return array of numbers 1 to 15 when given "11-7,3,15,12-14,1,2,6-4"', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const testString = '11-7,3,15,12-14,1,2,6-4';
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

      expect(service.parseNumberList(testString)).toEqual(numbers);
    });

    it('should return array of numbers 1 to 5 when given "3,2,1,1,2,3,4,5-1,4"', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const testString = '3,2,1,1,2,3,4,5-1,4';
      const numbers = [1, 2, 3, 4, 5];

      expect(service.parseNumberList(testString)).toEqual(numbers);
    });

    it('should return array of numbers 4156985 to 4156992' +
      'when given "4156985,4156986,4156987,4156988-4156992"', () => {
        const {
          point: { componentInstance: service }
        } = MockRender(LocalService);

        const testString = '4156985,4156986,4156987,4156988-4156992';
        const numbers = [4156985, 4156986, 4156987,
          4156988, 4156989, 4156990, 4156991, 4156992];

        expect(service.parseNumberList(testString)).toEqual(numbers);
      });

    it('should return an array of numbers 1126973 to 1126984 ' +
      'when given "1126984-1126973"', () => {
        const {
          point: { componentInstance: service }
        } = MockRender(LocalService);

        const testString = '1126984-1126973';
        const numbers = [1126973, 1126974, 1126975, 1126976,
          1126977, 1126978, 1126979, 1126980, 1126981, 1126982, 1126983, 1126984];

        expect(service.parseNumberList(testString)).toEqual(numbers);
      });
  });

  describe('when convertToBitmask is called', () => {
    it('it should return correct bitmask when given 63 & 12', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const cbm = 63;
      const cw_num = 12;
      const expectedBitmask = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1];

      expect(service.convertToBitmask(cbm, cw_num)).toEqual(expectedBitmask);
    });

    it('it should return correct bitmask when given 1008 & 12', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const cbm = 1008;
      const cw_num = 12;
      const expectedBitmask = [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0];

      expect(service.convertToBitmask(cbm, cw_num)).toEqual(expectedBitmask);
    });

    it('it should return correct bitmask when given 224 & 12', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const cbm = 224;
      const cw_num = 16;
      const expectedBitmask = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0];

      expect(service.convertToBitmask(cbm, cw_num)).toEqual(expectedBitmask);
    });

    it('it should return correct bitmask when given 4095 & 10', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const cbm = 1023;
      const cw_num = 10;
      const expectedBitmask = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

      expect(service.convertToBitmask(cbm, cw_num)).toEqual(expectedBitmask);
    });

    it('it should return correct bitmask when given 2046 & 12', () => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      const cbm = 127;
      const cw_num = 8;
      const expectedBitmask = [0, 1, 1, 1, 1, 1, 1, 1];

      expect(service.convertToBitmask(cbm, cw_num)).toEqual(expectedBitmask);
    });
  });

  describe('when setSstbfEvent method is executed', () => {
    it('should emit SSTBF', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.sstbf.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedSSTBF);

        done();
      });

      service.setSstbfEvent(mockedSSTBF);
    });
  });

  describe('when getSstbfEvent method is executed', () => {
    it('should detect change', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getSstbfEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedSSTBF);

        done();
      });

      service.sstbf.next(mockedSSTBF);
    });
  });

  describe('when setMbaEvent method is executed', () => {
    it('should emit Mba', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.mba.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedMba);

        done();
      });

      service.setMbaEvent(mockedMba);
    });
  });

  describe('when getMbaEvent method is executed', () => {
    it('should detect change', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getMbaEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedMba);

        done();
      });

      service.mba.next(mockedMba);
    });
  });

  describe('when setPoolsEvent method is executed', () => {
    it('should emit pools', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.pools.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedPools);

        done();
      });

      service.setPoolsEvent(mockedPools);
    });
  });

  describe('when getPoolsEvent method is executed', () => {
    it('should detect change', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getPoolsEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedPools);

        done();
      });

      service.pools.next(mockedPools);
    });
  });

  describe('when setAppsEvent method is executed', () => {
    it('should emit Apps', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.apps.pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedApps);

        done();
      });

      service.setAppsEvent(mockedApps);
    });
  });

  describe('when getAppsEvent method is executed', () => {
    it('should detect change', (done: DoneFn) => {
      const {
        point: { componentInstance: service }
      } = MockRender(LocalService);

      service.getAppsEvent().pipe(skip(1)).subscribe((event) => {
        expect(event).toBe(mockedApps);

        done();
      });

      service.apps.next(mockedApps);
    });
  });
});
