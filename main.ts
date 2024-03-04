import OblioApi from './src/Api.js';
import * as dotenv from 'dotenv';

dotenv.config({path: './.env'})

const data = {
    'cif'               : process.env.CIF,
    'client'            : {
        'cif'          : '1111',
        'name'         : 'CONCEPT SA',
        'rc'           : '',
        'code'         : '',
        'address'      : '',
        'state'        : 'Bucuresti',
        'city'         : 'Sector 2',
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
    'seriesName'        : process.env.SERIES_NAME,
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

try {
    const api = new OblioApi(process.env.API_EMAIL || '', process.env.API_SECRET || '');
    api.setCif(process.env.CIF || '');
    // api.get('invoice', process.env.SERIES_NAME || '', 300)
    //     .then((response) => console.log(response))
    //     .catch((error) => console.log(error));
    api.list('invoice', {
        
    })
        .then((response) => console.log(response))
        .catch((error) => console.log(error));//*/
} catch (e) {
    console.log(e);
}