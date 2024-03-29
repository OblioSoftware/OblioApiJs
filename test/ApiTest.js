import assert from 'assert'
import OblioApi from '../lib/es6/Api.js';
import * as dotenv from 'dotenv';

before(() => {
    dotenv.config();
});

describe('OblioApi', function () {
    let invoice;

    it('testCreateInvoice', function (done) {
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
        const api = new OblioApi(process.env.API_EMAIL, process.env.API_SECRET);
        api.createInvoice(data)
            .then((response) => {
                invoice = response.data;
                assert.equal(response.status, 200);
                done();
            })
            .catch((error) => console.log(error));
    });
    it('testGetInvoice', function (done) {
        const api = new OblioApi(process.env.API_EMAIL, process.env.API_SECRET);
        api.setCif(process.env.CIF);
        api.get('invoice', invoice.seriesName, invoice.number)
            .then((response) => {
                assert.equal(response.status, 200);
                done();
            })
            .catch((error) => console.log(error));
    })
    it('testCancelInvoice', function (done) {
        const api = new OblioApi(process.env.API_EMAIL, process.env.API_SECRET);
        api.setCif(process.env.CIF);
        api.cancel('invoice', invoice.seriesName, invoice.number, true)
            .then((response) => {
                assert.equal(response.status, 200);
                done();
            })
            .catch((error) => console.log(error));
    })
    it('testRestoreInvoice', function (done) {
        const api = new OblioApi(process.env.API_EMAIL, process.env.API_SECRET);
        api.setCif(process.env.CIF);
        api.cancel('invoice', invoice.seriesName, invoice.number, false)
            .then((response) => {
                assert.equal(response.status, 200);
                done();
            })
            .catch((error) => console.log(error));
    })
    it('testDeleteInvoice', function (done) {
        const api = new OblioApi(process.env.API_EMAIL, process.env.API_SECRET);
        api.setCif(process.env.CIF);
        api.delete('invoice', invoice.seriesName, invoice.number)
            .then((response) => {
                assert.equal(response.status, 200);
                done();
            })
            .catch((error) => console.log(error));
    })
});
