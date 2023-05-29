import axios, { AxiosInstance } from 'axios';
import * as fs from 'node:fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class OblioApi {
    _cif: string                 = '';
    _email: string               = '';
    _secret: string              = '';
    _accessTokenHandler: any     = null;
    _baseURL: string             = 'https://www.oblio.eu';

    constructor(email: string, secret: string, accessTokenHandler: AccessTokenHandlerInterface = null) {
        this._email = email;
        this._secret = secret;

        if (accessTokenHandler === null) {
            accessTokenHandler = new AccessTokenHandlerFileStorage();
        }
        this._accessTokenHandler = accessTokenHandler;
    }

    async createInvoice(data: Map): Promise<Map> {
        return await this.createDoc('invoice', data);
    }

    async createProforma(data: Map): Promise<Map> {
        return await this.createDoc('proforma', data);
    }

    async createNotice(data: Map): Promise<Map> {
        return await this.createDoc('notice', data);
    }

    async createDoc(type: string, data: Map): Promise<Map> {
        this._checkType(type);
        if (data.cif === undefined && this._cif !== '') {
            data.cif = this._cif;
        }
        if (!('cif' in data) || data.cif === '') {
            throw new OblioApiException('Empty cif');
        }
        let request = await this.buildRequest();
        let response;
        try {
            response = await request.post(`/api/docs/${type}`, data);
        } catch (err) {
            response = err.response;
        }
        this._checkErrorResponse(response);
        return response.data;
    }

    async get(type: string, seriesName: string, number: number): Promise<Map> {
        this._checkType(type);
        let cif = this.getCif();
        let request = await this.buildRequest();
        let response;

        try {
            response = await request.get(`/api/docs/${type}?cif=${cif}&seriesName=${seriesName}&number=${number}`);
        } catch (err) {
            response = err.response;
        }
        this._checkErrorResponse(response);
        return response.data;
    }

    async cancel(type: string, seriesName: string, number: number, cancel = true): Promise<Map> {
        this._checkType(type);
        let cif = this.getCif();
        let request = await this.buildRequest();
        let response;

        try {
            response = await request.put(`/api/docs/${type}/${cancel ? 'cancel' : 'restore'}`, {
                cif: cif,
                seriesName: seriesName,
                number: number
            });
        } catch (err) {
            response = err.response;
        }
        this._checkErrorResponse(response);
        return response.data;
    }

    async delete(type: string, seriesName: string, number: number): Promise<Map> {
        this._checkType(type);
        let cif = this.getCif();
        let request = await this.buildRequest();
        let response;

        try {
            response = await request.delete(`/api/docs/${type}`, {
                data: {
                    cif: cif,
                    seriesName: seriesName,
                    number: number
                }
            });
        } catch (err) {
            response = err.response;
        }
        this._checkErrorResponse(response);
        return response.data;
    }

    // async collect(type: string, seriesName: string, number: number): Promise<Map>
    // async nomenclature(type: string = null, name: string = '', filters: Map = {}): Promise<Map>
    
    setCif(cif: string): void {
        this._cif = cif;
    }

    getCif(): string {
        return this._cif;
    }
    
    async buildRequest(): Promise<AxiosInstance> {
        let accessToken: AccessToken = await this.getAccessToken();
        const request = axios.create({
            baseURL: this._baseURL,
            headers : {
                'Accept'       : 'application/json',
                'Content-Type' : 'application/json',
                'Authorization':  accessToken.token_type + ' ' + accessToken.access_token,
            },
        });
        return request;
    }
    
    async getAccessToken(): Promise<AccessToken> {
        let accessToken: AccessToken = this._accessTokenHandler.get();
        if (accessToken === null) {
            accessToken = await this._generateAccessToken();
            this._accessTokenHandler.set(accessToken);
        }
        return accessToken;
    }

    async _generateAccessToken(): Promise<AccessToken> {
        if (!this._email || !this._secret) {
            throw new OblioApiException('Email or secret are empty!');
        }
        let response = await axios.request({
            method: 'post',
            url: `${this._baseURL}/api/authorize/token`,
            data: {
                'client_id'    : this._email,
                'client_secret': this._secret,
                'grant_type'   : 'client_credentials'
            },
            headers : {
                'Accept'       : 'application/json',
                'Content-Type' : 'application/json',
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new OblioApiException(`Error authorize token! HTTP status: ${response.status}`, response.status);
        }
        return new AccessToken(response.data);
    }

    _checkType(type: string): void {
        if (['invoice', 'proforma', 'notice', 'receipt'].indexOf(type) === -1) {
            throw new OblioApiException('Type not supported');
        }
    }

    _checkErrorResponse(response: Map): void {
        if (response.status < 200 || response.status >= 300) {
            if (!('statusMessage' in response.data)) {
                response.data = {
                    statusMessage: `Error! HTTP response status: ${response.status}`
                };
            }
            throw new OblioApiException(response.data.statusMessage, response.status);
        }
    }
}

export default OblioApi;

interface Map {
    [key: string]: any  
}

export class OblioApiException {
    message: string = '';
    code: number = 0;
    constructor(message: string = '', code: number = 0) {
        this.message = message;
        this.code = code;
    }
}

export interface AccessTokenInterface {
    request_time: number;
    expires_in: number;
    token_type: string;
    access_token: string;
}

export class AccessToken {
    request_time: number;
    expires_in: number;
    token_type: string;
    access_token: string;

    constructor(data: Map) {
        this.request_time = data.request_time;
        this.expires_in   = data.expires_in;
        this.token_type   = data.token_type;
        this.access_token = data.access_token;
    }
}

export interface AccessTokenHandlerInterface {
    get(): AccessToken;
    set(accessToken: AccessToken): void;
} 

export class AccessTokenHandlerFileStorage implements AccessTokenHandlerInterface {
    _accessTokenFilePath: string;

    constructor(accessTokenFilePath: string = null) {
        this._accessTokenFilePath = accessTokenFilePath === null
            ? __dirname + '/../storage/.access_token'
            : accessTokenFilePath;
    }

    get(): AccessToken {
        if (fs.existsSync(this._accessTokenFilePath)) {
            let accessTokenFileContent = JSON.parse(fs.readFileSync(this._accessTokenFilePath, 'utf-8'));
            let accessToken = new AccessToken(accessTokenFileContent);
            if (accessToken.request_time + accessToken.expires_in > (Date.now() * 1000)) {
                return accessToken;
            }
        }
        return null;
    }

    set(accessToken: AccessToken): void {
        fs.mkdir(dirname(this._accessTokenFilePath), {recursive: true}, (err) => {
            if (err) return;

            fs.writeFile(this._accessTokenFilePath, JSON.stringify(accessToken), (err) => {});
        });
    }
}