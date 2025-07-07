# OblioApiJs

 ![test workflow](https://github.com/OblioSoftware/OblioApiJs/actions/workflows/node.js.yml/badge.svg)

 Oblio.eu API implementation for NodeJS

## Install

```
npm i @obliosoftware/oblioapi
```

## Use

```javascript
import OblioApi from '@obliosoftware/oblioapi';

const data = {
    'cif'               : '',
    'client'            : {
        'cif'          : '',
        'name'         : '',
        'rc'           : '',
        'code'         : '',
        'address'      : '',
        'state'        : '',
        'city'         : '',
        'country'      : '',
        'iban'         : '',
        'bank'         : '',
        'email'        : '',
        'phone'        : '',
        'contact'      : '',
        'vatPayer'     : '',
    },
    'issueDate'         : (new Date()).toISOString().substring(0, 10),
    'dueDate'           : '',
    'deliveryDate'      : '',
    'collectDate'       : '',
    'seriesName'        : '',
    'collect'           : {},
    'referenceDocument' : {},
    'language'          : 'RO',
    'precision'         : 2,
    'currency'          : 'RON',
    'products'          : [
        {
            'name'         : 'Abonament',
            'code'         : '',
            'description'  : '',
            'price'        : '100',
            'measuringUnit': 'buc',
            'currency'     : 'RON',
            'vatName'      : 'Normala',
            'vatPercentage': 19,
            'vatIncluded'  : true,
            'quantity'     : 2,
            'productType'  : 'Serviciu',
        }
    ],
    'issuerName'        : '',
    'issuerId'          : '',
    'noticeNumber'      : '',
    'internalNote'      : '',
    'deputyName'        : '',
    'deputyIdentityCard': '',
    'deputyAuto'        : '',
    'selesAgent'        : '',
    'mentions'          : '',
    'value'             : 0,
    'workStation'       : 'Sediu',
    'useStock'          : 0,
};

const api = new OblioApi(process.env.API_EMAIL, process.env.API_SECRET);
api.createInvoice(data)
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
```
