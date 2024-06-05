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
Unit tests for rest module POOLs
"""

import json
from jsonschema import validate
import mock
import pytest

import appqos.common

from rest_common import get_config, get_config_mba_bw, load_json_schema, get_max_cos_id, REST, get_config_empty, CONFIG


class TestPoolsGet:
    def test_get(self):

        def get_pools():
            response = REST.get("/pools")

            data = json.loads(response.data.decode('utf-8'))
            assert response.status_code == 200

            # validate get all pools response schema
            schema, resolver = load_json_schema('get_pool_all_response.json')
            validate(data, schema, resolver=resolver)

            # assert 4 pools are returned
            # structure, types and required fields are validated using schema
            assert len(data) == len(CONFIG['pools'])

        for get_config_mock in [get_config, get_config_mba_bw]:
            with mock.patch('appqos.config_store.ConfigStore.get_config', new=get_config_mock):
                get_pools()


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config_empty)
    def test_get_empty(self):
        response = REST.get("/pools")
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 404
        assert "No pools in config" in data["message"]


class TestPoolGet:
    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    def test_get_invalid_id(self):
        response = REST.get("/apps/5")
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 404
        assert "not found in config" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    def test_get(self):
        def get_pool_3():
            response = REST.get("/pools/3")
            data = json.loads(response.data.decode('utf-8'))

            assert response.status_code == 200

            # validate get 1 pool response schema
            schema, resolver = load_json_schema('get_pool_response.json')
            validate(data, schema, resolver=resolver)

            # assert 1 pool is returned
            # structure, types and required fields are validated using schema
            assert data['id'] == 3

        for get_config_mock in [get_config, get_config_mba_bw]:
            with mock.patch('appqos.config_store.ConfigStore.get_config', new=get_config_mock):
                get_pool_3()


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config_empty)
    def test_get_empty(self):
        response = REST.get("/pools/5")
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 404
        assert "No pools in config" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    def test_get_invalid_id(self):
        response = REST.get("/pools/5")
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 404
        assert "not found in config" in data["message"]


class TestPoolDelete:
    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    def test_delete(self):
        def set_config(data):
            for pool in data['pools']:
                assert pool['id'] != 3

        with mock.patch('appqos.config_store.ConfigStore.set_config', side_effect=set_config) as func_mock:
            response = REST.delete("/pools/3")
            func_mock.assert_called_once()

        assert response.status_code == 200


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    def test_delete_invalid_id(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.delete("/pools/10")
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        # assert 0 apps are returned
        assert response.status_code == 404
        assert "POOL 10 not found in config" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    def test_delete_default(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.delete("/pools/0")
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        # assert 0 apps are returned
        assert response.status_code == 400
        assert "is Default, cannot delete" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    def test_delete_not_empty(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.delete("/pools/1")
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        # assert 0 apps are returned
        assert response.status_code == 400
        assert "POOL 1 is not empty" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config_empty)
    def test_delete_empty_config(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.delete("/pools/1")
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 404
        assert "No pools in config" in data["message"]


class TestPoolPut:
    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config_empty)
    def test_put_empty_config(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.put("/pools/1", {"cbm": "0xc"})
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 404
        assert "No pools in config" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    def test_put_cbm(self):
        def set_config(data):
            for pool in data['pools']:
                if pool['id'] == 1:
                    assert pool['l3cbm'] == 0xc

        with mock.patch('appqos.config_store.ConfigStore.set_config', side_effect=set_config) as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.put("/pools/1", {"l3cbm": "0xc"})
            func_mock.assert_called_once()

        assert response.status_code == 200


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    def test_put_l2cbm(self):
        def set_config(data):
            for pool in data['pools']:
                if pool['id'] == 1:
                    assert pool['l2cbm'] == 0xff

        with mock.patch('appqos.config_store.ConfigStore.set_config', side_effect=set_config) as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.put("/pools/1", {"l2cbm": "0xff"})
            func_mock.assert_called_once()

        assert response.status_code == 200

    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=False))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    def test_put_cbm_unsupported(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.put("/pools/0", {"cbm": 0x1})
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 400
        assert "System does not support CAT" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    def test_put_mba(self):
        def set_config(data):
            for pool in data['pools']:
                if pool['id'] == 1:
                    assert pool['mba'] == 30

        with mock.patch('appqos.config_store.ConfigStore.set_config', side_effect=set_config) as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.put("/pools/1", {"mba": 30})
            func_mock.assert_called_once()

        assert response.status_code == 200


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=False))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    @pytest.mark.parametrize("pool_config", [
        {"mba": 30},        # MBA not supported
        {"mba_bw": 3000}    # MBA not supported
    ])
    def test_put_mba_unsupported(self, pool_config):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.put("/pools/0", pool_config)
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 400
        assert "System does not support MBA" in data["message"]

    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_bw_enabled", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    def test_put_mba_mba_bw_enabled(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.put("/pools/0", {"mba": 50})
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 400
        assert "MBA RATE is disabled" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config_mba_bw)
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.config.Config.get_mba_ctrl_enabled", mock.MagicMock(return_value=True))
    @mock.patch("appqos.config.Config.get_rdt_iface", mock.MagicMock(return_value="os"))
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_bw_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_bw_enabled", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    def test_put_mba_bw(self):
        def set_config(data):
            for pool in data['pools']:
                if pool['id'] == 2:
                    assert pool['mba_bw'] == 5000

        with mock.patch('appqos.config_store.ConfigStore.set_config', side_effect=set_config) as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.put("/pools/2", {"mba_bw": 5000})
            func_mock.assert_called_once()

        assert response.status_code == 200


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_bw_enabled", mock.MagicMock(return_value=False))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    @pytest.mark.parametrize("mba_bw_supported", [
        True,
        False
    ])
    def test_put_mba_bw_mba_bw_disabled(self, mba_bw_supported):

        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock,\
                mock.patch("appqos.caps.mba_bw_supported", return_value=mba_bw_supported):
            response = REST.put("/pools/0", {"mba_bw": 3000})
            func_mock.assert_not_called()

            data = json.loads(response.data.decode('utf-8'))
            assert response.status_code == 400

            if not mba_bw_supported:
                assert "MBA CTRL is not supported" in data["message"]
            else:
                assert "MBA CTRL is not enabled" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    def test_put_cores(self):
        def set_config(data):
            for pool in data['pools']:
                if pool['id'] == 2:
                    assert pool['cores'] == [2, 3, 11]

        with mock.patch('appqos.config_store.ConfigStore.set_config', side_effect=set_config) as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.put("/pools/2", {"cores": [2, 3, 11]})
            func_mock.assert_called_once()

        assert response.status_code == 200


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    def test_put_name(self):
        def set_config(data):
            for pool in data['pools']:
                if pool['id'] == 2:
                    assert pool['name'] == "test"

        with mock.patch('appqos.config_store.ConfigStore.set_config', side_effect=set_config) as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.put("/pools/2", {"name": "test"})
            func_mock.assert_called_once()

        assert response.status_code == 200


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    def test_put_duplicate_cores(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.put("/pools/2", {"cores": [1, 2, 3, 11]})
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 400
        assert "already assigned to another pool" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    def test_put_empty_cores(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.put("/pools/2", {"cores": []})
            func_mock.assert_not_called()

        assert response.status_code == 400


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.pqos_api.PQOS_API.get_max_cos_id", new=get_max_cos_id)
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    def test_put_not_exist(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.put("/pools/10", {"cores": [2, 3, 11]})
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 404
        assert "not found in config" in data["message"]


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.config_store.ConfigStore.get_new_pool_id", mock.MagicMock(return_value=5))
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    @pytest.mark.parametrize("pool_config", [
        {"cores":[11, 12], "cbm": "0xf"},
        {"cores":[11, 12], "l2cbm": "0xf"},                                    # no name
        {"name":"hello", "cores":[13, 17], "cbm": "0xf"},                    # cbm string
        {"name":"hello", "cores":[11, 16], "cbm": 3},                        # cbm int
        {"name":"hello_mba", "cores":[6, 7], "mba": 50},                     # mba
        {"name":"hello_mba_cbm", "cores":[14, 18], "mba": 50, "cbm": "0xf0"} # cbm & mba
    ])
    def test_post(self, pool_config):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.post("/pools", pool_config)
            func_mock.assert_called_once()
        data = json.loads(response.data.decode('utf-8'))

        #validate add pool response schema
        schema, resolver = load_json_schema('add_pool_response.json')
        validate(data, schema, resolver=resolver)

        assert response.status_code == 201
        assert data['id'] == 5


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config_mba_bw)
    @mock.patch("appqos.config_store.ConfigStore.get_new_pool_id", mock.MagicMock(return_value=5))
    @mock.patch("appqos.config.Config.get_mba_ctrl_enabled", mock.MagicMock(return_value=True))
    @mock.patch("appqos.config.Config.get_rdt_iface", mock.MagicMock(return_value="os"))
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_bw_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    @pytest.mark.parametrize("pool_config", [
        {"name":"hello_mba", "cores":[6, 7], "mba_bw": 5000},                       # mba_bw
        {"name":"hello_mba_cbm", "cores":[14, 18], "mba_bw": 5000, "l3cbm": "0xf0"} # cbm & mba_bw
    ])
    def test_post_mba_bw(self, pool_config):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.post("/pools", pool_config)
            func_mock.assert_called_once()
        data = json.loads(response.data.decode('utf-8'))

        #validate add pool response schema
        schema, resolver = load_json_schema('add_pool_response.json')
        validate(data, schema, resolver=resolver)

        assert response.status_code == 201
        assert data['id'] == 5


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.config_store.ConfigStore.get_new_pool_id", mock.MagicMock(return_value=5))
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l3_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.cat_l2_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_bw_supported", mock.MagicMock(return_value=True))
    @mock.patch("appqos.caps.mba_bw_enabled", mock.MagicMock(return_value=False))
    @mock.patch("appqos.power.validate_power_profiles", mock.MagicMock(return_value=True))
    @pytest.mark.parametrize("pool_config", [
        {"name":"hello_mba", "cores":[6, 7], "mba_bw": 5000},                     # mba_bw
        {"name":"hello_mba_cbm", "cores":[14, 18], "mba_bw": 5000, "l3cbm": "0xf0"} # cbm & mba_bw
    ])
    def test_post_mba_bw_mba_bw_disabled(self, pool_config):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock,\
             mock.patch('appqos.pid_ops.is_pid_valid', return_value=True):
            response = REST.post("/pools", pool_config)
            func_mock.assert_not_called()
        data = json.loads(response.data.decode('utf-8'))

        assert response.status_code == 400


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.config_store.ConfigStore.get_new_pool_id", mock.MagicMock(return_value=None))
    def test_post_exceed_max_number(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.post("/pools", {"cores":[11, 12], "l3cbm": "0xf"})
            func_mock.assert_not_called()

        assert response.status_code == 500


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @mock.patch("appqos.config_store.ConfigStore.get_new_pool_id", mock.MagicMock(return_value=5))
    @mock.patch("appqos.pqos_api.PQOS_API.check_core", mock.MagicMock(return_value=True))
    def test_post_duplicate_core(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.post("/pools", {"cores":[1, 2, 3], "l3cbm": "0xf"})
            func_mock.assert_not_called()

        assert response.status_code == 400


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    def test_post_unknown_param(self):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.post("/pools", {"cores":[20], "cbm": "0xf", "unknown": 1})
            func_mock.assert_not_called()

        assert response.status_code == 400


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @pytest.mark.parametrize("pool_config", [
        {"cores": "invalid", "cbm": "0xf"},
        {"cores": [20], "cbm": "invalid"},
        {"cores": [20], "mba": "invalid"},
        {"cores": [20], "mba_bw": "invalid"}
    ])
    def test_post_invalid_value(self, pool_config):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.post("/pools", pool_config)
            func_mock.assert_not_called()

        assert response.status_code == 400


    @mock.patch("appqos.config_store.ConfigStore.get_config", new=get_config)
    @pytest.mark.parametrize("no_req_fields_json", [
        {"mba": 10},                                # missing cores
        {"mba_bw": 10},                             # missing cores
        {"cbm": "0xf"},                             # missing cores
        {"mba": 10, "cbm": "0xf"},                  # missing cores
        {"mba_bw": 1000, "cbm": "0xf"},             # missing cores
        {"name":"hello", "mba": 10, "cbm": "0xf"},  # missing cores
        {"name":"el", "mba_bw": 1000, "cbm": "0xf"},# missing cores
        {"name":"hello", "cbm": "0xf"},             # missing cores

        {"cores":[3, 10]},                  # missing at least one alloc technology
        {"name":"hello", "cores":[3, 10]},  # missing at least one alloc technology

        {"name":"hello"},                   # missing at least one alloc technology and cores

        {"cores":[3, 10], "cbm": "0xf", "apps":[1]} # extra property "apps"
    ])
    def test_post_no_req_fields(self, no_req_fields_json):
        with mock.patch('appqos.config_store.ConfigStore.set_config') as func_mock:
            response = REST.post("/pools", no_req_fields_json)
            func_mock.assert_not_called()
        assert response.status_code == 400
