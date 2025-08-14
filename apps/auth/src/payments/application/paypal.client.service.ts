import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalClientService {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const clientId =
      'AW6UFq0_zfFfhaU0eOtUD9J7mxRv97pjFHo47-06-LlZsB_oUNf_ZtOVQPJ8E1BoQZLUQ83jQeYtMohI';
    const clientSecret =
      'EKsJv3PrIvXA_wUbBXKE8dFcl1UiCgTl6ZMtsGC1g2E4cuHvr29fn-FoZ4almSiHUwQy6KJGT9Grzy7m';

    const environment = new paypal.core.SandboxEnvironment(
      clientId,
      clientSecret,
    );
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  getClient(): paypal.core.PayPalHttpClient {
    return this.client;
  }
}