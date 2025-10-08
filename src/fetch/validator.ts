export type ValidationResult =
  | { success: true; error: null }
  | { success: false; errors: string[] }

type Rule = (value: unknown) => string | null

class Validator {
  private value: unknown
  private rules: Rule[] = []

  constructor(value: unknown) {
    this.value = value
  }

  string() {
    this.rules.push((v) => (typeof v === 'string' ? null : 'Not a string'))
    return this
  }

  min(n: number) {
    this.rules.push((v) => {
      if (typeof v === 'string' && v.length < n) {
        return `String too short (min ${n})`
      }
      if (typeof v === 'number' && v < n) {
        return `Number too small (min ${n})`
      }
      return null
    })
    return this
  }

  max(n: number) {
    this.rules.push((v) => {
      if (typeof v === 'string' && v.length > n) {
        return `String too long (max ${n})`
      }
      if (typeof v === 'number' && v > n) {
        return `Number too large (max ${n})`
      }
      return null
    })
    return this
  }

  url() {
    this.rules.push((v) => {
      if (typeof v !== 'string') return 'Not a string'
      try {
        new URL(v)
        return null
      } catch {
        return 'Invalid URL'
      }
    })
    return this
  }

  email() {
    this.rules.push((v) => {
      if (typeof v !== 'string') return 'Not a string'
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : 'Invalid email'
    })
    return this
  }

  bakongId() {
    this.rules.push((v) => {
      if (typeof v !== 'string') return 'Not a string'
      return /^[^@\s]+@[^@\s]+$/.test(v) ? null : 'Invalid Bakong ID'
    })
    return this
  }

  hash() {
    this.rules.push((v) => {
      if (typeof v !== 'string') return 'Not a string'
      return /^[a-fA-F0-9]{64}$/.test(v) ? null : 'Invalid hash'
    })
    return this
  }

  shortHash() {
    this.rules.push((v) => {
      if (typeof v !== 'string') return 'Not a string'
      return /^[a-fA-F0-9]{8}$/.test(v) ? null : 'Invalid short hash'
    })
    return this
  }

  md5() {
    this.rules.push((v) => {
      if (typeof v !== 'string') return 'Not a string'
      return /^[a-fA-F0-9]{32}$/.test(v) ? null : 'Invalid md5'
    })
    return this
  }

  validate(): ValidationResult {
    const errors: string[] = []
    for (const rule of this.rules) {
      const err = rule(this.value)
      if (err) errors.push(err)
    }
    if (errors.length > 0) {
      return { success: false, errors }
    }
    return { success: true, error: null }
  }
}

export function validator(value: unknown) {
  return new Validator(value)
}
