import { PartialType } from '@nestjs/swagger';
import { CreateSessionsTypeDto } from './create-sessions_type.dto';

export class UpdateSessionsTypeDto extends PartialType(CreateSessionsTypeDto) {}
