Python interface for Intel(R) RDT PQoS library
==============================================

[![Coverity Status](https://scan.coverity.com/projects/intel-cmt-cat/badge.svg)](https://scan.coverity.com/projects/intel-cmt-cat)
[![License](https://img.shields.io/badge/Licence-BSD%203--Clause-blue)](https://github.com/intel/intel-cmt-cat/blob/master/lib/python/LICENSE)

Contents
--------
* Overview
* Installation
* Running tests
* Legal Disclaimer

Overview
--------
This a Python interface for PQoS library. This wrapper requires Python 3.x
and libpqos installed in the system. The package is named 'pqos'.

Installation
------------
To build the package:
```
pip install build
python -m build
```

Once the package is built, it can be installed by running:
```
pip install dist/pqos-<VERSION>.tar.gz
```

Running tests
-------------
In order to run unit tests, create coverage report or check coding style
it is required to setup virtual environment first. All of the following commands
will setup it if it has not been created yet. The virtual environment
will be created in `test_env/`.

To setup test environment:
```
make setup-dev
```

To run unit tests:
```
make test
```

After running unit tests, the coverage report can be generated:
```
make coverage
```

To check coding style with pylint run:
```
make style
```

To clear a virtual environment and remove cache files:
```
make clean
```

Legal Disclaimer
----------------
THIS SOFTWARE IS PROVIDED BY INTEL"AS IS". NO LICENSE, EXPRESS OR
IMPLIED, BY ESTOPPEL OR OTHERWISE, TO ANY INTELLECTUAL PROPERTY RIGHTS
ARE GRANTED THROUGH USE. EXCEPT AS PROVIDED IN INTEL'S TERMS AND
CONDITIONS OF SALE, INTEL ASSUMES NO LIABILITY WHATSOEVER AND INTEL
DISCLAIMS ANY EXPRESS OR IMPLIED WARRANTY, RELATING TO SALE AND/OR
USE OF INTEL PRODUCTS INCLUDING LIABILITY OR WARRANTIES RELATING TO
FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR INFRINGEMENT
OF ANY PATENT, COPYRIGHT OR OTHER INTELLECTUAL PROPERTY RIGHT.
