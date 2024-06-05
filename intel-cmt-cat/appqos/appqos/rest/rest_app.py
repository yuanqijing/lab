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
REST API module
APPs
"""

from copy import deepcopy
from flask_restful import Resource, request

import jsonschema

from appqos import pid_ops
from appqos.config_store import ConfigStore
from appqos.power import AdmissionControlError
from appqos.rest.rest_exceptions import NotFound, BadRequest
from appqos.pqos_api import PQOS_API
from appqos.stats import STATS_STORE

class App(Resource):
    """
    Handle /apps/<app_id> HTTP requests
    """


    @staticmethod
    def get(app_id):
        """
        Handles HTTP GET /apps/<app_id> request.
        Retrieve single app
        Raises NotFound, BadRequest

        Parameters:
            app_id: Id of app to retrieve

        Returns:
            response, status code
        """

        data = ConfigStore.get_config()
        if 'apps' not in data:
            raise NotFound("No apps in config file")

        try:
            app = data.get_app(int(app_id))
            app['pool_id'] = data.app_to_pool(int(app_id))
        except:
            # pylint: disable=raise-missing-from
            raise NotFound(f"APP {app_id} not found in config")

        return app, 200


    @staticmethod
    def delete(app_id):
        """
        Handles HTTP DELETE /apps/<app_id> request.
        Deletes single App
        Raises NotFound, BadRequest

        Parameters:
            app_id: Id of app to delete

        Returns:
            response, status code
        """

        data = deepcopy(ConfigStore.get_config())
        if 'apps' not in data or 'pools' not in data:
            raise NotFound("No apps or pools in config file")

        for app in data['apps']:
            if app['id'] != int(app_id):
                continue

            # remove app id from pool
            for pool in data['pools']:
                if 'apps' not in pool:
                    continue

                if app['id'] in pool['apps']:
                    pool['apps'].remove(app['id'])
                    break

            # remove app
            data['apps'].remove(app)
            ConfigStore.set_config(data)

            res = {'message': f"APP {app_id} deleted" }
            return res, 200

        raise NotFound(f"APP {app_id} not found in config")


    @staticmethod
    def put(app_id):
        # pylint: disable=too-many-branches

        """
        Handles HTTP PUT /apps/<app_id> request.
        Modifies an App (e.g.: moves to different pool)
        Raises NotFound, BadRequest

        Parameters:
            app_id: Id of app to modify

        Returns:
            response, status code
        """

        json_data = request.get_json()

        # validate app schema
        try:
            schema, resolver = ConfigStore.load_json_schema('modify_app.json')
            jsonschema.validate(json_data, schema, resolver=resolver)
        except (jsonschema.ValidationError, OverflowError) as error:
            raise BadRequest(f"Request validation failed - {error}") from error

        data = deepcopy(ConfigStore.get_config())
        if 'apps' not in data or 'pools' not in data:
            raise NotFound("No apps or pools in config file")

        # move to another pool
        for app in data['apps']:
            if app['id'] != int(app_id):
                continue

            if 'pool_id' in json_data:
                pool_id = json_data['pool_id']

                # remove app id from pool
                for pool in data['pools']:
                    if 'apps' in pool:
                        if app['id'] in pool['apps']:
                            pool['apps'].remove(app['id'])
                            break

                # add app id to new pool
                for pool in data['pools']:
                    if pool['id'] == int(pool_id):
                        if not 'apps' in pool:
                            pool['apps'] = []
                        pool['apps'].append(app['id'])
                        break

            # set new cores
            if 'cores' in json_data:
                app['cores'] = json_data['cores']

            # set new name
            if 'name' in json_data:
                app['name'] = json_data['name']

            # set new PIDs
            if 'pids' in json_data:
                app['pids'] = json_data['pids']

            try:
                ConfigStore().validate(data)
            except AdmissionControlError:
                pass
            except Exception as ex:
                raise BadRequest(f"APP {app_id} not updated, {ex}") from ex

            ConfigStore.set_config(data)
            if 'pool_id' in json_data:
                STATS_STORE.general_stats_inc_apps_moves()

            res = {'message': f"APP {app_id} updated"}
            return res, 200

        raise NotFound(f"APP {app_id} not found in config")


class Apps(Resource):
    """
    Handles /apps HTTP requests
    """


    @staticmethod
    def get():
        """
        Handles HTTP GET /apps request.
        Get all Apps
        Raises NotFound

        Returns:
            response, status code
        """
        data = ConfigStore.get_config()
        if 'apps' not in data or not data['apps']:
            return ([]), 200

        apps = data['apps']

        for app in apps:
            app['pool_id'] = data.app_to_pool(app['id'])

        return (data['apps']), 200


    @staticmethod
    def post():
        # pylint: disable=too-many-branches
        """
        Handles HTTP POST /apps request.
        Add a new App
        Raises NotFound, BadRequest

        Returns:
            response, status code
        """
        json_data = request.get_json()

        # validate app schema
        try:
            schema, resolver = ConfigStore.load_json_schema('add_app.json')
            jsonschema.validate(json_data, schema, resolver=resolver)
        except (jsonschema.ValidationError, OverflowError) as error:
            raise BadRequest(f"Request validation failed - {error}") from error

        data = deepcopy(ConfigStore.get_config())
        if 'apps' not in data:
            data['apps'] = []

        if 'pools' not in data:
            raise NotFound("No pools in config file")

        json_data['id'] = ConfigStore().get_new_app_id()

        if 'pids' in json_data:
            # validate pids
            for pid in json_data['pids']:
                if not pid_ops.is_pid_valid(pid):
                    raise BadRequest(f"New APP not added, invalid PID: {pid}")

        # if pool_id not provided on app creation
        if 'pool_id' not in json_data or not json_data['pool_id']:
            json_data['pool_id'] = None

            # if apps cores list is a subset of existing pool cores list,
            # make existing pool a destination pool for app
            if 'cores' in json_data and json_data['cores']:
                for core in json_data['cores']:
                    if not PQOS_API.check_core(core):
                        raise BadRequest(f"New APP not added, invalid core: {core}")
                for pool in data['pools']:
                    if set(json_data['cores']).issubset(pool['cores']):
                        json_data['pool_id'] = pool['id']
                        break

            # if it is not, make default pool a destination pool
            if json_data['pool_id'] is None:
                json_data['pool_id'] = 0
                if 'cores' in json_data:
                    json_data.pop('cores')

        try:
            pool = data.get_pool(json_data['pool_id'])
        except Exception as ex:
            raise BadRequest(f"New APP not added, {ex}") from ex

        # update pool configuration to include new app
        if not 'apps' in pool:
            pool['apps'] = []
        pool['apps'].append(json_data['id'])

        json_data.pop('pool_id')
        data['apps'].append(json_data)

        try:
            ConfigStore().validate(data)
        except AdmissionControlError:
            pass
        except Exception as ex:
            raise BadRequest(f"New APP not added, {ex}") from ex

        ConfigStore.set_config(data)

        res = {
            'id': json_data['id'],
            'message': f"New APP added to pool {pool['id']}"
        }
        return res, 201
