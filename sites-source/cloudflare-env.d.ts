declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    CHECKOUT_ESSENTIALS_MONTHLY_URL?: string;
    CHECKOUT_ESSENTIALS_YEARLY_URL?: string;
    CHECKOUT_PRO_MONTHLY_URL?: string;
    CHECKOUT_PRO_YEARLY_URL?: string;
  }
}
