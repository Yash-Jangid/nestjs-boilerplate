import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AllConfigType } from '../../config/config.type';

@Injectable()
export class N8nOriginGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Check header for origin, referer, or explicit custom n8n-host header
    const clientOrigin =
      request.headers['origin'] ||
      request.headers['referer'] ||
      request.headers['x-n8n-host'] ||
      '';

    if (!clientOrigin) {
      throw new ForbiddenException(
        'Missing Origin, Referer, or x-n8n-host header. Requests must originate from an authorized instance.',
      );
    }

    const allowedOriginsStr = this.configService.get(
      'app.mongoAllowedOrigins',
      { infer: true },
    );

    if (!allowedOriginsStr) {
      throw new ForbiddenException(
        'Server misconfiguration: MONGO_ALLOWED_ORIGINS is not set.',
      );
    }

    const allowedOrigins = allowedOriginsStr
      .split(',')
      .map((o: string) => o.trim());

    // Extract hostname to allow robust matching
    let hostname = '';
    try {
      const originStr = Array.isArray(clientOrigin)
        ? clientOrigin[0]
        : clientOrigin;
      const url = new URL(
        originStr.startsWith('http') ? originStr : `https://${originStr}`,
      );
      hostname = url.hostname;
    } catch {
      hostname = Array.isArray(clientOrigin) ? clientOrigin[0] : clientOrigin;
    }

    const isAllowed = allowedOrigins.some((allowed: string) => {
      // Support *.zynithic.com syntax
      if (allowed.startsWith('*.')) {
        const baseDomain = allowed.substring(2); // "zynithic.com"
        return hostname === baseDomain || hostname.endsWith(`.${baseDomain}`);
      }
      return hostname === allowed;
    });

    if (!isAllowed) {
      throw new ForbiddenException(
        `Origin '${hostname}' is not authorized to access the Mongo proxy.`,
      );
    }

    return true;
  }
}
