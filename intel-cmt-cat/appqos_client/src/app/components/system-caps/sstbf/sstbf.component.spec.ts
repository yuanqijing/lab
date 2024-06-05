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

import { SharedModule } from 'src/app/shared/shared.module';
import { SSTBF } from '../system-caps.model';
import { SstbfComponent } from './sstbf.component';

describe('Given SstbfComponent', () => {
  beforeEach(() => MockBuilder(SstbfComponent).mock(SharedModule));

  MockInstance.scope('case');

  describe('when initialized', () => {
    it('should display "SST-BF" title', () => {
      const mockedSSTBF: SSTBF = {
        configured: true,
        hp_cores: [1, 2],
        std_cores: [1, 2],
      };

      MockRender(SstbfComponent, {
        isSupported: true,
        sstbf: mockedSSTBF,
      });

      const expectValue = ngMocks.formatText(ngMocks.find('div'));

      expect(expectValue).toEqual('SST-BF');
    });
  });

  describe('when initialized and SST-BF is supported', () => {
    it('should display "Available Yes" text', () => {
      const mockedSSTBF: SSTBF = {
        configured: true,
        hp_cores: [1, 2],
        std_cores: [1, 2],
      };

      MockRender(SstbfComponent, {
        isSupported: true,
        sstbf: mockedSSTBF,
      });

      const template = ngMocks.formatText(ngMocks.find('.positive'));

      expect(template).toEqual('Yes');
    });
  });

  describe('when initialized and SST-BF is NOT supported', () => {
    it('should NOT display SST-BF details', () => {
      const mockedSSTBF: SSTBF = {
        configured: false,
        hp_cores: [1, 2],
        std_cores: [1, 2],
      };

      MockRender(SstbfComponent, {
        isSupported: false,
        sstbf: mockedSSTBF,
      });

      const template = ngMocks.find('mat-list-item', null);

      expect(template).toBeNull();
    });

    it('should display "Available No" text', () => {
      const mockedSSTBF: SSTBF = {
        configured: false,
        hp_cores: [1, 2],
        std_cores: [1, 2],
      };

      MockRender(SstbfComponent, {
        isSupported: false,
        sstbf: mockedSSTBF,
      });

      const template = ngMocks.formatText(ngMocks.find('.negative'));

      expect(template).toEqual('No');
    });
  });

  describe('when initialized and SST-BF is supported and configured', () => {
    it('should display "Available Yes" and "Configured Yes" text', () => {
      const mockedSSTBF: SSTBF = {
        configured: true,
        hp_cores: [1, 2],
        std_cores: [1, 2],
      };

      MockRender(SstbfComponent, {
        isSupported: true,
        sstbf: mockedSSTBF,
      });

      const templates = ngMocks.formatText(ngMocks.findAll('.positive'));

      expect(templates.length).toBe(2);
      templates.forEach((template)=> {
        expect(template).toEqual('Yes');
      });
    });
  });
});
