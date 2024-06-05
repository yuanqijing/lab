/*
 * BSD LICENSE
 *
 * Copyright(c) 2020-2023 Intel Corporation. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in
 *     the documentation and/or other materials provided with the
 *     distribution.
 *   * Neither the name of Intel Corporation nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#ifndef MOCK_CAP_H_
#define MOCK_CAP_H_

#include "pqos.h"

int __wrap__pqos_check_init(const int expect);
const struct pqos_sysconfig *__wrap__pqos_get_sysconfig(void);
const struct pqos_cap *__wrap__pqos_get_cap(void);
const struct pqos_cpuinfo *__wrap__pqos_get_cpu(void);
const struct pqos_devinfo *__wrap__pqos_get_dev(void);
const struct pqos_cap *__real__pqos_get_cap(void);
const struct pqos_cpuinfo *__real__pqos_get_cpu(void);
enum pqos_interface __real__pqos_get_inter(void);
enum pqos_interface __wrap__pqos_get_inter(void);
void __wrap__pqos_cap_l3cdp_change(const enum pqos_cdp_config cdp);
void __wrap__pqos_cap_l2cdp_change(const enum pqos_cdp_config cdp);
void __wrap__pqos_cap_mba_change(const enum pqos_mba_config cfg);
int __wrap_pqos_sysconfig_get(const struct pqos_sysconfig **sysconf);
enum pqos_interface __wrap__pqos_get_inter(void);

/* static functions declaration */
int _pqos_api_init(void);
int _pqos_api_exit(void);
const char *_cap_interface_to_string(enum pqos_interface interface);
int cap_l2ca_discover(struct pqos_cap_l2ca **r_cap,
                      const struct pqos_cpuinfo *cpu,
                      const enum pqos_interface iface);
int cap_l3ca_discover(struct pqos_cap_l3ca **r_cap,
                      const struct pqos_cpuinfo *cpu,
                      const enum pqos_interface iface);
int cap_mba_discover(struct pqos_cap_mba **r_cap,
                     const struct pqos_cpuinfo *cpu,
                     const enum pqos_interface iface);
int discover_interface(enum pqos_interface requested_interface,
                       enum pqos_interface *interface);
int discover_capabilities(struct pqos_cap **p_cap,
                          const struct pqos_cpuinfo *cpu,
                          enum pqos_interface inter);
void _pqos_set_inter(const enum pqos_interface iface);

#endif /* MOCK_CAP_H_ */
