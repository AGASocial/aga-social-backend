import { Injectable } from '@nestjs/common';
import { Pluggin } from './pluggin/entities/pluggin.entity';

@Injectable()
export class AppService {
  getHello(): string {
    return "hello plugin"
  }
}
