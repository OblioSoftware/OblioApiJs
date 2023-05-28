import axios, { AxiosInstance } from 'axios';

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

    // public function get($type, $seriesName, $number): array
    // public function cancel($type, $seriesName, $number, $cancel = true): array
    // public function delete($type, $seriesName, $number): array
    // public function collect($seriesName, $number, $collect): array
    // public function nomenclature($type = null, $name = '', array $filters = []): array
    
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
        if (accessToken === undefined) {
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

export class AccessToken implements AccessTokenInterface {
    request_time: number;
    expires_in: number;
    token_type: string;
    access_token: string;

    constructor(data: AccessTokenInterface) {
        this.request_time = data.request_time;
        this.expires_in   = data.expires_in;
        this.token_type   = data.token_type;
        this.access_token = data.access_token;
    }

    toMap(): AccessTokenInterface {
        return {
            'request_time': this.request_time,
            'expires_in': this.expires_in,
            'token_type': this.token_type,
            'access_token': this.access_token
        }
    }
}

export interface AccessTokenHandlerInterface {
    get(): AccessToken;
    set(accessToken: AccessToken): void;
} 

export class AccessTokenHandlerFileStorage implements AccessTokenHandlerInterface {
    accessToken: AccessToken;

    get(): AccessToken {
        return this.accessToken;
    }

    set(accessToken: AccessToken): void {
        this.accessToken = accessToken;
    }
}