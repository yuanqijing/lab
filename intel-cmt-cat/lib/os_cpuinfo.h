/*
 * BSD LICENSE
 *
 * Copyright(c) 2021-2023 Intel Corporation. All rights reserved.
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
 *
 */

#ifndef __PQOS_OS_CPUINFO_H__
#define __PQOS_OS_CPUINFO_H__

#include "pqos.h"
#include "types.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Builds CPU topology structure
 *
 * @return Pointer to CPU topology structure
 * @retval NULL on error
 */
PQOS_LOCAL struct pqos_cpuinfo *os_cpuinfo_topology(void);

/**
 * @brief Helper function to get number of numa nodes in the system form
 *        kernel filesystem
 *
 * @return Number of numa nodes in the system
 * @retval -1 if not successful
 */
PQOS_LOCAL int os_cpuinfo_get_numa_num(void);

/**
 * @brief Helper function to get number of sockets in the system
 *
 * @return Number of sockets in the system
 * @retval 0 if not successful
 */

PQOS_LOCAL int os_cpuinfo_get_socket_num(void);

#ifdef __cplusplus
}
#endif

#endif /* __PQOS_OS_CPUINFO_H__ */
