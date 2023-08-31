import { PartialType } from '@nestjs/mapped-types';
import { CreatePlugginDto } from './create-pluggin.dto';

export class UpdatePlugginDto extends PartialType(CreatePlugginDto) {

}
