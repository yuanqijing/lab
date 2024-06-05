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

#ifndef MOCK_HW_MONITORING_H_
#define MOCK_HW_MONITORING_H_

#include "hw_monitoring.h"

int __wrap_hw_mon_reset(const struct pqos_mon_config *cfg);
int __wrap_hw_mon_assoc_get_core(const unsigned lcore, pqos_rmid_t *rmid);
int __wrap_hw_mon_assoc_get_channel(const pqos_channel_t channel_id,
                                    pqos_rmid_t *rmid);
int __wrap_hw_mon_assoc_get(const unsigned lcore, pqos_rmid_t *rmid);
int __wrap_hw_mon_start_cores(const unsigned num_cores,
                              const unsigned *cores,
                              const enum pqos_mon_event event,
                              void *context,
                              struct pqos_mon_data *group,
                              const struct pqos_mon_options *opt);
int __wrap_hw_mon_start_channels(const unsigned num_channels,
                                 const pqos_channel_t *channels,
                                 const enum pqos_mon_event event,
                                 void *context,
                                 struct pqos_mon_data *group);
int __wrap_hw_mon_stop(struct pqos_mon_data *group);
int __wrap_hw_mon_poll(struct pqos_mon_data *group,
                       const enum pqos_mon_event event);
int __wrap_hw_mon_start_uncore(const unsigned num_sockets,
                               const unsigned *sockets,
                               const enum pqos_mon_event event,
                               void *context,
                               struct pqos_mon_data **group);

#endif /* MOCK_HW_MONITORING_H_ */
