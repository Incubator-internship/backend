// src/paypal/paypal.service.ts
import { Injectable } from '@nestjs/common';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalClientService {
  private client: checkoutNodeJssdk.core.PayPalHttpClient;

  constructor() {
    const clientId =
      'AW6UFq0_zfFfhaU0eOtUD9J7mxRv97pjFHo47-06-LlZsB_oUNf_ZtOVQPJ8E1BoQZLUQ83jQeYtMohI';
    const clientSecret =
      'EKsJv3PrIvXA_wUbBXKE8dFcl1UiCgTl6ZMtsGC1g2E4cuHvr29fn-FoZ4almSiHUwQy6KJGT9Grzy7m';

    const environment = new checkoutNodeJssdk.core.SandboxEnvironment(
      clientId,
      clientSecret,
    );
    this.client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);
  }

  getClient(): checkoutNodeJssdk.core.PayPalHttpClient {
    return this.client;
  }
}
