import {
  CheckBakongAccountResponse,
  CheckTxByMD5Response,
  GenerateDeepLinkRequest,
  GenerateDeepLinkResponse,
  RenewTokenResponse,
} from './fetch.type'
import { validator } from './validator'

export type FetchOption = {
  baseURL: string
  authToken?: string
}

class FetchAPI {
  option: FetchOption = { baseURL: '', authToken: '' }

  constructor(option: FetchOption) {
    this.option.baseURL = option.baseURL
    this.option.authToken = option.authToken
  }

  headers(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    })

    if (this.option.authToken) {
      headers.append('Authorization', `Bearer ${this.option.authToken}`)
    }
    return headers
  }

  url(path: string): URL {
    return new URL(path, this.option.baseURL)
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.url(path), {
      method: 'GET',
      headers: this.headers(),
      ...options,
    })
    return response.json()
  }

  async post<T>(
    path: string,
    body: unknown,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(this.url(path), {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
      ...options,
    })
    return response.json()
  }

  /**
   * Renew your API token
   * @param email - Your registered email
   */
  async renew_token(email: string) {
    validator(email).email().min(1).max(30).validate()
    return this.post<RenewTokenResponse>('/v1/renew_token', { email })
  }

  /**
   * Check if a Bakong account exists
   * @param bakongAccountID - Bakong account ID to check
   * @see responseCode - `0` if account exists, `1` if account does not exist.
   */
  async check_backong_account(bakongAccountID: string) {
    validator(bakongAccountID).bakongId().min(3).max(50).validate()

    return this.post<CheckBakongAccountResponse>('/v1/check_bakong_account', {
      bakongAccountID,
    })
  }

  async generate_deeplink(input: GenerateDeepLinkRequest) {
    return this.post<GenerateDeepLinkResponse>(
      '/v1/generate_deeplink_by_qr',
      input
    )
  }

  async check_transaction_by_md5(md5: string) {
    return this.post<CheckTxByMD5Response>('/v1/check_transaction_by_md5', {
      md5,
    })
  }

  async check_transaction_by_hash(hash: string) {
    return this.post<CheckTxByMD5Response>('/v1/check_transaction_by_hash', {
      hash,
    })
  }

  async check_transaction_by_short_hash(shortHash: string) {
    return this.post<CheckTxByMD5Response>(
      '/v1/check_transaction_by_short_hash',
      { shortHash }
    )
  }

  async check_transaction_by_instruction_ref(instructionRef: string) {
    return this.post<CheckTxByMD5Response>(
      '/v1/check_transaction_by_instruction_ref',
      { instructionRef }
    )
  }

  async check_transaction_by_external_ref(externalRef: string) {
    return this.post<CheckTxByMD5Response>(
      '/v1/check_transaction_by_external_ref',
      { externalRef }
    )
  }

  async check_transaction_by_md5_list(md5List: string[]) {
    return this.post<CheckTxByMD5Response>(
      '/v1/check_transaction_by_md5_list',
      { md5List }
    )
  }

  async check_transaction_by_hash_list(hashList: string[]) {
    return this.post<CheckTxByMD5Response>(
      '/v1/check_transaction_by_hash_list',
      { hashList }
    )
  }
}

const createFetch = (option: FetchOption) => new FetchAPI(option)

export default createFetch

const api = createFetch({
  baseURL: 'https://api.example.com',
  authToken: 'your_token_here',
})
