################################################################################
# BSD LICENSE
#
# Copyright(c) 2019-2023 Intel Corporation. All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions
# are met:
#
#   * Redistributions of source code must retain the above copyright
#     notice, this list of conditions and the following disclaimer.
#   * Redistributions in binary form must reproduce the above copyright
#     notice, this list of conditions and the following disclaimer in
#     the documentation and/or other materials provided with the
#     distribution.
#   * Neither the name of Intel Corporation nor the names of its
#     contributors may be used to endorse or promote products derived
#     from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
################################################################################

"""
Unit tests for L3 CAT module.
"""

from __future__ import absolute_import, division, print_function
import ctypes
import unittest

from unittest.mock import MagicMock, patch

from pqos.test.helper import ctypes_ref_set_int, ctypes_build_array

from pqos.l3ca import PqosCatL3
from pqos.native_struct import CPqosL3Ca, CPqosL3CaMask



class TestPqosCatL3(unittest.TestCase):
    "Tests for PqosCatL3 class."

    def test_cos_no_masks(self):
        "Tests PqosCatL3.COS class construction when no masks are given."

        with self.assertRaises(ValueError):
            PqosCatL3.COS(1)

    @patch('pqos.l3ca.Pqos')
    def test_set(self, pqos_mock_cls):
        "Tests set() method."

        def pqos_l3ca_set_mock(socket, num_ca, l3_ca_arr):
            "Mock pqos_l3ca_set()."

            self.assertEqual(socket, 0)
            self.assertEqual(num_ca, 1)

            cos = l3_ca_arr[0]
            self.assertEqual(cos.class_id, 4)
            self.assertEqual(cos.cdp, 1)
            self.assertEqual(cos.u.s.data_mask, 0x0f)
            self.assertEqual(cos.u.s.code_mask, 0x1f)

            return 0

        lib = pqos_mock_cls.return_value.lib
        lib.pqos_l3ca_set = MagicMock(side_effect=pqos_l3ca_set_mock)

        l3ca = PqosCatL3()
        cos = l3ca.COS(4, data_mask='0x0f', code_mask=0x1f)
        l3ca.set(0, [cos])

        lib.pqos_l3ca_set.assert_called_once()

    @patch('pqos.l3ca.Pqos')
    def test_get(self, pqos_mock_cls):
        "Tests get() method."
        # pylint: disable=invalid-name

        def pqos_l3ca_get_mock(socket, cos_num, num_ca_ref, l3cas):
            "Mock pqos_l3ca_get()."

            self.assertEqual(socket, 1)
            self.assertEqual(cos_num, 2)

            cos_c = CPqosL3Ca(class_id=0, u=CPqosL3CaMask(ways_mask=0x01fe))
            cos2_c = CPqosL3Ca(class_id=1, u=CPqosL3CaMask(ways_mask=0x003f))
            cos_arr_c = ctypes_build_array([cos_c, cos2_c])

            ctypes.memmove(l3cas, cos_arr_c, ctypes.sizeof(cos_arr_c))
            ctypes_ref_set_int(num_ca_ref, len(cos_arr_c))

            return 0

        lib = pqos_mock_cls.return_value.lib
        lib.pqos_l3ca_get = MagicMock(side_effect=pqos_l3ca_get_mock)

        l3ca = PqosCatL3()

        with patch('pqos.l3ca.PqosCap') as PqosCapMock:
            PqosCapMock.return_value.get_l3ca_cos_num.return_value = 2
            coses = l3ca.get(1)

        lib.pqos_l3ca_get.assert_called_once()

        self.assertEqual(len(coses), 2)
        self.assertEqual(coses[0].class_id, 0)
        self.assertEqual(coses[0].mask, 0x01fe)
        self.assertEqual(coses[1].class_id, 1)
        self.assertEqual(coses[1].mask, 0x003f)

    @patch('pqos.l3ca.Pqos')
    def test_get_min_cbm_bits(self, pqos_mock_cls):
        "Tests get_min_cbm_bits() method."

        def pqos_l3ca_get_min_cbm_bits_mock(min_cbm_bits_ref):
            "Mock pqos_l3ca_get_min_cbm_bits()."

            ctypes_ref_set_int(min_cbm_bits_ref, 2)
            return 0

        lib = pqos_mock_cls.return_value.lib
        func_mock = MagicMock(side_effect=pqos_l3ca_get_min_cbm_bits_mock)
        lib.pqos_l3ca_get_min_cbm_bits = func_mock

        l3ca = PqosCatL3()
        min_bits = l3ca.get_min_cbm_bits()

        self.assertEqual(min_bits, 2)
