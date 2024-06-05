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

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MockBuilder, MockInstance, MockRender, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';

import { SharedModule } from 'src/app/shared/shared.module';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { Pools } from '../overview.model';
import { L3CacheAllocationComponent } from './l3-cache-allocation.component';
import { CacheAllocation } from '../../system-caps/system-caps.model';
import { LocalService } from 'src/app/services/local.service';

describe('Given L3CacheAllocationComponent', () => {
  beforeEach(() =>
    MockBuilder(L3CacheAllocationComponent)
      .mock(SharedModule)
      .mock(Router)
      .mock(LocalService, {
        getL3CatEvent: () =>
          of({
            cache_size: 44040192,
            cdp_enabled: false,
            cdp_supported: false,
            clos_num: 15,
            cw_num: 12,
            cw_size: 3670016,
          }),
        convertToBitmask: LocalService.prototype.convertToBitmask,
      })
  );

  MockInstance.scope('case');

  describe('when initialized and available', () => {
    it('should display "L3 Cache Allocation Technology (CAT)" title', () => {
      const title = 'L3 Cache Allocation Technology (CAT)';
      MockRender(L3CacheAllocationComponent, { available: true });

      const expectedTitle = ngMocks.formatText(ngMocks.find('mat-card-title'));

      expect(expectedTitle).toEqual(title);
    });

    it('should get Cache way number', () => {
      const mockedPool: Pools[] = [
        {
          id: 0,
          mba_bw: 4294967295,
          l3cbm: 2047,
          name: 'Default',
          cores: [0, 1, 45, 46, 47],
        },
      ];

      const {
        point: { componentInstance: component },
      } = MockRender(L3CacheAllocationComponent, {
        available: true,
        pools: mockedPool
      });

      expect(component.l3cat!.cw_num).toEqual(12);
    });

    it('should display pool name', () => {
      const mockedPool: Pools[] = [
        {
          id: 0,
          mba_bw: 4294967295,
          l3cbm: 2047,
          name: 'Default',
          cores: [0, 1, 45, 46, 47],
        },
        {
          id: 1,
          mba_bw: 4294967295,
          l3cbm: 15,
          name: 'HP',
          cores: [10, 12, 15],
        },
        {
          id: 2,
          mba_bw: 4294967295,
          l3cbm: 2047,
          name: 'LP',
          cores: [16, 17, 14],
        },
      ];

      MockRender(L3CacheAllocationComponent, {
        available: true,
        pools: mockedPool
      });

      const expectedPoolName = ngMocks
        .findAll('.pool-name')
        .map((a) => ngMocks.formatText(a));

      expect(expectedPoolName.toString()).toEqual('Default,HP,LP');
    });

    it('should display l3cbm converted to binary', () => {
      const mockedPool: Pools[] = [
        {
          id: 0,
          mba_bw: 4294967295,
          l3cbm: 2047,
          name: 'Default',
          cores: [0, 1, 45, 46, 47],
        },
        {
          id: 1,
          mba_bw: 4294967295,
          l3cbm: 15,
          name: 'HP',
          cores: [10, 12, 15],
        },
        {
          id: 2,
          mba_bw: 4294967295,
          l3cbm: 2047,
          name: 'LP',
          cores: [16, 17, 14],
        },
      ];

      MockRender(L3CacheAllocationComponent, {
        available: true,
        pools: mockedPool,
      });

      const expectedCbm = ngMocks
        .findAll('.pool-cbm')
        .map((pool) => ngMocks.formatText(pool));

      expect(expectedCbm).toEqual([
        '0 1 1 1 1 1 1 1 1 1 1 1',
        '0 0 0 0 0 0 0 0 1 1 1 1',
        '0 1 1 1 1 1 1 1 1 1 1 1',
      ]);
    });

    it('it should display l3cbm code & data if cdp is enabled', async () => {
      const mockedL3Cat: CacheAllocation = {
        cache_size: 42,
        cdp_enabled: true,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3.5,
      };
      
      MockInstance(LocalService,'getL3CatEvent' , () => of(mockedL3Cat));
      
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

      const fixture = MockRender(L3CacheAllocationComponent, {
        available: true,
        pools: mockedPools,
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const expectedCbm = ngMocks
        .findAll('.pool-cbm')
        .map((pool) => ngMocks.formatText(pool));

      expect(expectedCbm).toEqual([
        '0 1 1 1 1 1 1 1 1 1 1 1',
        '0 0 0 1 1 1 1 1 1 1 1 1',
        '0 0 0 0 0 0 0 0 1 1 1 1',
        '1 1 1 1 1 1 1 1 1 0 0 0',
      ]);
    });

    it('it should display code and data label if cdp is enabled', async () => {
      const mockedL3Cat: CacheAllocation = {
        cache_size: 42,
        cdp_enabled: true,
        cdp_supported: true,
        clos_num: 15,
        cw_num: 12,
        cw_size: 3.5,
      };

      MockInstance(LocalService, 'getL3CatEvent', () => of(mockedL3Cat));
      
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

      const fixture = MockRender(L3CacheAllocationComponent, {
        available: true,
        pools: mockedPools,
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const label = ngMocks.formatText(
        ngMocks.find('.pool-cdp-label')
      );

      expect(label).toContain('Data');
      expect(label).toContain('Code');
    });
  });

  describe('when initialized and NOT available', () => {
    it('should display "Not currently available or supported" message', () => {
      const message = 'Not currently available or supported...';
      MockRender(L3CacheAllocationComponent, { available: false });

      const expectedTitle = ngMocks.formatText(ngMocks.find('h2'));

      expect(expectedTitle).toEqual(message);
    });

    it('should not display edit button', () => {
      MockRender(L3CacheAllocationComponent, { available: false });

      const editButton = ngMocks.find('.action-button', null);

      expect(editButton).toBeNull();
    });
  });

  describe('when click Edit button', () => {
    it('should open modal dialog', () => {
      const mockedPool: Pools[] = [
        {
          id: 0,
          mba_bw: 4294967295,
          l3cbm: 2047,
          name: 'Default',
          cores: [0, 1, 45, 46, 47],
        },
      ];

      const dialogSpy = jasmine.createSpy('dialog.open');

      MockInstance(MatDialog, 'open', dialogSpy).and.returnValue({
        afterClosed: () => of(null),
      });

      MockRender(L3CacheAllocationComponent, {
        available: true,
        pools: mockedPool
      });

      const editButton = ngMocks.find('.action-button');

      editButton.triggerEventHandler('click', {});

      expect(dialogSpy).toHaveBeenCalledWith(EditDialogComponent, {
        height: 'auto',
        width: '50rem',
        data: { l3cbm: true, numCacheWays: 12, l3cdp: false },
      });
    });
  });

  describe('when click "See more"', () => {
    it('should redirect to wiki page', () => {
      MockRender(L3CacheAllocationComponent, {
        available: true
      });

      const infoUrl = ngMocks.find('a').nativeElement.getAttribute('href');

      expect(infoUrl).toEqual(
        'https://www.intel.com/content/www/us/en/developer/articles/technical/introduction-to-cache-allocation-technology.html?wapkw=introduction%20to%20cache%20allocation'
      );
    });
  });
});
