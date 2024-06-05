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

#ifndef MOCK_HW_ALLOCATION_H_
#define MOCK_HW_ALLOCATION_H_

#include "pqos.h"

int __wrap_hw_alloc_assoc_set(const unsigned lcore, const unsigned class_id);
int __wrap_hw_alloc_assoc_get(const unsigned lcore, unsigned *class_id);
int __wrap_hw_alloc_assign(const unsigned technology,
                           const unsigned *core_array,
                           const unsigned core_num,
                           unsigned *class_id);
int __wrap_hw_alloc_release(const unsigned *core_array,
                            const unsigned core_num);
int __wrap_hw_alloc_reset(const struct pqos_alloc_config *cfg);
int __wrap_hw_l3ca_set(const unsigned l3cat_id,
                       const unsigned num_cos,
                       const struct pqos_l3ca *ca);
int __wrap_hw_l3ca_get(const unsigned l3cat_id,
                       const unsigned max_num_ca,
                       unsigned *num_ca,
                       struct pqos_l3ca *ca);
int __wrap_hw_l3ca_get_min_cbm_bits(unsigned *min_cbm_bits);
int __wrap_hw_l2ca_set(const unsigned l2id,
                       const unsigned num_cos,
                       const struct pqos_l2ca *ca);
int __wrap_hw_l2ca_get(const unsigned l2id,
                       const unsigned max_num_ca,
                       unsigned *num_ca,
                       struct pqos_l2ca *ca);
int __wrap_hw_l2ca_get_min_cbm_bits(unsigned *min_cbm_bits);
int __wrap_hw_mba_set(const unsigned mba_id,
                      const unsigned num_cos,
                      const struct pqos_mba *requested,
                      struct pqos_mba *actual);
int __wrap_hw_mba_get(const unsigned mba_id,
                      const unsigned max_num_cos,
                      unsigned *num_cos,
                      struct pqos_mba *mba_tab);
int __wrap_hw_alloc_assoc_write(const unsigned lcore, const unsigned class_id);
int __real_hw_alloc_assoc_write(const unsigned lcore, const unsigned class_id);
int __wrap_hw_alloc_assoc_read(const unsigned lcore, unsigned *class_id);
int __real_hw_alloc_assoc_read(const unsigned lcore, unsigned *class_id);
int __wrap_hw_alloc_assoc_get_channel(const pqos_channel_t channel,
                                      unsigned *class_id);
int __wrap_hw_alloc_assoc_get_dev(const uint16_t segment,
                                  const uint16_t bdf,
                                  const unsigned vc,
                                  unsigned *class_id);
int __wrap_hw_alloc_assoc_set_channel(const pqos_channel_t channel,
                                      const unsigned class_id);
int __wrap_hw_alloc_assoc_set_dev(const uint16_t segment,
                                  const uint16_t bdf,
                                  const unsigned vc,
                                  const unsigned class_id);
#endif /* MOCK_HW_ALLOCATION_H_ */
